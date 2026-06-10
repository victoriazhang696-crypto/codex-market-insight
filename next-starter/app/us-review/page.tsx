import { getPublishedArticlesByCategory } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

export default async function UsReviewPage() {
  const canAccess = await canCurrentMemberAccess('us_review');
  if (!canAccess) {
    return (
      <MemberFrame activePath="/us-review" eyebrow="US复盘简报" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">你的账号目前没有 US 复盘简报权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const articles = await getPublishedArticlesByCategory('us_review');

  return (
    <MemberFrame
      activePath="/us-review"
      eyebrow="US Review"
      title="US 市场复盘"
      description="这里显示“US复盘简报”的会员专属内容。"
    >
      <section className="member-page-panel">
        <div className="member-list">
          {articles.length > 0 ? articles.map((item) => (
            <article key={item.id} className="member-list-row">
              <div>
                <strong>{item.title}</strong>
                <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : '已发布'}</span>
              </div>
              <a href={`/today/${item.slug}`}>查看</a>
            </article>
          )) : (
            <article className="member-list-row">
              <strong>暂无 US 复盘简报</strong>
              <span>US 复盘简报生成后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </MemberFrame>
  );
}
