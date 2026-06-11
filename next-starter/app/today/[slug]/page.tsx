import { splitArticleBlocks } from '@/lib/article-format';
import { getArticleBySlug, getArticleCategoryLabel } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import { renderRichParagraph } from '@/lib/rich-content';
import MemberFrame from '../../member-frame';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

const articleCategoryMeta = {
  market_today: {
    activePath: '/today',
    emptyHref: '/today',
    emptyLabel: '今日洞察',
    actions: [
      { href: '/today', label: '今日洞察' },
      { href: '/history', label: '历史洞察' }
    ]
  },
  market_history: {
    activePath: '/history',
    emptyHref: '/history',
    emptyLabel: '历史洞察',
    actions: [
      { href: '/history', label: '历史洞察' },
      { href: '/today', label: '今日洞察' }
    ]
  },
  paipao_special: {
    activePath: '/specials',
    emptyHref: '/specials',
    emptyLabel: '陪跑专项',
    actions: [{ href: '/specials', label: '陪跑专项' }]
  },
  us_review: {
    activePath: '/us-review',
    emptyHref: '/us-review',
    emptyLabel: 'US复盘简报',
    actions: [{ href: '/us-review', label: 'US复盘简报' }]
  },
  member_notice: {
    activePath: '/announcements',
    emptyHref: '/announcements',
    emptyLabel: '公告通知',
    actions: [{ href: '/announcements', label: '公告通知' }]
  },
  ai_service: {
    activePath: '/soon',
    emptyHref: '/soon',
    emptyLabel: '待解锁AI服务',
    actions: [{ href: '/soon', label: '待解锁AI服务' }]
  },
  driving_school: {
    activePath: '/driving-school',
    emptyHref: '/driving-school',
    emptyLabel: '环球驾校专属',
    actions: [{ href: '/driving-school', label: '环球驾校专属' }]
  }
};

export default async function TodayArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <MemberFrame activePath="/today" eyebrow="文章详情" title="文章不存在或尚未发布">
        <section className="member-page-panel empty-state">
          <p className="lede">请返回今日洞察查看已发布内容。</p>
        </section>
      </MemberFrame>
    );
  }

  const categoryLabel = getArticleCategoryLabel(article.category);
  const categoryMeta = articleCategoryMeta[article.category];
  const canAccess = await canCurrentMemberAccess(article.category);

  if (!canAccess) {
    return (
      <MemberFrame activePath={categoryMeta.activePath} eyebrow={categoryLabel} title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">你的账号目前没有阅读该栏目内容的权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const articleBlocks = splitArticleBlocks(article.content);

  return (
    <MemberFrame activePath={categoryMeta.activePath} eyebrow={categoryLabel} title={article.title} description={article.summary}>
      <section className="market-article-panel article-reader-panel">
        <div className="inline-actions">
          {categoryMeta.actions.map((action) => (
            <a key={action.href} className="secondary-link" href={action.href}>{action.label}</a>
          ))}
          <a className="secondary-link" href="/">返回首页</a>
        </div>
        <section className="article-reader">
          <div className="article-prose">
            {articleBlocks.map((block, index) => (
              <section key={`${block.heading ?? 'paragraph'}-${index}`} className={block.heading ? 'article-section' : 'article-lead-block'}>
                {block.heading ? <h2>{block.heading}</h2> : null}
                <p>{renderRichParagraph(block.body)}</p>
              </section>
            ))}
          </div>
          {article.riskNotice ? (
            <aside className="article-risk-card">
              <span>风险提示</span>
              <strong>{article.riskNotice}</strong>
            </aside>
          ) : null}
        </section>
      </section>
    </MemberFrame>
  );
}
