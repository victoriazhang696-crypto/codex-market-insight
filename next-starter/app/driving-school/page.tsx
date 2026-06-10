import { canCurrentMemberAccess } from '@/lib/member-profile';
import { getCurrentMemberPersonalContents } from '@/lib/personal-content';
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
      description="这里是您的定向定制内容，只展示分配给当前账号的服务信息。"
    >
      <section className="member-page-panel">
        <div className="member-list">
          {contents.length > 0 ? contents.map((item) => (
            <article key={item.id} className="personal-content-card">
              <div className="service-heading">
                <span>{item.title}</span>
                <strong>{item.contentType}</strong>
              </div>
              <p>{item.body}</p>
              {item.attachmentUrl ? <a href={item.attachmentUrl} target="_blank" rel="noreferrer">打开附件 / 链接</a> : null}
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
