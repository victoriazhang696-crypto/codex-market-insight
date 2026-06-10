import { splitArticleBlocks } from '@/lib/article-format';
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
      <MemberFrame activePath="/today" eyebrow="Today Insight" title="今日 AI 洞察准备中">
        <section className="member-page-panel empty-state">
          <p className="lede">AI 正在等待今日市场信号，洞察生成后会自动呈现。</p>
        </section>
      </MemberFrame>
    );
  }

  const articleBlocks = splitArticleBlocks(article.content);

  return (
    <MemberFrame activePath="/today" eyebrow="Today Insight" title="今日市场洞察">
      <section className="market-article-panel article-hero">
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/history">查看历史洞察</a>
        </div>
      </section>

      <section className="market-article-panel article-reader-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Full Article</p>
            <h2>完整原文</h2>
          </div>
        </div>
        <section className="article-reader">
          <div className="article-prose">
            {articleBlocks.map((block, index) => (
              <section key={`${block.heading ?? 'paragraph'}-${index}`} className={block.heading ? 'article-section' : 'article-lead-block'}>
                {block.heading ? <h2>{block.heading}</h2> : null}
                <p>{block.body}</p>
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
