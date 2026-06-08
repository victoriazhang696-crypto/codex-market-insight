const highlights = [
  {
    title: '今日洞察',
    body: '查看今日市场研究内容、摘要和风险提示。'
  },
  {
    title: '历史洞察',
    body: '按月份和关键词回看已发布观点。'
  },
  {
    title: '公告通知',
    body: '直播、更新和会员提醒统一查看。'
  }
];

export default function MemberHomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">大马会员专属 AI 服务</p>
        <div className="hero-grid">
          <div>
            <h1>欢迎回到你的市场情报中心</h1>
            <p className="lede">
              会员登录后，可查看今日洞察、历史观点和公告通知。后续再逐步接入 AI 市场助理与股票分析模块。
            </p>
            <div className="inline-actions">
              <a className="primary-link" href="/today">今日洞察</a>
              <a className="secondary-link" href="/history">历史洞察</a>
              <a className="secondary-link" href="/announcements">公告通知</a>
              <a className="secondary-link" href="/logout">退出登录</a>
            </div>
          </div>
          <div className="account-card">
            <div>
              <span className="label">服务范围</span>
              <strong>市场洞察</strong>
            </div>
            <div>
              <span className="label">访问方式</span>
              <strong>会员专属</strong>
            </div>
            <div>
              <span className="label">状态</span>
              <strong>已登录</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid">
        {highlights.map((item) => (
          <article key={item.title} className="feature-card">
            <a href={item.title === '今日洞察' ? '/today' : item.title === '历史洞察' ? '/history' : '/announcements'}>
              <h2>{item.title}</h2>
            </a>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
