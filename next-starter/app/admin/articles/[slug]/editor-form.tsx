"use client";

import { ChangeEvent, FormEvent, useRef, useState } from 'react';

import { articleCategories, type ArticleCategory } from '@/lib/article-categories';
import type { ContentArticle } from '@/lib/content';

const publishableArticleCategories = articleCategories.filter((item) => item.value !== 'driving_school');

type Props = {
  article: ContentArticle;
};

export function ArticleEditorForm({ article }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('正在保存...');

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get('title') ?? ''),
      summary: String(formData.get('summary') ?? ''),
      content: String(formData.get('content') ?? ''),
      riskNotice: String(formData.get('riskNotice') ?? ''),
      status: String(formData.get('status') ?? article.status) as 'draft' | 'published',
      category: String(formData.get('category') ?? article.category) as ArticleCategory
    };

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok: boolean; message?: string };
      setMessage(
        result.ok
          ? payload.status === 'published'
            ? '文章已发布，会员前端可以查看。'
            : '草稿已保存。'
          : result.message ?? '保存失败'
      );
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  async function uploadArticleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('正在上传正文图片...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'article-images');

    try {
      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: formData
      });
      const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (!result.ok || !result.url) {
        setMessage(result.message ?? '图片上传失败');
        return;
      }

      const textarea = contentRef.current;
      if (textarea) {
        const markdown = `\n\n![内容图片](${result.url})\n\n`;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = `${textarea.value.slice(0, start)}${markdown}${textarea.value.slice(end)}`;
        textarea.focus();
        textarea.selectionStart = start + markdown.length;
        textarea.selectionEnd = start + markdown.length;
      }
      setMessage('图片已插入正文。');
    } catch (error) {
      setMessage(error instanceof Error ? `上传失败：${error.message}` : '图片上传失败');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <label>
        <span>发布到</span>
        <select name="category" defaultValue={article.category}>
          {publishableArticleCategories.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>标题</span>
        <input name="title" defaultValue={article.title} />
      </label>
      <label>
        <span>摘要</span>
        <input name="summary" defaultValue={article.summary} />
      </label>
      <label>
        <span>正文</span>
        <textarea ref={contentRef} name="content" rows={8} defaultValue={article.content} />
        <span className="subtle">插图会插入到光标位置，前端会自动显示为图片。</span>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadArticleImage(event)} />
      </label>
      <label>
        <span>风险提示</span>
        <input name="riskNotice" defaultValue={article.riskNotice} />
      </label>
      <label>
        <span>状态</span>
        <select name="status" defaultValue={article.status}>
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </label>
      <div className="inline-actions">
        <button className="secondary-button" type="button">生成摘要</button>
        <button className="secondary-button" type="button">生成风险提示</button>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存文章'}
        </button>
      </div>
      {message ? <p className="subtle">{message}</p> : null}
    </form>
  );
}
