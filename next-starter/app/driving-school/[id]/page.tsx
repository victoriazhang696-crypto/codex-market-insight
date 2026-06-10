import { getCurrentMemberPersonalContentById } from '@/lib/personal-content';
import { buildPersonalReport } from '@/lib/personal-report';
import MemberFrame from '../../member-frame';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function DrivingSchoolDetailPage({ params }: Params) {
  const { id } = await params;
  const content = await getCurrentMemberPersonalContentById('driving_school', id);

  if (!content) {
    return (
      <MemberFrame activePath="/driving-school" eyebrow="环球驾校专属" title="内容不存在或暂未分配">
        <section className="member-page-panel empty-state">
          <p className="lede">请返回环球驾校专属目录查看已分配内容。</p>
          <a className="secondary-link" href="/driving-school">返回目录</a>
        </section>
      </MemberFrame>
    );
  }

  const report = buildPersonalReport(content.body);

  return (
    <MemberFrame activePath="/driving-school" eyebrow={content.contentType} title={content.title} description={report.summary}>
      <section className="member-page-panel">
        <div className="inline-actions">
          <a className="secondary-link" href="/driving-school">返回目录</a>
          <a className="secondary-link" href="/">返回首页</a>
        </div>
        <article className="personal-report-card">
          <div className="personal-report-head">
            <div>
              <span>Personal Report</span>
              <h2>{content.title}</h2>
            </div>
            {content.createdAt ? (
              <time dateTime={content.createdAt}>
                {new Intl.DateTimeFormat('zh-CN', {
                  timeZone: 'Asia/Kuala_Lumpur',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }).format(new Date(content.createdAt))}
              </time>
            ) : null}
          </div>
          <div className="personal-report-summary">
            <strong>专属摘要</strong>
            <p>{report.summary}</p>
          </div>
          <div className="personal-report-grid">
            {report.sections.map((section, index) => (
              <section key={`${content.id}-${index}`} className="personal-report-section">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{section.title}</h3>
                <div className="personal-report-paragraphs">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${content.id}-${index}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          {content.attachmentUrl ? <a href={content.attachmentUrl} target="_blank" rel="noreferrer">打开附件 / 链接</a> : null}
        </article>
      </section>
    </MemberFrame>
  );
}
