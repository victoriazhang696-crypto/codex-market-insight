import { getPublishedArticlesByCategory } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

export default async function SpecialsPage() {
  const canAccess = await canCurrentMemberAccess('paipao_special');
  if (!canAccess) {
    return (
      <MemberFrame activePath="/specials" eyebrow="陪跑专项" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">你的账号目前没有陪跑专项权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const articles = await getPublishedArticlesByCategory('paipao_special');

  return (
    <MemberFrame
      activePath="/specials"
      eyebrow="Special Program"
      title="专项陪跑内容"
      description="这里显示后台发布到“陪跑专项”的会员内容。"
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
              <strong>暂无陪跑专项内容</strong>
              <span>后台发布到该栏目后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </MemberFrame>
  );
}
