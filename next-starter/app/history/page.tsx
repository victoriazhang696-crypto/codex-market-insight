import { getHistoricalMarketArticles } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

export default async function HistoryPage() {
  const canAccess = await canCurrentMemberAccess('market_history');
  if (!canAccess) {
    return (
      <MemberFrame activePath="/history" eyebrow="历史洞察" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">请联系顾问开通历史洞察权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const archive = await getHistoricalMarketArticles();

  return (
    <MemberFrame
      activePath="/history"
      eyebrow="History Archive"
      title="历史洞察档案"
      description="过往市场洞察会自动归档，后台补发昨天或更早的内容后也会显示在这里。"
    >
      <section className="member-page-panel">
        <div className="member-list">
          {archive.length > 0 ? archive.map((item) => (
            <article key={item.id} className="member-list-row">
              <div>
                <strong>{item.title}</strong>
                <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('zh-CN') : '已发布'}</span>
              </div>
              <a href={`/today/${item.slug}`}>查看</a>
            </article>
          )) : (
            <article className="member-list-row">
              <strong>暂无历史洞察</strong>
              <span>管理员发布文章后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </MemberFrame>
  );
}
