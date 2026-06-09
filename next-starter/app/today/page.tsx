import { getArticlePreviewBlocks } from '@/lib/article-format';
import { getTodaysMarketArticles } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

export default async function TodayPage() {
  const canAccess = await canCurrentMemberAccess('market_today');
  if (!canAccess) {
    return (
      <MemberFrame activePath="/today" eyebrow="今日洞察" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">请联系顾问开通市场洞察权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const articles = await getTodaysMarketArticles();
  const article = articles[0];

  if (!article) {
    return (
      <MemberFrame activePath="/today" eyebrow="Today Insight" title="暂无已发布洞察">
        <section className="member-page-panel empty-state">
          <p className="lede">管理员发布文章后，会员会在这里看到最新内容。</p>
        </section>
      </MemberFrame>
    );
  }

  const previewBlocks = getArticlePreviewBlocks(article.content);

  return (
    <MemberFrame activePath="/today" eyebrow="Today Insight" title="今日市场洞察">
      <section className="market-article-panel article-hero">
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="primary-link" href={`/today/${article.slug}`}>查看全文</a>
          <a className="secondary-link" href="/history">查看历史洞察</a>
        </div>
      </section>

      <section className="member-page-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>核心预览</h2>
          </div>
          <span className="subtle">点击查看全文阅读完整内容</span>
        </div>
        <div className="article-preview-list">
          {previewBlocks.map((block, index) => (
            <article key={`${block.heading ?? 'block'}-${index}`} className="article-preview-card">
              {block.heading ? <h3>{block.heading}</h3> : null}
              <p>{block.body}</p>
            </article>
          ))}
          {article.riskNotice ? (
            <article className="article-risk-card">
              <span>风险提示</span>
              <strong>{article.riskNotice}</strong>
            </article>
          ) : null}
        </div>
      </section>
    </MemberFrame>
  );
}
