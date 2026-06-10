import { NextResponse } from 'next/server';

import { isArticleCategory, type ArticleCategory } from '@/lib/article-categories';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ArticleCreateBody = {
  title?: string;
  content?: string;
  summary?: string;
  riskNotice?: string;
  status?: 'draft' | 'published';
  category?: ArticleCategory;
  slug?: string;
};

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createUniqueSlug(supabase: ReturnType<typeof createSupabaseAdminClient>, baseSlug: string) {
  const fallback = `article-${Date.now()}`;
  const base = baseSlug || fallback;
  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .like('slug', `${base}%`);

  if (error) {
    return `${base}-${Date.now()}`;
  }

  const usedSlugs = new Set((data ?? []).map((item) => item.slug));
  if (!usedSlugs.has(base)) {
    return base;
  }

  let counter = 2;
  while (usedSlugs.has(`${base}-${counter}`)) {
    counter += 1;
  }

  return `${base}-${counter}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArticleCreateBody;
    const title = body.title?.trim() ?? '';
    const content = body.content?.trim() ?? '';
    const status = body.status ?? 'draft';
    const category = isArticleCategory(body.category) ? body.category : 'market_today';

    if (!title) {
      return NextResponse.json({ ok: false, message: 'Title is required.' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ ok: false, message: 'Content is required.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const slug = await createUniqueSlug(supabase, body.slug?.trim() || toSlug(title));

    const insertPayload = {
      title,
      slug,
      content,
      summary: body.summary?.trim() || null,
      risk_notice: body.riskNotice?.trim() || null,
      status,
      content_category: category,
      published_at: status === 'published' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase.from('articles').insert(insertPayload).select('id, title, slug, status, content_category').single();

    if (error && error.message.toLowerCase().includes('content_category')) {
      return NextResponse.json(
        {
          ok: false,
          message: '数据库缺少 articles.content_category 字段。请先在 Supabase 重新运行 supabase-driving-school.sql，然后再发布。'
        },
        { status: 500 }
      );
    }

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, article: data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : '文章发布接口发生未知错误。'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, status, content_category')
    .order('updated_at', { ascending: false });

  if (error && error.message.toLowerCase().includes('content_category')) {
    return NextResponse.json(
      {
        ok: false,
        message: '数据库缺少 articles.content_category 字段。请先在 Supabase 重新运行 supabase-driving-school.sql。'
      },
      { status: 500 }
    );
  }

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    articles: data ?? []
  });
}
