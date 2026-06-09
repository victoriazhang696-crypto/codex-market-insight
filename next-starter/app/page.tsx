import { getCurrentMemberProfile } from '@/lib/member-profile';
import { hasActiveFeaturePermission, type FeaturePermission } from '@/lib/feature-permissions';

const highlights = [
  {
    title: '今日洞察',
    body: '查看今日市场研究内容、摘要和风险提示。',
    href: '/today',
    permission: 'market_today'
  },
  {
    title: '历史洞察',
    body: '按月份和关键词回看已发布观点。',
    href: '/history',
    permission: 'market_history'
  },
  {
    title: '公告通知',
    body: '直播、更新和会员提醒统一查看。',
    href: '/announcements',
    permission: 'member_notice'
  },
  {
    title: '陪跑专项',
    body: '专项陪跑内容、策略提醒和重点复盘。',
    href: '/specials',
    permission: 'paipao_special'
  },
  {
    title: 'US复盘简报',
    body: '美股市场复盘、重点资产和机会追踪。',
    href: '/us-review',
    permission: 'us_review'
  },
  {
    title: '待解锁 AI 服务',
    body: '预留 AI 市场助理、股票分析和更多会员服务。',
    href: '/soon',
    permission: 'ai_service'
  }
] satisfies Array<{ title: string; body: string; href: string; permission: FeaturePermission }>;

const sidebarItems = [
  { label: '首页', href: '/', permission: 'market_today' },
  { label: '市场洞察', href: '/today', permission: 'market_today' },
  { label: '公告通知', href: '/announcements', permission: 'member_notice', badge: '3' },
  { label: '历史洞察', href: '/history', permission: 'market_history' },
  { label: 'US复盘简报', href: '/us-review', permission: 'us_review' },
  { label: '待解锁AI服务', href: '/soon', permission: 'ai_service' },
  { label: '陪跑专项', href: '/specials', permission: 'paipao_special' },
  { label: '退出登录', href: '/logout', permission: 'member_notice' }
] satisfies Array<{ label: string; href: string; permission: FeaturePermission; badge?: string }>;

const announcements = [
  ['系统维护通知', '2026-06-08 10:00'],
  ['新功能上线：AI智能选股', '2026-06-07 15:30'],
  ['会员权益调整公告', '2026-06-06 09:00']
];

const historyItems = [
  ['美股科技股深度分析', '2026-06-07'],
  ['新能源产业链周报', '2026-06-06'],
  ['半导体行业研究报告', '2026-06-05']
];

export const dynamic = 'force-dynamic';

export default async function MemberHomePage() {
  const profile = await getCurrentMemberProfile();
  const canUse = (permission: FeaturePermission) =>
    hasActiveFeaturePermission(profile?.featurePermissions, profile?.featureExpiries, permission, profile?.expireDate);
  const expireText = profile?.expireDate ?? '未设置';
  const remainingText =
    profile?.remainingDays === null || profile?.remainingDays === undefined
      ? '未设置'
      : profile.remainingDays >= 0
        ? `${profile.remainingDays} 天`
        : '已到期';

  const benefitItems = [
    '全部AI洞察功能',
    '专属AI智能服务',
    '高级风险预警',
    '专属客服支持'
  ];

  return (
    <main className="member-dashboard">
      <aside className="member-sidebar">
        <a className="member-logo" href="/">
          <img src="/homilychart-malaysia-logo-cutout.png" alt="HomilyChart Malaysia" />
          <span>Homily Malaysia</span>
        </a>
        <nav className="member-nav" aria-label="会员导航">
          {sidebarItems.map((item, index) => {
            const active = item.href === '/';
            const enabled = item.href === '/logout' || canUse(item.permission);
            return (
              <a
                key={item.href}
                className={active ? 'active' : enabled ? '' : 'locked'}
                href={enabled ? item.href : '#'}
                aria-disabled={!enabled}
              >
                <span className="nav-icon">{String(index + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
                {item.badge ? <strong>{item.badge}</strong> : null}
              </a>
            );
          })}
        </nav>

        <section className="upgrade-card">
          <span className="crown-mark">VIP</span>
          <h2>升级会员</h2>
          <p>解锁全部AI洞察功能和专项权益。</p>
          <a href="/soon">立即升级</a>
        </section>
      </aside>

      <section className="member-main">
        <header className="member-topbar">
          <div>
            <p className="eyebrow">Market Intelligence Center</p>
            <h1>欢迎来到市场洞察中心</h1>
            <p>AI 驱动的市场洞察与分析，帮您把握每一个投资机会。</p>
          </div>
          <div className="member-user-chip">
            <span>{profile?.fullName ?? 'Member'}</span>
            <strong>{profile?.accountNumber ?? '已登录'}</strong>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="market-hero-card">
            <div className="market-hero-copy">
              <span className="hot-label">今日核心洞察</span>
              <h2>算力已成新金本位，科技巨头开启新一轮军备竞赛</h2>
              <p>
                随着 AI 大模型持续迭代，算力基础设施成为科技竞争的核心壁垒。英伟达最新财报超预期，揭示 AI 算力需求仍处于爆发前夜。
              </p>
              <a href="/today">查看完整洞察</a>
            </div>
            <img src="/member-dashboard-visual.png" alt="AI market intelligence visual" />
          </section>

          <aside className="vip-panel">
            <div className="vip-title-row">
              <span>VIP 会员</span>
              <strong>尊享版</strong>
            </div>
            <dl>
              <div>
                <dt>会员账号</dt>
                <dd>{profile?.accountNumber ?? '已登录'}</dd>
              </div>
              <div>
                <dt>到期时间</dt>
                <dd>{expireText}</dd>
              </div>
              <div>
                <dt>剩余时间</dt>
                <dd>{remainingText}</dd>
              </div>
              <div>
                <dt>会员状态</dt>
                <dd className={profile?.status === 'active' ? 'status-active' : ''}>{profile?.status ?? 'active'}</dd>
              </div>
            </dl>
            <a className="renew-button" href="/soon">续费会员</a>
            <div className="benefit-list">
              {benefitItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </aside>
        </div>

        <section className="dashboard-cards">
          <article className="mini-service-card notice-card">
            <div className="service-heading">
              <span>公告通知</span>
              <strong>3</strong>
            </div>
            {announcements.map(([title, time]) => (
              <p key={title}><b>{title}</b><small>{time}</small></p>
            ))}
            <a href="/announcements">查看全部</a>
          </article>

          <article className="mini-service-card">
            <div className="service-heading">
              <span>历史洞察</span>
            </div>
            {historyItems.map(([title, date]) => (
              <p key={title}><b>{title}</b><small>{date}</small></p>
            ))}
            <a href="/history">查看全部</a>
          </article>

          {highlights.slice(3).map((item) => {
            const enabled = canUse(item.permission);
            return (
              <article key={item.title} className={enabled ? 'mini-service-card enabled-card' : 'mini-service-card locked-card'}>
                <div className="service-heading">
                  <span>{item.title}</span>
                  <strong>{enabled ? 'ON' : 'LOCK'}</strong>
                </div>
                <p>{item.body}</p>
                <a href={enabled ? item.href : '/soon'}>{enabled ? '进入服务' : '了解解锁'}</a>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
