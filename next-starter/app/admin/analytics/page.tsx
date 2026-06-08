import { getAdminAnalyticsMetrics } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const metrics = await getAdminAnalyticsMetrics();

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Analytics</p>
        <h1>阅读与登录统计</h1>
        <p className="lede">这里显示 Supabase 里的会员、阅读和登录统计。</p>
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
