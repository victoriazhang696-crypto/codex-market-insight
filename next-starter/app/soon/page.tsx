import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

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
      <MemberFrame activePath="/soon" eyebrow="待解锁 AI 服务" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">后续如需体验 AI 市场助理或股票分析，可联系顾问开通。</p>
        </section>
      </MemberFrame>
    );
  }

  return (
    <MemberFrame
      activePath="/soon"
      eyebrow="Coming Soon"
      title="未来功能预览"
      description="这里先占位，后续会逐步接入 AI 问答、股票分析和会员课程内容。"
    >
      <section className="dashboard-cards page-card-grid">
        {roadmap.map((item) => (
          <article key={item} className="mini-service-card locked-card">
            <div className="service-heading">
              <span>{item}</span>
            </div>
            <p>规划中，后续接入。</p>
          </article>
        ))}
      </section>
    </MemberFrame>
  );
}
