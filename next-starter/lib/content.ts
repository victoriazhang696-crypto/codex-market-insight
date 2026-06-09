import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isArticleCategory, type ArticleCategory } from '@/lib/article-categories';

export { articleCategories, getArticleCategoryLabel, isArticleCategory, type ArticleCategory } from '@/lib/article-categories';

export type ContentArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  riskNotice: string;
  status: 'draft' | 'published';
  category: ArticleCategory;
  publishedAt?: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
  publishedAt?: string;
};

function mapArticle(row: Record<string, unknown>): ContentArticle {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    summary: String(row.summary ?? ''),
    content: String(row.content ?? ''),
    riskNotice: String(row.risk_notice ?? row.riskNotice ?? ''),
    status: row.status === 'draft' ? 'draft' : 'published',
    category: isArticleCategory(row.content_category) ? row.content_category : 'market_today',
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
      .select('id, slug, title, summary, content, risk_notice, status, content_category, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('articles')
        .select('id, slug, title, summary, content, risk_notice, status, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (fallbackError || !fallbackData?.length) {
        return [];
      }

      return fallbackData.map((row) => mapArticle(row));
    }

    if (!data?.length) {
      return [];
    }

    return data.map((row) => mapArticle(row));
  } catch {
    return [];
  }
}

export async function getPublishedArticlesByCategory(category: ArticleCategory) {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.category === category);
}

export async function getPublishedArticlesByCategories(categories: ArticleCategory[]) {
  const allowed = new Set(categories);
  const articles = await getPublishedArticles();
  return articles.filter((article) => allowed.has(article.category));
}

function getMalaysiaDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function getTodayInMalaysia() {
  return getMalaysiaDate(new Date().toISOString());
}

export function isPublishedTodayInMalaysia(article: ContentArticle) {
  if (!article.publishedAt) {
    return false;
  }

  return getMalaysiaDate(article.publishedAt) === getTodayInMalaysia();
}

export async function getTodaysMarketArticles() {
  const articles = await getPublishedArticlesByCategory('market_today');
  return articles.filter((article) => isPublishedTodayInMalaysia(article));
}

export async function getHistoricalMarketArticles() {
  const articles = await getPublishedArticlesByCategories(['market_today', 'market_history']);
  return articles.filter((article) => article.category === 'market_history' || !isPublishedTodayInMalaysia(article));
}

export async function getArticleBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, content_category, published_at')
      .eq('slug', decodedSlug)
      .eq('status', 'published')
      .single();

    if (!error && data) {
      return mapArticle(data);
    }

    const fallbackResult = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, published_at')
      .eq('slug', decodedSlug)
      .eq('status', 'published')
      .single();

    if (!fallbackResult.error && fallbackResult.data) {
      return mapArticle(fallbackResult.data);
    }
  } catch {
    // Fall through to list lookup below.
  }

  const articles = await getPublishedArticles();
  return articles.find((article) => article.slug === decodedSlug || article.slug === slug) ?? null;
}

export async function getAnyArticleBySlug(slug: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, content_category, published_at')
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
      return [];
    }

    return data.map((row) => mapAnnouncement(row));
  } catch {
    return [];
  }
}

export async function getDraftArticles() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, risk_notice, status, content_category, published_at')
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
