import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ContentArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  riskNotice: string;
  status: 'draft' | 'published';
  publishedAt?: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
  publishedAt?: string;
};

const fallbackAnnouncements: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: '本周会员直播复盘将在周五 20:30 开始。',
    body: '主题为黄金、能源与美元路径。',
    status: 'published',
    publishedAt: '2026-06-06T12:00:00Z'
  },
  {
    id: 'ann-2',
    title: '阅读体验升级：新增摘要和风险提示。',
    body: '后续文章页会逐步统一到数据库渲染。',
    status: 'published',
    publishedAt: '2026-06-05T12:00:00Z'
  }
];

function mapArticle(row: Record<string, unknown>): ContentArticle {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    summary: String(row.summary ?? ''),
    content: String(row.content ?? ''),
    riskNotice: String(row.risk_notice ?? row.riskNotice ?? ''),
    status: row.status === 'draft' ? 'draft' : 'published',
    publishedAt: row.published_at ? String(row.published_at) : undefined
  };
}

function mapAnnouncement(row: Record<string, unknown>): AnnouncementItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    status: row.status === 'draft' ? 'draft' : 'published',
    publishedAt: row.published_at ? String(row.published_at) : undefined
  };
}

export async function getPublishedArticles() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data.map((row) => mapArticle(row));
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  const articles = await getPublishedArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getAnyArticleBySlug(slug: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, published_at')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const articles = await getPublishedArticles();
      return articles.find((article) => article.slug === slug) ?? null;
    }

    return mapArticle(data);
  } catch {
    const articles = await getPublishedArticles();
    return articles.find((article) => article.slug === slug) ?? null;
  }
}

export async function getAnnouncements() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, status, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data?.length) {
      return fallbackAnnouncements;
    }

    return data.map((row) => mapAnnouncement(row));
  } catch {
    return fallbackAnnouncements;
  }
}

export async function getDraftArticles() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, published_at')
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data.map((row) => mapArticle(row));
  } catch {
    return [];
  }
}
