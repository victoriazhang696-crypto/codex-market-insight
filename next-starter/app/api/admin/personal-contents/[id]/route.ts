import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const DRIVING_SCHOOL_CONTENT_COST = 88;

type Params = {
  params: Promise<{ id: string }>;
};

type PersonalContentUpdateBody = {
  targetUserId?: string;
  title?: string;
  body?: string;
  contentType?: string;
  attachmentUrl?: string;
  status?: 'draft' | 'published' | 'hidden';
};

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

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as PersonalContentUpdateBody;

  const updates: Record<string, string | number | null> = {};

  if (body.targetUserId !== undefined) updates.target_user_id = body.targetUserId.trim();
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.body !== undefined) updates.body = body.body.trim();
  if (body.contentType !== undefined) updates.content_type = body.contentType.trim() || '定制内容';
  if (body.attachmentUrl !== undefined) updates.attachment_url = body.attachmentUrl.trim() || null;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: '没有需要更新的内容。' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from('personal_contents')
    .select('target_user_id, status, compute_cost')
    .eq('id', id)
    .single();

  if (existingError) {
    if (existingError.message.toLowerCase().includes('compute_cost')) {
      return NextResponse.json(
        { ok: false, message: '数据库缺少 personal_contents.compute_cost 字段，请先在 Supabase 重新运行 supabase-driving-school.sql。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: false, message: existingError.message }, { status: 500 });
  }

  const nextTargetUserId = body.targetUserId?.trim() || String(existing.target_user_id);
  const shouldCharge =
    body.status === 'published' &&
    existing.status !== 'published' &&
    normalizeCredits(existing.compute_cost) === 0;
  const computeCost = shouldCharge ? DRIVING_SCHOOL_CONTENT_COST : 0;
  let remainingCredits: number | null = null;

  if (shouldCharge) {
    try {
      remainingCredits = await deductComputeCredits(supabase, nextTargetUserId, computeCost);
      updates.compute_cost = computeCost;
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : '算力扣除失败。' },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from('personal_contents')
    .update(updates)
    .eq('id', id)
    .select('id, title, status, compute_cost')
    .single();

  if (error) {
    if (shouldCharge) {
      await refundComputeCredits(supabase, nextTargetUserId, computeCost);
    }

    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data, computeCost, remainingCredits });
}
