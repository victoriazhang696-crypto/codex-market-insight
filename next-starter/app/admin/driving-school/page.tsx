"use client";

import { FormEvent, useEffect, useState } from 'react';

type DrivingSchoolMember = {
  id: string;
  account_number: string;
  full_name: string | null;
  phone: string | null;
  expire_date: string | null;
  status: string;
};

type DrivingSchoolContent = {
  id: string;
  target_user_id: string;
  title: string;
  body: string;
  content_type: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
  profiles?: {
    account_number?: string | null;
    full_name?: string | null;
  } | null;
};

export default function AdminDrivingSchoolPage() {
  const [members, setMembers] = useState<DrivingSchoolMember[]>([]);
  const [contents, setContents] = useState<DrivingSchoolContent[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const response = await fetch('/api/admin/personal-contents', { cache: 'no-store' });
      const payload = (await response.json()) as {
        ok: boolean;
        members?: DrivingSchoolMember[];
        contents?: DrivingSchoolContent[];
        message?: string;
      };
      if (payload.ok) {
        setMembers(payload.members ?? []);
        setContents(payload.contents ?? []);
        setMessage(payload.message ? `提示：${payload.message}` : '');
      } else {
        setMessage(payload.message ?? '加载失败');
      }
    } catch {
      setMessage('网络请求失败');
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    setMessage('正在保存专属内容...');

    const payload = {
      serviceKey: 'driving_school',
      targetUserId: String(formData.get('targetUserId') ?? ''),
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
      contentType: String(formData.get('contentType') ?? ''),
      attachmentUrl: String(formData.get('attachmentUrl') ?? ''),
      status: String(formData.get('status') ?? 'published')
    };

    try {
      const response = await fetch('/api/admin/personal-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { ok: boolean; message?: string };
      if (result.ok) {
        setMessage('专属内容已保存。');
        form.reset();
        await loadData();
      } else {
        setMessage(result.message ?? '保存失败');
      }
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'published' | 'hidden') {
    setMessage(status === 'published' ? '正在显示内容...' : '正在隐藏内容...');
    try {
      const response = await fetch(`/api/admin/personal-contents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = (await response.json()) as { ok: boolean; message?: string };
      setMessage(result.ok ? '状态已更新。' : result.message ?? '更新失败');
      if (result.ok) await loadData();
    } catch {
      setMessage('网络请求失败');
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Staff Only</p>
        <h1>环球驾校专属</h1>
        <p className="lede">
          给已开通环球驾校权限的铁粉客户发布定向内容。每个客户只会看到发给自己的内容。
        </p>
        <div className="inline-actions">
          <a className="secondary-link" href="/admin">返回后台首页</a>
          <a className="secondary-link" href="/admin/members">开通客户权限</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>发布定向内容</h2>
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>接收客户</span>
            <select name="targetUserId" required>
              <option value="">选择已开通环球驾校权限的客户</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name ?? '会员'} · {member.account_number} · 到期 {member.expire_date ?? '未设置'}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>内容类型</span>
            <select name="contentType" defaultValue="定制内容">
              <option value="定制内容">定制内容</option>
              <option value="课程提醒">课程提醒</option>
              <option value="学习计划">学习计划</option>
              <option value="AI建议">AI建议</option>
              <option value="文件资料">文件资料</option>
            </select>
          </label>
          <label>
            <span>标题</span>
            <input name="title" placeholder="例如：Simin 第1周环球驾校专属计划" required />
          </label>
          <label>
            <span>内容</span>
            <textarea name="body" rows={8} placeholder="填写只给该客户看的专属内容" required />
          </label>
          <label>
            <span>附件或外部链接</span>
            <input name="attachmentUrl" placeholder="可选：https://..." />
          </label>
          <label>
            <span>状态</span>
            <select name="status" defaultValue="published">
              <option value="published">发布给客户可见</option>
              <option value="hidden">先隐藏</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存专属内容'}
          </button>
        </form>
        {message ? <p className="subtle" style={{ marginTop: 12 }}>{message}</p> : null}
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>已创建内容</h2>
        <div className="member-list">
          {contents.length > 0 ? contents.map((item) => (
            <article key={item.id} className="member-list-row">
              <strong>{item.title}</strong>
              <span>
                {item.profiles?.full_name ?? '会员'} · {item.profiles?.account_number ?? item.target_user_id} · {item.content_type} · {item.status}
              </span>
              <span className="inline-actions">
                <button className="secondary-button" type="button" onClick={() => void updateStatus(item.id, 'published')}>显示</button>
                <button className="secondary-button" type="button" onClick={() => void updateStatus(item.id, 'hidden')}>隐藏</button>
              </span>
            </article>
          )) : (
            <article className="member-list-row">
              <strong>暂无定向内容</strong>
              <span>先给客户开通环球驾校权限，再发布专属内容。</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
