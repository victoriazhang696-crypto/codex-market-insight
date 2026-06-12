import { getAnnouncements, getHistoricalMarketArticles, getPublishedArticlesByCategory, getTodaysMarketArticles } from '@/lib/content';
import { hasActiveFeaturePermission, type FeaturePermission } from '@/lib/feature-permissions';
import { getCurrentMemberProfile } from '@/lib/member-profile';
import { getCurrentMemberPersonalContents } from '@/lib/personal-content';
import MemberNav from './member-nav';

const sidebarItems = [
  { label: '首页', href: '/', permission: 'market_today', icon: '01' },
  { label: '市场洞察', href: '/today', permission: 'market_today', icon: '02' },
  { label: '公告通知', href: '/announcements', permission: 'member_notice', icon: '03' },
  { label: '历史洞察', href: '/history', permission: 'market_history', icon: '04' },
  { label: 'US复盘简报', href: '/us-review', permission: 'us_review', icon: '05' },
  { label: '待解锁AI服务', href: '/soon', permission: 'ai_service', icon: '06' },
  { label: '陪跑专项', href: '/specials', permission: 'paipao_special', icon: '07' },
  { label: '环球驾校专属', href: '/driving-school', permission: 'driving_school', icon: '08' },
  { label: '退出登录', href: '/logout', permission: 'member_notice', icon: '09' }
] satisfies Array<{ label: string; href: string; permission: FeaturePermission; icon: string }>;

type Props = {
  activePath: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default async function MemberFrame({ activePath, eyebrow, title, description, children }: Props) {
  const [profile, drivingContents, todayArticles, historicalArticles, usReviewArticles, notices] = await Promise.all([
    getCurrentMemberProfile(),
    getCurrentMemberPersonalContents('driving_school'),
    getTodaysMarketArticles(),
    getHistoricalMarketArticles(),
    getPublishedArticlesByCategory('us_review'),
    getAnnouncements()
  ]);
  const drivingBadgeSignature = drivingContents.map((item) => item.id).join('|');
  const articleBadges: Record<string, { count: number; signature: string }> = {
    '/today': {
      count: todayArticles.length,
      signature: todayArticles.map((item) => item.id).join('|')
    },
    '/history': {
      count: historicalArticles.length,
      signature: historicalArticles.map((item) => item.id).join('|')
    },
    '/us-review': {
      count: usReviewArticles.length,
      signature: usReviewArticles.map((item) => item.id).join('|')
    },
    '/announcements': {
      count: notices.length,
      signature: notices.map((item) => item.id).join('|')
    },
    '/driving-school': {
      count: drivingContents.length,
      signature: drivingBadgeSignature
    }
  };

  return (
    <main className="member-dashboard">
      <aside className="member-sidebar">
        <a className="member-logo" href="/">
          <img src="/homilychart-malaysia-logo-cutout.png" alt="HomilyChart Malaysia" />
        </a>
        <MemberNav
          ariaLabel="会员功能导航"
          items={sidebarItems.map((item) => {
            const enabled = item.href === '/logout' || Boolean(
              profile?.status === 'active' &&
              hasActiveFeaturePermission(profile.featurePermissions, profile.featureExpiries, item.permission)
            );
            const badge = articleBadges[item.href];
            const badgeCount = badge?.count ?? 0;
            return {
              ...item,
              enabled,
              active: activePath === item.href,
              badgeCount,
              badgeKey: badgeCount > 0 ? item.href : undefined,
              badgeSignature: badge?.signature
            };
          })}
        />
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
