import { getPublishedArticlesByCategory } from '@/lib/content';

export default async function TodayPage() {
  const articles = await getPublishedArticlesByCategory('market_today');
  const article = articles[0];

  if (!article) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">今日洞察</p>
          <h1>暂无已发布洞察</h1>
          <p className="lede">管理员发布文章后，会员会在这里看到最新内容。</p>
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
        <p className="eyebrow">今日洞察</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="primary-link" href={`/today/${article.slug}`}>查看全文</a>
          <a className="secondary-link" href="/history">查看历史洞察</a>
          <a className="secondary-link" href="/">返回首页</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>核心要点</h2>
        <div className="stack-list">
          {[article.content, article.riskNotice].map((point) => (
            <article key={point} className="stack-item">
              <strong>{point}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
