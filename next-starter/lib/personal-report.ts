export type PersonalReportSection = {
  title: string;
  body: string;
};

export type PersonalReport = {
  summary: string;
  sections: PersonalReportSection[];
};

const fallbackTitles = ['定制判断', '关键逻辑', '风险与机会', '执行提醒'];

function normalizeBody(body: string) {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/(模块[一二三四五六七八九十]+[:：])/g, '\n$1')
    .replace(/(配置建议[:：])/g, '\n$1')
    .replace(/(当前判断[:：])/g, '\n$1')
    .replace(/(BMA\s*结论[:：])/gi, '\n$1')
    .replace(/(Checklist[)）]?[:：])/gi, '\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitByParagraphs(normalized: string) {
  return normalized
    .split(/\n{1,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitBySentences(normalized: string) {
  return normalized
    .split(/(?<=[。！？；;])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<string[]>((groups, sentence) => {
      const last = groups[groups.length - 1] ?? '';
      if (!last || last.length > 320) {
        groups.push(sentence);
      } else {
        groups[groups.length - 1] = `${last}${sentence}`;
      }
      return groups;
    }, []);
}

function getBlockTitle(block: string, index: number) {
  const match = block.match(/^([^：:]{2,24})[：:]/);
  if (match) {
    return match[1].replace(/^模块[一二三四五六七八九十]+/, fallbackTitles[index] ?? '专属内容');
  }

  return fallbackTitles[index] ?? `重点 ${index + 1}`;
}

function getBlockText(block: string) {
  return block.replace(/^([^：:]{2,24})[：:]\s*/, '').trim();
}

function mergeIntoFour(blocks: string[]) {
  if (blocks.length <= 4) {
    return blocks;
  }

  const groupSize = Math.ceil(blocks.length / 4);
  const merged: string[] = [];

  for (let index = 0; index < blocks.length; index += groupSize) {
    merged.push(blocks.slice(index, index + groupSize).join('\n\n'));
  }

  return merged.slice(0, 4);
}

export function buildPersonalReport(body: string): PersonalReport {
  const normalized = normalizeBody(body);
  const paragraphBlocks = splitByParagraphs(normalized);
  const rawBlocks = paragraphBlocks.length > 1 ? paragraphBlocks : splitBySentences(normalized);
  const blocks = mergeIntoFour(rawBlocks.length > 0 ? rawBlocks : [normalized]);
  const sections = blocks.map((block, index) => ({
    title: getBlockTitle(block, index),
    body: getBlockText(block)
  })).filter((section) => section.body);
  const firstText = sections[0]?.body || normalized || '专属内容已生成，请查看完整报告。';
  const summary = firstText.length > 120 ? `${firstText.slice(0, 120)}...` : firstText;

  return {
    summary,
    sections
  };
}
