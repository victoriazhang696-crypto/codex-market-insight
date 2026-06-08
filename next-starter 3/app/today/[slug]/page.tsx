import { getArticleBySlug } from '@/lib/content';

type Params = {
  params: {
    slug: string;
  };
};

export default async function TodayArticlePage({ params }: Params) {
  const article = await getArticleBySlug(params.slug);

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">今日洞察详情</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/today">返回今日洞察</a>
          <a className="secondary-link" href="/admin/articles/gold-dollar">后台编辑</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>正文</h2>
        <p>{article.content}</p>
        <div className="helper-box">
          <p className="subtle">{article.riskNotice}</p>
        </div>
      </section>
    </main>
  );
}
