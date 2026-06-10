import { NextResponse } from 'next/server';

import { adminAccountNumberToEmail, isEightDigitAccountNumber } from '@/lib/account';
import { getRequestCookieMap, jsonWithRouteCookies } from '@/lib/supabase/route-cookies';
import { createSupabaseRouteClient } from '@/lib/supabase/route-client';

type AdminLoginBody = {
  accountNumber?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AdminLoginBody;
  const accountNumber = body.accountNumber?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const password = body.password?.trim() ?? '';
  const cookieResponse = NextResponse.next();
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

  if ((!accountNumber && !email) || !password) {
    return NextResponse.json({ ok: false, message: 'Admin account and password are required.' }, { status: 400 });
  }

  if (accountNumber && !isEightDigitAccountNumber(accountNumber)) {
    return NextResponse.json({ ok: false, message: '管理员账号必须是8位数字。' }, { status: 400 });
  }

  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: accountNumber ? adminAccountNumberToEmail(accountNumber) : email,
    password
  });

  if (error) {
    return jsonWithRouteCookies({ ok: false, message: error.message }, cookieResponse, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return jsonWithRouteCookies({ ok: false, message: 'Not an admin account.' }, cookieResponse, { status: 403 });
  }

  return jsonWithRouteCookies({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  }, cookieResponse);
}
