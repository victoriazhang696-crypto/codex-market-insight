"use client";

import { FormEvent, useEffect, useState } from 'react';

import { articleCategories, getArticleCategoryLabel, type ArticleCategory } from '@/lib/article-categories';

export default function AdminArticlesPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Array<{ id: string; title: string; status: string; slug: string; content_category?: ArticleCategory }>>([]);

  async function loadDrafts() {
    try {
      const response = await fetch('/api/admin/articles', { cache: 'no-store' });
      const payload = (await response.json()) as {
        ok: boolean;
        articles?: Array<{ id: string; title: string; slug: string; status: string; content_category?: ArticleCategory }>;
      };
      if (payload.ok && payload.articles) {
        setDrafts(payload.articles);
      }
    } catch {
      setDrafts([]);
    }
  }

  useEffect(() => {
    void loadDrafts();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage('正在提交文章...');

    const formData = new FormData(form);
    const payload = {
      title: String(formData.get('title') ?? ''),
      content: String(formData.get('content') ?? ''),
      summary: String(formData.get('summary') ?? ''),
      riskNotice: String(formData.get('riskNotice') ?? ''),
      status: String(formData.get('status') ?? 'draft') as 'draft' | 'published',
      category: String(formData.get('category') ?? 'market_today') as ArticleCategory
    };

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text) as { ok: boolean; message?: string }
        : { ok: false, message: '服务器没有返回内容。' };
      if (result.ok) {
        setMessage(payload.status === 'published' ? '文章已发布，会员前端可以查看。' : '草稿已保存。');
        form.reset();
        await loadDrafts();
      } else {
        setMessage(result.message ?? `发布失败，状态码：${response.status}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? `请求失败：${error.message}` : '网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Staff Only</p>
        <h1>文章发布</h1>
        <p className="lede">把标题、正文、摘要和风险提示放在一个工作区里，准备好后发布给会员前端。</p>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>AI 辅助发布</h2>
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>发布到</span>
            <select name="category" defaultValue="market_today">
              {articleCategories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <span className="subtle">选择会员前端显示栏目；后续独立功能也可以先作为栏目接入。</span>
          </label>
          <label>
            <span>标题</span>
            <input name="title" placeholder="今日市场洞察：黄金与美元" required />
          </label>
          <label>
            <span>正文</span>
            <textarea name="content" rows={8} placeholder="粘贴原文后，由 AI 整理成会员网页内容。" required />
          </label>
          <label>
            <span>摘要</span>
            <input name="summary" placeholder="AI 自动生成或人工填写" />
          </label>
          <label>
            <span>风险提示</span>
            <input name="riskNotice" placeholder="AI 自动生成或人工填写" />
          </label>
          <label>
            <span>状态</span>
            <select name="status">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
          <div className="inline-actions">
            <button className="secondary-button" type="button">生成摘要</button>
            <button className="secondary-button" type="button">生成风险提示</button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
        {message ? <p className="subtle" style={{ marginTop: 12 }}>{message}</p> : null}
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>草稿与已发布</h2>
        <div className="stack-list">
          {drafts.length > 0 ? drafts.map((item) => (
            <article key={item.id} className="stack-item">
              <div>
                <strong>{item.title}</strong>
                <span className="subtle">
                  {getArticleCategoryLabel(item.content_category ?? 'market_today')} · {item.status}
                </span>
              </div>
              <a href={`/admin/articles/${item.slug}`}>编辑 / 预览</a>
            </article>
          )) : (
            <article className="stack-item">
              <strong>暂无文章</strong>
              <span className="subtle">发布第一篇文章后，这里会自动显示。</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
