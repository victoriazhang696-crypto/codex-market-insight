import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: { id: string };
};

type MemberUpdateBody = {
  fullName?: string;
  phone?: string;
  expireDate?: string;
  status?: 'active' | 'expired' | 'disabled';
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = params;
  const body = (await request.json()) as MemberUpdateBody;
  const supabase = createSupabaseAdminClient();

  const updates: Record<string, string> = {};

  if (body.fullName !== undefined) updates.full_name = body.fullName.trim();
  if (body.phone !== undefined) updates.phone = body.phone.trim();
  if (body.expireDate !== undefined) updates.expire_date = body.expireDate.trim();
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, account_number, full_name, phone, expire_date, status')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, member: data });
}

export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, account_number, full_name, phone, expire_date, status')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    member: data
  });
}
