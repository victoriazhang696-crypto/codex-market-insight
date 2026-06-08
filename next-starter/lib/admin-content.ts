import { type ContentArticle } from '@/lib/content';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function mapArticle(row: Record<string, unknown>): ContentArticle {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    summary: String(row.summary ?? ''),
    content: String(row.content ?? ''),
    riskNotice: String(row.risk_notice ?? ''),
    status: row.status === 'draft' ? 'draft' : 'published',
    publishedAt: row.published_at ? String(row.published_at) : undefined
  };
}

export async function getAdminArticleBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, summary, content, risk_notice, status, published_at')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapArticle(data);
}
