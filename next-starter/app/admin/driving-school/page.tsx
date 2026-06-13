"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

import { normalizeFeatureExpiries, type FeatureExpiries } from '@/lib/feature-permissions';

type DrivingSchoolMember = {
  id: string;
  account_number: string;
  full_name: string | null;
  phone: string | null;
  expire_date: string | null;
  status: string;
  compute_credits?: number | null;
  feature_expiries?: FeatureExpiries | null;
};

type DrivingSchoolContent = {
  id: string;
  target_user_id: string;
  title: string;
  body: string;
  content_type: string;
  attachment_url: string | null;
  compute_cost?: number | null;
  status: string;
  created_at: string;
  profiles?: {
    account_number?: string | null;
    full_name?: string | null;
  } | null;
};

type ContentForm = {
  targetUserId: string;
  contentType: string;
  title: string;
  body: string;
  attachmentUrl: string;
  status: 'draft' | 'published' | 'hidden';
};

const emptyForm: ContentForm = {
  targetUserId: '',
  contentType: '定制内容',
  title: '',
  body: '',
  attachmentUrl: '',
  status: 'published'
};

function formatComputeCredits(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
}

export default function AdminDrivingSchoolPage() {
  const [members, setMembers] = useState<DrivingSchoolMember[]>([]);
  const [contents, setContents] = useState<DrivingSchoolContent[]>([]);
  const [formValue, setFormValue] = useState<ContentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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
    setLoading(true);
    setMessage(editingId ? '正在更新专属内容...' : '正在保存专属内容...');

    const payload = {
      serviceKey: 'driving_school',
      ...formValue
    };

    try {
      const response = await fetch(editingId ? `/api/admin/personal-contents/${editingId}` : '/api/admin/personal-contents', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        computeCost?: number;
        remainingCredits?: number | null;
      };
      if (result.ok) {
        const cost = formatComputeCredits(result.computeCost);
        const remaining = result.remainingCredits === null || result.remainingCredits === undefined
          ? null
          : formatComputeCredits(result.remainingCredits);
        if (cost > 0) {
          setMessage(`专属内容已保存，已扣 ${cost} 算力${remaining === null ? '' : `，剩余 ${remaining} 算力`}。`);
        } else {
          setMessage(editingId ? '专属内容已更新，未重复扣算力。' : '专属内容已保存；发布给客户可见时会扣 88 算力。');
        }
        setFormValue(emptyForm);
        setEditingId(null);
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

  function updateForm<K extends keyof ContentForm>(field: K, value: ContentForm[K]) {
    setFormValue((current) => ({ ...current, [field]: value }));
  }

  function editContent(item: DrivingSchoolContent) {
    setEditingId(item.id);
    setFormValue({
      targetUserId: item.target_user_id,
      contentType: item.content_type,
      title: item.title,
      body: item.body,
      attachmentUrl: item.attachment_url ?? '',
      status: item.status === 'draft' || item.status === 'hidden' ? item.status : 'published'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadFile(file: File, folder: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await fetch('/api/admin/uploads', {
      method: 'POST',
      body: formData
    });
    const result = (await response.json()) as { ok: boolean; url?: string; message?: string; fileType?: string };
    if (!result.ok || !result.url) {
      throw new Error(result.message ?? '上传失败');
    }
    return result;
  }

  async function onAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('正在上传附件...');
    try {
      const result = await uploadFile(file, 'driving-school-attachments');
      updateForm('attachmentUrl', result.url ?? '');
      setMessage('附件已上传。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '上传失败');
    } finally {
      event.target.value = '';
    }
  }

  async function onContentImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('正在上传正文图片...');
    try {
      const result = await uploadFile(file, 'driving-school-images');
      const markdown = `\n\n![内容图片](${result.url})\n\n`;
      const textarea = bodyRef.current;
      const start = textarea?.selectionStart ?? formValue.body.length;
      const end = textarea?.selectionEnd ?? formValue.body.length;
      const nextBody = `${formValue.body.slice(0, start)}${markdown}${formValue.body.slice(end)}`;
      updateForm('body', nextBody);
      setMessage('图片已插入正文。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '上传失败');
    } finally {
      event.target.value = '';
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
      const result = (await response.json()) as { ok: boolean; message?: string; computeCost?: number; remainingCredits?: number | null };
      if (result.ok) {
        const cost = formatComputeCredits(result.computeCost);
        const remaining = result.remainingCredits === null || result.remainingCredits === undefined
          ? null
          : formatComputeCredits(result.remainingCredits);
        setMessage(cost > 0 ? `状态已更新，已扣 ${cost} 算力${remaining === null ? '' : `，剩余 ${remaining} 算力`}。` : '状态已更新。');
      } else {
        setMessage(result.message ?? '更新失败');
      }
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
        <h2>{editingId ? '编辑定向内容' : '发布定向内容'}</h2>
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>接收客户</span>
            <select name="targetUserId" value={formValue.targetUserId} onChange={(event) => updateForm('targetUserId', event.target.value)} required>
              <option value="">选择已开通环球驾校权限的客户</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name ?? '会员'} · {member.account_number} · 算力 {formatComputeCredits(member.compute_credits)} · 环球驾校至 {normalizeFeatureExpiries(member.feature_expiries).driving_school ?? '长期有效'}
                </option>
              ))}
            </select>
            {formValue.targetUserId ? (
              <span className="subtle">
                当前客户算力：{formatComputeCredits(members.find((member) => member.id === formValue.targetUserId)?.compute_credits)}。新发布一篇可见内容扣 88，编辑已发布内容不重复扣。
              </span>
            ) : null}
          </label>
          <label>
            <span>内容类型</span>
            <select name="contentType" value={formValue.contentType} onChange={(event) => updateForm('contentType', event.target.value)}>
              <option value="定制内容">定制内容</option>
              <option value="课程提醒">课程提醒</option>
              <option value="学习计划">学习计划</option>
              <option value="AI建议">AI建议</option>
              <option value="文件资料">文件资料</option>
            </select>
          </label>
          <label>
            <span>标题</span>
            <input name="title" value={formValue.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="例如：Simin 第1周环球驾校专属计划" required />
          </label>
          <label>
            <span>内容</span>
            <textarea ref={bodyRef} name="body" rows={8} value={formValue.body} onChange={(event) => updateForm('body', event.target.value)} placeholder="填写只给该客户看的专属内容；可用“结论：”开头写最后结论" required />
            <span className="subtle">插图会插入到光标位置，前端会自动显示为图片。</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void onContentImageUpload(event)} />
          </label>
          <label>
            <span>附件 PDF / 图片</span>
            <input name="attachmentUrl" value={formValue.attachmentUrl} onChange={(event) => updateForm('attachmentUrl', event.target.value)} placeholder="上传后自动生成链接，也可粘贴外部链接" />
            <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void onAttachmentUpload(event)} />
          </label>
          <label>
            <span>状态</span>
            <select name="status" value={formValue.status} onChange={(event) => updateForm('status', event.target.value as ContentForm['status'])}>
              <option value="published">发布给客户可见</option>
              <option value="hidden">先隐藏</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <div className="inline-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? '保存中...' : editingId ? '保存修改' : '保存专属内容'}
            </button>
            {editingId ? (
              <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setFormValue(emptyForm); }}>
                取消编辑
              </button>
            ) : null}
          </div>
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
                {item.profiles?.full_name ?? '会员'} · {item.profiles?.account_number ?? item.target_user_id} · {item.content_type} · {item.status} · 消耗 {formatComputeCredits(item.compute_cost)} 算力
              </span>
              <span className="inline-actions">
                <button className="secondary-button" type="button" onClick={() => editContent(item)}>编辑</button>
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
