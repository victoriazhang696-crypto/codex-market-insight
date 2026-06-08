import { getPublishedArticles } from '@/lib/content';

export default async function HistoryPage() {
  const archive = await getPublishedArticles();

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">历史洞察</p>
        <h1>已发布观点档案</h1>
        <p className="lede">这里会逐步接成 Supabase 查询，支持按月份、关键词和资产类别筛选。</p>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <div className="stack-list">
          {archive.length > 0 ? archive.map((item) => (
            <article key={item.id} className="stack-item">
              <div>
                <strong>{item.title}</strong>
                <span className="subtle">{item.publishedAt ?? '已发布'}</span>
              </div>
              <a href={`/today/${item.slug}`}>查看</a>
            </article>
          )) : (
            <article className="stack-item">
              <strong>暂无历史洞察</strong>
              <span className="subtle">管理员发布文章后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
