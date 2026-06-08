const metrics = [
  { label: '总会员数', value: '411' },
  { label: '有效会员', value: '384' },
  { label: '到期会员', value: '27' },
  { label: '今日登录', value: '96' }
];

export default function AdminAnalyticsPage() {
  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Analytics</p>
        <h1>阅读与登录统计</h1>
        <p className="lede">后续可接 `article_views` 和 `login_logs` 做真实图表与排行。</p>
      </section>

      <section className="metric-grid" style={{ marginTop: 16 }}>
        {metrics.map((item) => (
          <article key={item.label} className="metric-card">
            <span className="label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
