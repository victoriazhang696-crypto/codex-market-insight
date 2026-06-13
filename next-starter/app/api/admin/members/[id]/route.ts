import { NextResponse } from 'next/server';

import { normalizeFeatureExpiries, normalizeFeaturePermissions, type FeatureExpiries, type FeaturePermission } from '@/lib/feature-permissions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: Promise<{ id: string }>;
};

type MemberUpdateBody = {
  fullName?: string;
  phone?: string;
  status?: 'active' | 'expired' | 'disabled';
  computeCredits?: number | string;
  permissions?: FeaturePermission[];
  permissionExpiries?: FeatureExpiries;
};

function normalizeComputeCredits(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return 0;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as MemberUpdateBody;
  const supabase = createSupabaseAdminClient();

  const updates: Record<string, string | number | FeaturePermission[] | FeatureExpiries> = {};

  if (body.fullName !== undefined) updates.full_name = body.fullName.trim();
  if (body.phone !== undefined) updates.phone = body.phone.trim();
  if (body.status !== undefined) updates.status = body.status;
  if (body.computeCredits !== undefined) updates.compute_credits = normalizeComputeCredits(body.computeCredits);
  if (body.permissions !== undefined) updates.feature_permissions = normalizeFeaturePermissions(body.permissions);
  if (body.permissionExpiries !== undefined) updates.feature_expiries = normalizeFeatureExpiries(body.permissionExpiries);

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries, compute_credits')
    .single();

  if (
    error &&
    (
      error.message.toLowerCase().includes('feature_permissions') ||
      error.message.toLowerCase().includes('feature_expiries') ||
      error.message.toLowerCase().includes('compute_credits')
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: '数据库缺少权限或算力字段。请先在 Supabase 重新运行 supabase-driving-school.sql。'
      },
      { status: 500 }
    );
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
    .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries, compute_credits')
    .eq('id', id)
    .single();

  if (
    error &&
    (
      error.message.toLowerCase().includes('feature_permissions') ||
      error.message.toLowerCase().includes('feature_expiries') ||
      error.message.toLowerCase().includes('compute_credits')
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: '数据库缺少权限或算力字段。请先在 Supabase 重新运行 supabase-driving-school.sql。'
      },
      { status: 500 }
    );
  }

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    member: data
  });
}
