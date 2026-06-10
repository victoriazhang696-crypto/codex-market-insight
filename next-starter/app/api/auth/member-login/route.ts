import { NextResponse } from 'next/server';

import { accountNumberToEmail, isEightDigitAccountNumber, normalizePhonePassword } from '@/lib/account';
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

  return jsonWithRouteCookies({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      accountNumber
    }
  }, cookieResponse);
}
