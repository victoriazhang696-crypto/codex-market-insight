import { splitArticleBlocks } from '@/lib/article-format';
import { getArticleBySlug, getArticleCategoryLabel } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';

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
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">今日洞察详情</p>
          <h1>文章不存在或尚未发布</h1>
          <p className="lede">请返回今日洞察查看已发布内容。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  const categoryLabel = getArticleCategoryLabel(article.category);
  const canAccess = await canCurrentMemberAccess(article.category);

  if (!canAccess) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">{categoryLabel}</p>
          <h1>该栏目暂未开通</h1>
          <p className="lede">你的账号目前没有阅读该栏目内容的权限。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  const articleBlocks = splitArticleBlocks(article.content);

  return (
    <main className="page-shell">
      <section className="hero-card dark article-hero">
        <p className="eyebrow">{categoryLabel}</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="inline-actions">
          <a className="secondary-link" href="/">返回首页</a>
          <a className="secondary-link" href="/today">今日洞察</a>
        </div>
      </section>

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
    </main>
  );
}
