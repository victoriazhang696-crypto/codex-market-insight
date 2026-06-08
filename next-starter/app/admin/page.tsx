import { getAdminDashboardMetrics } from '@/lib/admin-stats';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Staff Only</p>
        <h1>管理后台</h1>
        <p className="lede">
          这里用于发文章、管理客户账号、修改期限、查看阅读数据和登录记录。
        </p>
        <div className="inline-actions">
          <a className="primary-link" href="/admin/members">客户管理</a>
          <a className="secondary-link" href="/admin/articles">文章发布</a>
          <a className="secondary-link" href="/admin/analytics">统计面板</a>
          <a className="secondary-link" href="/logout">退出登录</a>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map((item) => (
          <article key={item.label} className="metric-card">
            <span className="label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>新增客户</h2>
        <p className="lede">
          客户账号用 8 位数字，初始密码用手机号。创建后客户即可从会员登录页进入。
        </p>
        <div className="inline-actions">
          <a className="primary-link" href="/admin/members">进入客户管理</a>
        </div>
      </section>
    </main>
  );
}
