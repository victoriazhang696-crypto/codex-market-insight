"use client";

import { FormEvent, useState } from 'react';

import type { ContentArticle } from '@/lib/content';

type Props = {
  article: ContentArticle;
};

export function ArticleEditorForm({ article }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      status: String(formData.get('status') ?? article.status) as 'draft' | 'published'
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
      setMessage(result.ok ? '文章已保存。' : result.message ?? '保存失败');
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={onSubmit}>
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
        <textarea name="content" rows={8} defaultValue={article.content} />
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
