import { canCurrentMemberAccess } from '@/lib/member-profile';
import { getCurrentMemberPersonalContents } from '@/lib/personal-content';
import MemberFrame from '../member-frame';

export const dynamic = 'force-dynamic';

function splitReportBody(body: string) {
  const normalized = body
    .replace(/\r\n/g, '\n')
    .replace(/(模块[一二三四五六七八九十]+[:：])/g, '\n$1')
    .replace(/(配置建议[:：])/g, '\n$1')
    .replace(/(当前判断[:：])/g, '\n$1')
    .replace(/(BMA\s*结论[:：])/gi, '\n$1')
    .replace(/(Checklist[)）]?[:：])/gi, '\n$1')
    .trim();

  const blocks = normalized
    .split(/\n{1,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (blocks.length > 1) {
    return blocks;
  }

  return normalized
    .split(/(?<=[。！？；;])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<string[]>((groups, sentence) => {
      const last = groups[groups.length - 1] ?? '';
      if (!last || last.length > 180) {
        groups.push(sentence);
      } else {
        groups[groups.length - 1] = `${last}${sentence}`;
      }
      return groups;
    }, []);
}

function getBlockTitle(block: string, index: number) {
  const match = block.match(/^([^：:]{2,22})[：:]/);
  if (match) {
    return match[1];
  }

  if (index === 0) return '定制判断';
  if (index === 1) return '关键逻辑';
  if (index === 2) return '操作提醒';
  return `补充观察 ${index + 1}`;
}

function getBlockText(block: string) {
  return block.replace(/^([^：:]{2,22})[：:]\s*/, '').trim();
}

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
            <article key={item.id} className="personal-report-card">
              <div className="personal-report-head">
                <div>
                  <span>{item.contentType}</span>
                  <h2>{item.title}</h2>
                </div>
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
              </div>
              <div className="personal-report-summary">
                <strong>专属摘要</strong>
                <p>{splitReportBody(item.body)[0] ? getBlockText(splitReportBody(item.body)[0]).slice(0, 120) : '专属内容已生成，请查看下方详情。'}</p>
              </div>
              <div className="personal-report-grid">
                {splitReportBody(item.body).map((block, index) => (
                  <section key={`${item.id}-${index}`} className="personal-report-section">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{getBlockTitle(block, index)}</h3>
                    <p>{getBlockText(block)}</p>
                  </section>
                ))}
              </div>
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
