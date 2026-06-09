import { getArticlePreviewBlocks } from '@/lib/article-format';
import { getPublishedArticlesByCategory } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';

export default async function TodayPage() {
  const canAccess = await canCurrentMemberAccess('market_today');
  if (!canAccess) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">今日洞察</p>
          <h1>该栏目暂未开通</h1>
          <p className="lede">请联系顾问开通市场洞察权限。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

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

  const previewBlocks = getArticlePreviewBlocks(article.content);

  return (
    <main className="page-shell">
      <section className="hero-card dark article-hero">
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
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>核心预览</h2>
          </div>
          <span className="subtle">点击查看全文阅读完整内容</span>
        </div>
        <div className="article-preview-list">
          {previewBlocks.map((block, index) => (
            <article key={`${block.heading ?? 'block'}-${index}`} className="article-preview-card">
              {block.heading ? <h3>{block.heading}</h3> : null}
              <p>{block.body}</p>
            </article>
          ))}
          {article.riskNotice ? (
            <article className="article-risk-card">
              <span>风险提示</span>
              <strong>{article.riskNotice}</strong>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
