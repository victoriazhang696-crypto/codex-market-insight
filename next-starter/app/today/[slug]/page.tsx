import { getArticleBySlug } from '@/lib/content';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TodayArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">今日洞察详情</p>
          <h1>文章不存在或尚未发布</h1>
          <p className="lede">请返回今日洞察查看已发布内容。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">今日洞察详情</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/">返回首页</a>
          <a className="secondary-link" href="/today">今日洞察</a>
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
