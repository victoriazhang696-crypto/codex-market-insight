import { NextResponse } from 'next/server';

import { normalizeFeatureExpiries, normalizeFeaturePermissions, type FeatureExpiries, type FeaturePermission } from '@/lib/feature-permissions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: Promise<{ id: string }>;
};

type MemberUpdateBody = {
  fullName?: string;
  phone?: string;
  expireDate?: string;
  status?: 'active' | 'expired' | 'disabled';
  permissions?: FeaturePermission[];
  permissionExpiries?: FeatureExpiries;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as MemberUpdateBody;
  const supabase = createSupabaseAdminClient();

  const updates: Record<string, string | FeaturePermission[] | FeatureExpiries> = {};

  if (body.fullName !== undefined) updates.full_name = body.fullName.trim();
  if (body.phone !== undefined) updates.phone = body.phone.trim();
  if (body.expireDate !== undefined) updates.expire_date = body.expireDate.trim();
  if (body.status !== undefined) updates.status = body.status;
  if (body.permissions !== undefined) updates.feature_permissions = normalizeFeaturePermissions(body.permissions);
  if (body.permissionExpiries !== undefined) updates.feature_expiries = normalizeFeatureExpiries(body.permissionExpiries);

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries')
    .single();

  if (error && (error.message.toLowerCase().includes('feature_permissions') || error.message.toLowerCase().includes('feature_expiries'))) {
    const { feature_permissions: _featurePermissions, feature_expiries: _featureExpiries, ...legacyUpdates } = updates;
    const legacyResult = await supabase
      .from('profiles')
      .update(legacyUpdates)
      .eq('id', id)
      .select('id, account_number, full_name, phone, expire_date, status')
      .single();

    if (legacyResult.error) {
      return NextResponse.json({ ok: false, message: legacyResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, member: legacyResult.data });
  }

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, member: data });
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries')
    .eq('id', id)
    .single();

  if (error) {
    const fallbackResult = await supabase
      .from('profiles')
      .select('id, account_number, full_name, phone, expire_date, status')
      .eq('id', id)
      .single();

    if (fallbackResult.error) {
      return NextResponse.json({ ok: false, message: fallbackResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      member: fallbackResult.data
    });
  }

  return NextResponse.json({
    ok: true,
    member: data
  });
}
