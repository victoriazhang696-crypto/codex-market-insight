import { splitArticleBlocks } from '@/lib/article-format';
import { getArticleBySlug, getArticleCategoryLabel } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../../member-frame';

type Params = {
  params: Promise<{
    slug: string;
  }>;
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
  const canAccess = await canCurrentMemberAccess(article.category);

  if (!canAccess) {
    return (
      <MemberFrame activePath="/today" eyebrow={categoryLabel} title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">你的账号目前没有阅读该栏目内容的权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const articleBlocks = splitArticleBlocks(article.content);

  return (
    <MemberFrame activePath="/today" eyebrow={categoryLabel} title={article.title} description={article.summary}>
      <section className="market-article-panel article-reader-panel">
        <div className="inline-actions">
          <a className="secondary-link" href="/today">今日洞察</a>
          <a className="secondary-link" href="/history">历史洞察</a>
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
