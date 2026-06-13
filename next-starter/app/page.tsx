import { getAnnouncements, getPublishedArticles, isPublishedTodayInMalaysia } from '@/lib/content';
import {
  getFeatureExpireDate,
  getRemainingDaysFromMalaysiaToday,
  hasActiveFeaturePermission,
  type FeaturePermission
} from '@/lib/feature-permissions';
import { getCurrentMemberProfile } from '@/lib/member-profile';
import { getCurrentMemberPersonalContents } from '@/lib/personal-content';
import MemberNav, { type MemberNavItem } from './member-nav';

const serviceCards = [
  {
    title: '市场洞察',
    body: '今日核心观点、风险提示和完整市场解读。',
    href: '/today',
    permission: 'market_today',
    tone: 'blue'
  },
  {
    title: '历史洞察',
    body: '自动收纳过往观点，便于回看和复盘。',
    href: '/history',
    permission: 'market_history',
    tone: 'violet'
  },
  {
    title: '公告通知',
    body: '直播安排、会员通知和功能更新。',
    href: '/announcements',
    permission: 'member_notice',
    tone: 'rose'
  },
  {
    title: 'US复盘简报',
    body: '美股市场表现、资金流向和重点板块。',
    href: '/us-review',
    permission: 'us_review',
    tone: 'green'
  },
  {
    title: '待解锁AI服务',
    body: 'AI 市场助理、智能选股和风险预警。',
    href: '/soon',
    permission: 'ai_service',
    tone: 'cyan'
  },
  {
    title: '陪跑专项',
    body: '专项陪跑内容、策略提醒和重点复盘。',
    href: '/specials',
    permission: 'paipao_special',
    tone: 'gold'
  },
  {
    title: '环球驾校专属',
    body: '铁粉定向内容、学习提醒和专属方案。',
    href: '/driving-school',
    permission: 'driving_school',
    tone: 'cyan'
  }
] satisfies Array<{ title: string; body: string; href: string; permission: FeaturePermission; tone: string }>;

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

export const dynamic = 'force-dynamic';

function getMalaysiaMonthDay() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(new Date());

  return {
    month: parts.find((part) => part.type === 'month')?.value ?? '',
    day: parts.find((part) => part.type === 'day')?.value ?? ''
  };
}

function titleMatchesToday(title: string) {
  const dateMatch = title.match(/(\d{1,2})[./月-](\d{1,2})\s*日?/);

  if (!dateMatch) {
    return true;
  }

  const today = getMalaysiaMonthDay();
  return Number(dateMatch[1]) === Number(today.month) && Number(dateMatch[2]) === Number(today.day);
}

function getFeatureExpirySummary(expireDate: string | null) {
  if (!expireDate) {
    return {
      dateText: '长期有效',
      daysText: '未设置单独期限'
    };
  }

  const days = getRemainingDaysFromMalaysiaToday(expireDate);
  return {
    dateText: `有效至 ${expireDate}`,
    daysText: days === null ? '未设置' : days > 0 ? `剩余 ${days} 天` : days === 0 ? '今日到期' : '已到期'
  };
}

