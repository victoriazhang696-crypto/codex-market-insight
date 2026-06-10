import { NextResponse } from 'next/server';

import { normalizeFeaturePermissions, type FeaturePermission } from '@/lib/feature-permissions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type PersonalContentCreateBody = {
  serviceKey?: FeaturePermission;
  targetUserId?: string;
  title?: string;
  body?: string;
  contentType?: string;
  attachmentUrl?: string;
  status?: 'draft' | 'published' | 'hidden';
};

function canUseDrivingSchool(row: Record<string, unknown>) {
  return normalizeFeaturePermissions(row.feature_permissions).includes('driving_school');
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const [membersResult, contentsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries')
      .eq('role', 'member')
      .order('created_at', { ascending: false }),
    supabase
      .from('personal_contents')
      .select('id, service_key, target_user_id, title, body, content_type, attachment_url, status, created_at, updated_at, profiles:target_user_id(account_number, full_name)')
      .eq('service_key', 'driving_school')
      .order('created_at', { ascending: false })
  ]);

  if (membersResult.error) {
    return NextResponse.json({ ok: false, message: membersResult.error.message }, { status: 500 });
  }

  if (contentsResult.error) {
    return NextResponse.json({
      ok: true,
      members: (membersResult.data ?? []).filter((row) => canUseDrivingSchool(row)),
      contents: [],
      message: contentsResult.error.message
    });
  }

  return NextResponse.json({
    ok: true,
    members: (membersResult.data ?? []).filter((row) => canUseDrivingSchool(row)),
    contents: contentsResult.data ?? []
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as PersonalContentCreateBody;
  const serviceKey = body.serviceKey ?? 'driving_school';
  const targetUserId = body.targetUserId?.trim() ?? '';
  const title = body.title?.trim() ?? '';
  const contentBody = body.body?.trim() ?? '';
  const contentType = body.contentType?.trim() || '定制内容';
  const attachmentUrl = body.attachmentUrl?.trim() || null;
  const status = body.status ?? 'published';

  if (serviceKey !== 'driving_school') {
    return NextResponse.json({ ok: false, message: '目前该入口只用于环球驾校专属。' }, { status: 400 });
  }

  if (!targetUserId || !title || !contentBody) {
    return NextResponse.json({ ok: false, message: '请选择客户，并填写标题和内容。' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: member } = await supabase
    .from('profiles')
    .select('id, feature_permissions')
    .eq('id', targetUserId)
    .single();

  if (!member || !canUseDrivingSchool(member)) {
    return NextResponse.json({ ok: false, message: '该客户尚未开通环球驾校专属权限。' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('personal_contents')
    .insert({
      service_key: serviceKey,
      target_user_id: targetUserId,
      title,
      body: contentBody,
      content_type: contentType,
      attachment_url: attachmentUrl,
      status
    })
    .select('id, title, status')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data });
}
