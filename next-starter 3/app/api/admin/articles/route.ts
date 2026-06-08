import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ArticleCreateBody = {
  title?: string;
  content?: string;
  summary?: string;
  riskNotice?: string;
  status?: 'draft' | 'published';
  slug?: string;
};

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const body = (await request.json()) as ArticleCreateBody;
  const title = body.title?.trim() ?? '';
  const content = body.content?.trim() ?? '';
  const status = body.status ?? 'draft';

  if (!title) {
    return NextResponse.json({ ok: false, message: 'Title is required.' }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ ok: false, message: 'Content is required.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const slug = body.slug?.trim() || toSlug(title);

  const { data, error } = await supabase.from('articles').insert({
    title,
    slug,
    content,
    summary: body.summary?.trim() || null,
    risk_notice: body.riskNotice?.trim() || null,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null
  }).select('id, title, slug, status').single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, article: data });
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, status')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    articles: data ?? []
  });
}
