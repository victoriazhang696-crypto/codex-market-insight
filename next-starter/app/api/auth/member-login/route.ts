import { NextResponse } from 'next/server';

import { accountNumberToEmail, isEightDigitAccountNumber, normalizePhonePassword } from '@/lib/account';
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

  const requestCookies = new Map<string, string>();
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      accountNumber
    }
  });

  for (const cookie of cookieResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}
