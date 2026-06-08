import { getAnyArticleBySlug } from '@/lib/content';
import { ArticleEditorForm } from './editor-form';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AdminArticleEditorPage({ params }: Params) {
  const { slug } = await params;
  const article = await getAnyArticleBySlug(slug);

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">文章编辑</p>
        <h1>{article.title}</h1>
        <p className="lede">这里是单篇文章编辑页，后续会接 Supabase 的文章读取和保存。</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/admin/articles">返回文章列表</a>
          <a className="secondary-link" href={`/today/${article.slug}`}>查看前台效果</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>编辑内容</h2>
        <ArticleEditorForm article={article} />
      </section>
    </main>
  );
}
