import { NextResponse } from 'next/server';

import { isArticleCategory, type ArticleCategory } from '@/lib/article-categories';
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
  category?: ArticleCategory;
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
  if (body.category !== undefined && isArticleCategory(body.category)) updates.content_category = body.category;

  if (body.status === 'published') {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select('id, title, slug, status, content_category, published_at')
    .single();

  if (error && error.message.toLowerCase().includes('content_category')) {
    const { content_category: _contentCategory, ...legacyUpdates } = updates;
    const legacyResult = await supabase
      .from('articles')
      .update(legacyUpdates)
      .eq('id', id)
      .select('id, title, slug, status, published_at')
      .single();

    if (legacyResult.error) {
      return NextResponse.json({ ok: false, message: legacyResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, article: legacyResult.data });
  }

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
    .select('id, title, slug, content, summary, risk_notice, status, content_category, published_at')
    .eq('id', id)
    .single();

  if (error) {
    const fallbackResult = await supabase
      .from('articles')
      .select('id, title, slug, content, summary, risk_notice, status, published_at')
      .eq('id', id)
      .single();

    if (fallbackResult.error) {
      return NextResponse.json({ ok: false, message: fallbackResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      article: fallbackResult.data
    });
  }

  return NextResponse.json({
    ok: true,
    article: data
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
