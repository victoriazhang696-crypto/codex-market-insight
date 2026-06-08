import { NextResponse } from 'next/server';

import { accountNumberToEmail, isEightDigitAccountNumber, normalizePhonePassword } from '@/lib/account';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type MemberCreateBody = {
  accountNumber?: string;
  fullName?: string;
  phone?: string;
  expireDate?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MemberCreateBody;
  const accountNumber = body.accountNumber?.trim() ?? '';
  const fullName = body.fullName?.trim() ?? '';
  const phone = normalizePhonePassword(body.phone ?? '');
  const expireDate = body.expireDate?.trim() ?? '';

  if (!isEightDigitAccountNumber(accountNumber)) {
    return NextResponse.json({ ok: false, message: 'Account number must be 8 digits.' }, { status: 400 });
  }

  if (!fullName) {
    return NextResponse.json({ ok: false, message: 'Full name is required.' }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({ ok: false, message: 'Phone is required.' }, { status: 400 });
  }

  if (!expireDate) {
    return NextResponse.json({ ok: false, message: 'Expire date is required.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const email = accountNumberToEmail(accountNumber);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: phone,
    email_confirm: true
  });

  if (authError) {
    return NextResponse.json({ ok: false, message: authError.message }, { status: 500 });
  }

  const userId = authData.user?.id;

  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Auth user was not created.' }, { status: 500 });
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    account_number: accountNumber,
    full_name: fullName,
    phone,
    email,
    role: 'member',
    expire_date: expireDate,
    status: 'active'
  });

  if (profileError) {
    return NextResponse.json({ ok: false, message: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    member: {
      id: userId,
      accountNumber,
      email,
      password: phone
    }
  });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, account_number, full_name, phone, expire_date, status')
    .eq('role', 'member')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    members: data ?? []
  });
}
