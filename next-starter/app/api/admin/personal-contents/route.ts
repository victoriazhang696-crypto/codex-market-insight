import { NextResponse } from 'next/server';

import { normalizeFeaturePermissions, type FeaturePermission } from '@/lib/feature-permissions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const DRIVING_SCHOOL_CONTENT_COST = 88;

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

function normalizeCredits(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
}

async function deductComputeCredits(supabase: ReturnType<typeof createSupabaseAdminClient>, targetUserId: string, amount: number) {
  const { data: member, error: memberError } = await supabase
    .from('profiles')
    .select('compute_credits')
    .eq('id', targetUserId)
    .single();

  if (memberError) {
    if (memberError.message.toLowerCase().includes('compute_credits')) {
      throw new Error('数据库缺少 profiles.compute_credits 字段，请先在 Supabase 重新运行 supabase-driving-school.sql。');
    }

    throw new Error(memberError.message);
  }

  const currentCredits = normalizeCredits(member?.compute_credits);

  if (currentCredits < amount) {
    throw new Error(`该客户算力不足，当前 ${currentCredits}，本次需要 ${amount}。`);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ compute_credits: currentCredits - amount })
    .eq('id', targetUserId)
    .select('compute_credits')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeCredits(data?.compute_credits);
}

async function refundComputeCredits(supabase: ReturnType<typeof createSupabaseAdminClient>, targetUserId: string, amount: number) {
  const { data: member } = await supabase
    .from('profiles')
    .select('compute_credits')
    .eq('id', targetUserId)
    .single();

  const currentCredits = normalizeCredits(member?.compute_credits);
  await supabase
    .from('profiles')
    .update({ compute_credits: currentCredits + amount })
    .eq('id', targetUserId);
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const [membersResult, contentsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, account_number, full_name, phone, expire_date, status, feature_permissions, feature_expiries, compute_credits')
      .eq('role', 'member')
      .order('created_at', { ascending: false }),
    supabase
      .from('personal_contents')
      .select('id, service_key, target_user_id, title, body, content_type, attachment_url, compute_cost, status, created_at, updated_at, profiles:target_user_id(account_number, full_name)')
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

  const computeCost = status === 'published' ? DRIVING_SCHOOL_CONTENT_COST : 0;
  let remainingCredits: number | null = null;

  try {
    if (computeCost > 0) {
      remainingCredits = await deductComputeCredits(supabase, targetUserId, computeCost);
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : '算力扣除失败。' },
      { status: 400 }
    );
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
      compute_cost: computeCost,
      status
    })
    .select('id, title, status, compute_cost')
    .single();

  if (error) {
    if (computeCost > 0) {
      await refundComputeCredits(supabase, targetUserId, computeCost);
    }

    if (error.message.toLowerCase().includes('compute_cost')) {
      return NextResponse.json(
        { ok: false, message: '数据库缺少 personal_contents.compute_cost 字段，请先在 Supabase 重新运行 supabase-driving-school.sql。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data, computeCost, remainingCredits });
}
