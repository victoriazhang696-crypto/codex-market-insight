import type { ReactNode } from 'react';

const imagePattern = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

export function renderRichParagraph(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(imagePattern)) {
    const index = match.index ?? 0;
    const before = text.slice(lastIndex, index).trim();

    if (before) {
      nodes.push(<span key={`text-${index}`}>{before}</span>);
    }

    nodes.push(
      <a
        key={`image-${index}`}
        className="rich-content-image-link"
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        aria-label="打开内容图片大图"
      >
        <img
          className="rich-content-image"
          src={match[2]}
          alt={match[1] || '内容图片'}
          loading="lazy"
        />
        <small>点击查看大图</small>
      </a>
    );
    lastIndex = index + match[0].length;
  }

  const rest = text.slice(lastIndex).trim();
  if (rest) {
    nodes.push(<span key="text-end">{rest}</span>);
  }

  return nodes.length > 0 ? nodes : [text];
}