export default async function MemberHomePage() {
  const [profile, publishedArticles, notices, drivingContents] = await Promise.all([
    getCurrentMemberProfile(),
    getPublishedArticles(),
    getAnnouncements(),
    getCurrentMemberPersonalContents('driving_school')
  ]);

  const canUse = (permission: FeaturePermission) =>
    hasActiveFeaturePermission(profile?.featurePermissions, profile?.featureExpiries, permission);
  const getFeatureExpiry = (permission: FeaturePermission) =>
    getFeatureExpireDate(profile?.featureExpiries, permission);

  const todaysMarketArticles = publishedArticles.filter(
    (article) => article.category === 'market_today' && isPublishedTodayInMalaysia(article) && titleMatchesToday(article.title)
  );
  const historicalMarketArticles = publishedArticles
    .filter((article) => article.category === 'market_history' || (article.category === 'market_today' && !isPublishedTodayInMalaysia(article)))
    .slice(0, 3);
  const usReviewArticles = publishedArticles.filter((article) => article.category === 'us_review');
  const latestToday = todaysMarketArticles[0];

  const navItems: MemberNavItem[] = sidebarItems.map((item) => {
    const enabled = item.href === '/' || item.href === '/logout' || canUse(item.permission);
    const badgeCount =
      item.href === '/today'
        ? todaysMarketArticles.length
        : item.href === '/history'
          ? historicalMarketArticles.length
        : item.href === '/announcements'
          ? notices.length
          : item.href === '/us-review'
            ? usReviewArticles.length
            : item.href === '/driving-school'
              ? drivingContents.length
              : 0;
    const badgeSignature =
      item.href === '/today'
        ? todaysMarketArticles.map((article) => article.id).join('|')
        : item.href === '/history'
          ? historicalMarketArticles.map((article) => article.id).join('|')
        : item.href === '/announcements'
          ? notices.map((notice) => notice.id).join('|')
          : item.href === '/us-review'
            ? usReviewArticles.map((article) => article.id).join('|')
            : item.href === '/driving-school'
              ? drivingContents.map((content) => content.id).join('|')
              : '';

    return {
      ...item,
      enabled,
      active: item.href === '/',
      badgeCount,
      badgeKey: badgeCount > 0 ? item.href : undefined,
      badgeSignature
    };
  });
  const activeFeatureSummaries = serviceCards
    .filter((item) => canUse(item.permission))
    .map((item) => ({
      label: item.title,
      ...getFeatureExpirySummary(getFeatureExpiry(item.permission))
    }));

  return (
    <main className="member-dashboard">
      <aside className="member-sidebar">
        <a className="member-logo" href="/">
          <img src="/homilychart-malaysia-logo-cutout.png" alt="HomilyChart Malaysia" />
        </a>
        <MemberNav items={navItems} ariaLabel="会员导航" />
      </aside>

      <section className="member-main">
        <section className="member-home-stage">
          <div className="member-welcome">
            <p className="eyebrow">Market Intelligence Center</p>
            <h1>欢迎来到大马专属AI服务中心</h1>
            <p>AI 驱动的市场洞察与分析，帮您把握每一个投资机会。</p>
            <div className="hero-visual" aria-hidden="true">
              <span className="ai-mark">AI</span>
              <span className="petronas-towers">
                <i className="petronas-tower left" />
                <i className="petronas-bridge" />
                <i className="petronas-tower right" />
              </span>
            </div>
          </div>

          <aside className="vip-panel">
            <div className="vip-profile-row">
              <div className="member-avatar">{(profile?.fullName ?? 'M').slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{profile?.fullName ?? 'Member'}</strong>
                <span>{profile?.accountNumber ?? '已登录'}</span>
              </div>
            </div>
            <div className="vip-title-row">
              <strong>尊享版</strong>
            </div>
            <dl>
              <div>
                <dt>会员账号</dt>
                <dd>{profile?.accountNumber ?? '已登录'}</dd>
              </div>
              <div>
                <dt>会员状态</dt>
                <dd className={profile?.status === 'active' ? 'status-active' : ''}>{profile?.status ?? 'active'}</dd>
              </div>
            </dl>
            <div className="vip-feature-expiry-list">
              <span>栏目剩余</span>
              {activeFeatureSummaries.slice(0, 5).map((item) => (
                <div key={item.label}>
                  <strong>{item.label}</strong>
                  <small>{item.daysText}</small>
                </div>
              ))}
            </div>
            <a className="renew-button" href="/soon">续费会员</a>
          </aside>
        </section>

        <section className="insight-strip">
          <div>
            <span>今日核心洞察</span>
            <strong>{latestToday?.title ?? '今日 AI 洞察准备中'}</strong>
            <p>{latestToday?.summary || 'AI 正在等待今日市场信号，洞察生成后会自动呈现。'}</p>
          </div>
          <a href="/today">查看完整洞察</a>
        </section>

        <section className="dashboard-cards compact-cards">
          {serviceCards.map((item) => {
            const enabled = canUse(item.permission);
            const expiry = getFeatureExpirySummary(getFeatureExpiry(item.permission));
            const preview =
              item.href === '/announcements'
                ? notices[0]?.title
                : item.href === '/history'
                  ? historicalMarketArticles[0]?.title
                  : item.href === '/today'
                    ? latestToday?.summary
                    : item.href === '/driving-school'
                      ? drivingContents[0]?.title
                    : '';

            return (
              <article key={item.title} className={`mini-service-card ${enabled ? 'enabled-card' : 'locked-card'} tone-${item.tone}`}>
                <div className="service-heading">
                  <span>{item.title}</span>
                  <strong>{enabled ? 'ON' : 'LOCK'}</strong>
                </div>
                <p>{preview || item.body}</p>
                <div className="service-expiry">
                  <span>{enabled ? expiry.dateText : '暂未开通'}</span>
                  <small>{enabled ? expiry.daysText : '联系顾问开通权限'}</small>
                </div>
                <a href={item.href}>{enabled ? '进入服务' : '了解解锁'}</a>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
