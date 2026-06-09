import { canCurrentMemberAccess } from '@/lib/member-profile';

const roadmap = [
  'AI 市场助理',
  '股票分析中心',
  '机会追踪提醒',
  '课程中心'
];

export default async function SoonPage() {
  const canAccess = await canCurrentMemberAccess('ai_service');
  if (!canAccess) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">待解锁 AI 服务</p>
          <h1>该栏目暂未开通</h1>
          <p className="lede">后续如需体验 AI 市场助理或股票分析，可联系顾问开通。</p>
          <div className="inline-actions">
            <a className="secondary-link" href="/">返回首页</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">待上线惊喜</p>
        <h1>未来功能预览</h1>
        <p className="lede">这里先占位，后续会逐步接入 AI 问答、股票分析和会员课程内容。</p>
      </section>

      <section className="card-grid" style={{ marginTop: 16 }}>
        {roadmap.map((item) => (
          <article key={item} className="feature-card">
            <h2>{item}</h2>
            <p>规划中，后续接入。</p>
          </article>
        ))}
      </section>
    </main>
  );
}
