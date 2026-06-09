import { getAnnouncements } from '@/lib/content';
import { canCurrentMemberAccess } from '@/lib/member-profile';
import MemberFrame from '../member-frame';

export default async function AnnouncementsPage() {
  const canAccess = await canCurrentMemberAccess('member_notice');
  if (!canAccess) {
    return (
      <MemberFrame activePath="/announcements" eyebrow="公告通知" title="该栏目暂未开通">
        <section className="member-page-panel empty-state">
          <p className="lede">你的账号目前没有公告通知权限。</p>
        </section>
      </MemberFrame>
    );
  }

  const notices = await getAnnouncements();

  return (
    <MemberFrame
      activePath="/announcements"
      eyebrow="Notice Center"
      title="会员公告中心"
      description="重要通知、直播安排与功能更新都会在这里集中发布。"
    >
      <section className="dashboard-cards page-card-grid">
        {notices.map((notice) => (
          <article key={notice.id} className="mini-service-card notice-card">
            <div className="service-heading">
              <span>{notice.title}</span>
              <strong>新</strong>
            </div>
            <p>{notice.body}</p>
          </article>
        ))}
      </section>
    </MemberFrame>
  );
}
