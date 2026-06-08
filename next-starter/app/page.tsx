import { getCurrentMemberProfile } from '@/lib/member-profile';

const highlights = [
  {
    title: '今日洞察',
    body: '查看今日市场研究内容、摘要和风险提示。',
    href: '/today'
  },
  {
    title: '历史洞察',
    body: '按月份和关键词回看已发布观点。',
    href: '/history'
  },
  {
    title: '公告通知',
    body: '直播、更新和会员提醒统一查看。',
    href: '/announcements'
  },
  {
    title: '待解锁 AI 服务',
    body: '预留 AI 市场助理、股票分析和更多会员服务。',
    href: '/soon'
  }
];

export const dynamic = 'force-dynamic';

export default async function MemberHomePage() {
  const profile = await getCurrentMemberProfile();
  const expireText = profile?.expireDate ?? '未设置';
  const remainingText =
    profile?.remainingDays === null || profile?.remainingDays === undefined
      ? '未设置'
      : profile.remainingDays >= 0
        ? `${profile.remainingDays} 天`
        : '已到期';

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="brand-lockup">
          <img src="/homilychart-malaysia-logo.png" alt="HomilyChart Malaysia" />
          <p className="eyebrow">大马会员专属 AI 服务</p>
        </div>
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
              <span className="label">会员账号</span>
              <strong>{profile?.accountNumber ?? '已登录'}</strong>
            </div>
            <div>
              <span className="label">使用期限</span>
              <strong>{expireText}</strong>
            </div>
            <div>
              <span className="label">剩余时间</span>
              <strong>{remainingText}</strong>
            </div>
            <div>
              <span className="label">状态</span>
              <strong>{profile?.status ?? 'active'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid">
        {highlights.map((item) => (
          <article key={item.title} className="feature-card">
            <a href={item.href}>
              <h2>{item.title}</h2>
            </a>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
