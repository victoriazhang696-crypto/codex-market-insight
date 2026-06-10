import { NextResponse } from 'next/server';

import { accountNumberToEmail, isEightDigitAccountNumber, normalizePhonePassword } from '@/lib/account';
import { isDateActive } from '@/lib/feature-permissions';
import { getRequestCookieMap, jsonWithRouteCookies } from '@/lib/supabase/route-cookies';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

type MemberLoginBody = {
  accountNumber?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MemberLoginBody;
  const accountNumber = body.accountNumber?.trim() ?? '';
  const password = normalizePhonePassword(body.password ?? '');
  const cookieResponse = NextResponse.next();

  if (!isEightDigitAccountNumber(accountNumber)) {
    return NextResponse.json({ ok: false, message: 'Account number must be 8 digits.' }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ ok: false, message: 'Password is required.' }, { status: 400 });
  }

  const requestCookies = getRequestCookieMap(request);
  const supabase = createSupabaseRouteClient(
    request,
    cookieResponse,
    (name) => requestCookies.get(name),
    (name, value) => {
      requestCookies.set(name, value);
      cookieResponse.cookies.set(name, value);
    },
    (name) => {
      requestCookies.delete(name);
      cookieResponse.cookies.set(name, '', { maxAge: 0 });
    }
  );
  const email = accountNumberToEmail(accountNumber);

  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return jsonWithRouteCookies({ ok: false, message: error.message }, cookieResponse, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, expire_date, role')
    .eq('id', data.user.id)
    .single();

  if (!profile || profile.role !== 'member' || profile.status !== 'active') {
    await supabase.auth.signOut();
    return jsonWithRouteCookies({ ok: false, message: '账号状态不可用，请联系顾问处理。' }, cookieResponse, { status: 403 });
  }

  if (!isDateActive(profile.expire_date)) {
    await supabase.auth.signOut();
    return jsonWithRouteCookies({ ok: false, message: '您的阅读权限已到期，请联系顾问续期开通。' }, cookieResponse, { status: 403 });
  }

  return jsonWithRouteCookies({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      accountNumber
    }
  }, cookieResponse);
}
