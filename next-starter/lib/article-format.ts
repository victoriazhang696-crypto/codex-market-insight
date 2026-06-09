export type ArticleBlock = {
  heading?: string;
  body: string;
};

export function splitArticleBlocks(content: string) {
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/\s+(?=【)/g, '\n\n')
    .replace(/\s+(?=🎯|👉|✅|❌|💡)/g, '\n\n')
    .replace(/。\s+(?=【|🎯|👉|✅|❌|💡)/g, '。\n\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const rawParts = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const parts: string[] = [];

  for (let index = 0; index < rawParts.length; index += 1) {
    const part = rawParts[index];

    if (part === '💡' && rawParts[index + 1]?.startsWith('【')) {
      parts.push(`💡 ${rawParts[index + 1]}`);
      index += 1;
      continue;
    }

    parts.push(part);
  }

  return parts
    .map((part): ArticleBlock => {
      const headingMatch = part.match(/^(💡\s*)?【([^】]+)】\s*(.*)$/s);
      if (headingMatch) {
        return {
          heading: `${headingMatch[1] ?? ''}${headingMatch[2]}`,
          body: headingMatch[3].trim()
        };
      }

      return { body: part };
    });
}

export function getArticlePreviewBlocks(content: string, limit = 3) {
  return splitArticleBlocks(content).slice(0, limit);
}
