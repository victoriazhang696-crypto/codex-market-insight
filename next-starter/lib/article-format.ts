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

  return normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part): ArticleBlock => {
      const headingMatch = part.match(/^【([^】]+)】\s*(.*)$/s);
      if (headingMatch) {
        return {
          heading: headingMatch[1],
          body: headingMatch[2].trim()
        };
      }

      return { body: part };
    });
}

export function getArticlePreviewBlocks(content: string, limit = 3) {
  return splitArticleBlocks(content).slice(0, limit);
}
