import { canCurrentMemberAccess } from '@/lib/member-profile';
import { getCurrentMemberPersonalContents } from '@/lib/personal-content';
import { buildPersonalReport } from '@/lib/personal-report';
import MemberFrame from '../member-frame';

export const dynamic = 'force-dynamic';

export default async function DrivingSchoolPage() {
  const canAccess = await canCurrentMemberAccess('driving_school');

  if (!canAccess) {
    return (
      <MemberFrame activePath="/driving-school" eyebrow="环球驾校专属" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">该服务仅对已开通的铁粉会员显示。</p>
        </section>
      </MemberFrame>
    );
  }

  const contents = await getCurrentMemberPersonalContents('driving_school');

  return (
    <MemberFrame
      activePath="/driving-school"
      eyebrow="Private Program"
      title="环球驾校专属"
      description="这里是您的专属内容目录，只展示分配给当前账号的服务信息。"
    >
      <section className="member-page-panel">
        <div className="personal-index-list">
          {contents.length > 0 ? contents.map((item) => (
            <article key={item.id} className="personal-index-card">
              <div>
                {item.createdAt ? (
                  <time dateTime={item.createdAt}>
                    {new Intl.DateTimeFormat('zh-CN', {
                      timeZone: 'Asia/Kuala_Lumpur',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).format(new Date(item.createdAt))}
                  </time>
                ) : null}
                <strong>{item.title}</strong>
                <p>{buildPersonalReport(item.body).summary}</p>
                <small>{item.contentType}</small>
              </div>
              <a href={`/driving-school/${item.id}`}>查看完整内容</a>
            </article>
          )) : (
            <article className="member-list-row">
              <strong>专属内容准备中</strong>
              <span>AI 定制内容生成后，会自动出现在这里。</span>
            </article>
          )}
        </div>
      </section>
    </MemberFrame>
  );
}
