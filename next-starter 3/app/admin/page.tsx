const metrics = [
  { label: '总会员数', value: '411' },
  { label: '有效会员', value: '384' },
  { label: '今日阅读', value: '128' },
  { label: '今日登录', value: '96' }
];

export default function AdminPage() {
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
    </main>
  );
}
