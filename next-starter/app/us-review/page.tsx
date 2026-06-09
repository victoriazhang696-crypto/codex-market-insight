import { getPublishedArticlesByCategory } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';

export default async function UsReviewPage() {
  const canAccess = await canCurrentMemberAccess('us_review');
  if (!canAccess) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">US复盘简报</p>
          <h1>该栏目暂未开通</h1>
          <p className="lede">你的账号目前没有 US 复盘简报权限。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  const articles = await getPublishedArticlesByCategory('us_review');

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">US复盘简报</p>
        <h1>US 市场复盘</h1>
        <p className="lede">这里显示后台发布到“US复盘简报”的会员内容。</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/">返回首页</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <div className="stack-list">
          {articles.length > 0 ? articles.map((item) => (
            <article key={item.id} className="stack-item">
              <div>
                <strong>{item.title}</strong>
                <span className="subtle">{item.publishedAt ?? '已发布'}</span>
              </div>
              <a href={`/today/${item.slug}`}>查看</a>
            </article>
          )) : (
            <article className="stack-item">
              <strong>暂无 US 复盘简报</strong>
              <span className="subtle">后台发布到该栏目后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
