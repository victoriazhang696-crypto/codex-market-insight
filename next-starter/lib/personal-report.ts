export type PersonalReportSection = {
  title: string;
  paragraphs: string[];
};

export type PersonalReport = {
  summary: string;
  sections: PersonalReportSection[];
  conclusion: string[];
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

function splitInnerParagraphs(text: string) {
  return text
    .replace(/\s+(?=(模块[一二三四五六七八九十]+[:：]))/g, '\n')
    .replace(/(?<=[。！？；;])\s+(?=([一-龥]{2,14}[）)]?[:：]))/g, '\n')
    .replace(/(?<=[。！？；;])\s+(?=(其核心|新旧经济|逆向思考|反垄断|财务与自由现金流|管理层质地|估值与安全边际|盈利叙事|仓位管理|交易与参与周期|未来|BMA\s*结论|Checklist)[^。！？；;]{0,18}[:：])/gi, '\n')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      if (paragraph.length <= 260) {
        return [paragraph];
      }

      return paragraph
        .split(/(?<=[。！？；;])\s+/)
        .reduce<string[]>((groups, sentence) => {
          const last = groups[groups.length - 1] ?? '';
          if (!last || last.length > 260) {
            groups.push(sentence.trim());
          } else {
            groups[groups.length - 1] = `${last}${sentence.trim()}`;
          }
          return groups;
        }, [])
        .filter(Boolean);
    });
}

function splitConclusion(normalized: string) {
  const match = normalized.match(/(?:^|\n|\s)(?:结论|BMA\s*结论|最终结论|核心结论)[：:]\s*(.+)$/is);

  if (!match) {
    return {
      main: normalized,
      conclusion: []
    };
  }

  const conclusionStart = match.index ?? normalized.length;
  const main = normalized.slice(0, conclusionStart).trim();
  const conclusion = splitInnerParagraphs(match[1].trim());

  return {
    main: main || normalized,
    conclusion
  };
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
  const { main, conclusion } = splitConclusion(normalized);
  const paragraphBlocks = splitByParagraphs(main);
  const rawBlocks = paragraphBlocks.length > 1 ? paragraphBlocks : splitBySentences(main);
  const blocks = mergeIntoFour(rawBlocks.length > 0 ? rawBlocks : [normalized]);
  const sections = blocks.map((block, index) => ({
    title: getBlockTitle(block, index),
    paragraphs: splitInnerParagraphs(getBlockText(block))
  })).filter((section) => section.paragraphs.length > 0);
  const firstText = sections[0]?.paragraphs.join(' ') || normalized || '专属内容已生成，请查看完整报告。';
  const summary = firstText.length > 120 ? `${firstText.slice(0, 120)}...` : firstText;

  return {
    summary,
    sections,
    conclusion
  };
}
