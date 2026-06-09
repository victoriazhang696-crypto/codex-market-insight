import { hasActiveFeaturePermission, type FeaturePermission } from '@/lib/feature-permissions';
import { getCurrentMemberProfile } from '@/lib/member-profile';

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

type Props = {
  activePath: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default async function MemberFrame({ activePath, eyebrow, title, description, children }: Props) {
  const profile = await getCurrentMemberProfile();

  return (
    <main className="member-dashboard">
      <aside className="member-sidebar">
        <a className="member-logo" href="/">
          <img src="/homilychart-malaysia-logo-cutout.png" alt="HomilyChart Malaysia" />
          <span>HomilyChart Malaysia</span>
        </a>
        <nav className="member-nav" aria-label="会员功能导航">
          {sidebarItems.map((item) => {
            const isAllowed = item.href === '/logout' || Boolean(
              profile?.status === 'active' &&
              hasActiveFeaturePermission(profile.featurePermissions, profile.featureExpiries, item.permission, profile.expireDate)
            );
            const isActive = activePath === item.href;
            return (
              <a
                key={item.href}
                className={`${isActive ? 'active' : ''} ${isAllowed ? '' : 'locked'}`}
                href={isAllowed || item.href === '/logout' ? item.href : '/soon'}
              >
                <span className="nav-icon">{isAllowed ? '◆' : '▣'}</span>
                <span>{item.label}</span>
                {item.badge ? <strong>{item.badge}</strong> : null}
              </a>
            );
          })}
        </nav>
        <section className="upgrade-card">
          <strong>VIP 会员</strong>
          <p>解锁全部 AI 洞察功能与专属内容。</p>
          <a className="primary-link" href="/soon">查看权益</a>
        </section>
      </aside>

      <section className="member-main">
        <header className="member-topbar compact">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          <a className="member-return-link" href="/">返回首页</a>
        </header>
        {children}
      </section>
    </main>
  );
}
