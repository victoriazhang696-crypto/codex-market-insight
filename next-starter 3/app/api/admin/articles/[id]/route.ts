import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type Params = {
  params: Promise<{ id: string }>;
};

type ArticleUpdateBody = {
  title?: string;
  content?: string;
  summary?: string;
  riskNotice?: string;
  status?: 'draft' | 'published';
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as ArticleUpdateBody;
  const supabase = createSupabaseAdminClient();

  const updates: Record<string, string> = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.content !== undefined) updates.content = body.content.trim();
  if (body.summary !== undefined) updates.summary = body.summary.trim();
  if (body.riskNotice !== undefined) updates.risk_notice = body.riskNotice.trim();
  if (body.status !== undefined) updates.status = body.status;

  if (body.status === 'published') {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select('id, title, slug, status, published_at')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, article: data });
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, summary, risk_notice, status, published_at')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    article: data
  });
}
