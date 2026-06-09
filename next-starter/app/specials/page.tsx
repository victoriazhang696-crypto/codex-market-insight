import { getPublishedArticlesByCategory } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';

export default async function SpecialsPage() {
  const canAccess = await canCurrentMemberAccess('paipao_special');
  if (!canAccess) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">陪跑专项</p>
          <h1>该栏目暂未开通</h1>
          <p className="lede">你的账号目前没有陪跑专项权限。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  const articles = await getPublishedArticlesByCategory('paipao_special');

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">陪跑专项</p>
        <h1>专项陪跑内容</h1>
        <p className="lede">这里显示后台发布到“陪跑专项”的会员内容。</p>
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
              <strong>暂无陪跑专项内容</strong>
              <span className="subtle">后台发布到该栏目后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
