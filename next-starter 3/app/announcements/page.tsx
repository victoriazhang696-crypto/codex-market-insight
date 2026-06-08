import { getAnnouncements } from '@/lib/content';

export default async function AnnouncementsPage() {
  const notices = await getAnnouncements();

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">公告通知</p>
        <h1>会员公告中心</h1>
        <p className="lede">重要通知、直播安排与功能更新都会在这里集中发布。</p>
      </section>

      <section className="card-grid" style={{ marginTop: 16 }}>
        {notices.map((notice) => (
          <article key={notice.id} className="feature-card">
            <h2>{notice.title}</h2>
            <p>{notice.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
