"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type MemberRecord = {
  id: string;
  account_number: string;
  full_name: string | null;
  phone: string | null;
  expire_date: string | null;
  status: string;
};

export default function AdminMemberEditorPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMember() {
      try {
        const response = await fetch(`/api/admin/members/${id}`);
        const payload = (await response.json()) as { ok: boolean; member?: MemberRecord };
        if (payload.ok && payload.member) {
          setMember(payload.member);
        }
      } catch {
        setMember({
          id,
          account_number: '10002888',
          full_name: '张先生',
          phone: '60123456789',
          expire_date: '2026-12-31',
          status: 'active'
        });
      }
    }

    void loadMember();
  }, [id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) return;
    setLoading(true);
    setMessage('正在保存...');

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get('fullName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      expireDate: String(formData.get('expireDate') ?? ''),
      status: String(formData.get('status') ?? 'active') as 'active' | 'expired' | 'disabled'
    };

    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok: boolean; message?: string };
      setMessage(result.ok ? '客户资料已保存。' : result.message ?? '保存失败');
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  if (!member) {
    return (
      <main className="page-shell">
        <section className="hero-card dark">
          <p className="eyebrow">客户编辑</p>
          <h1>正在加载...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">客户编辑</p>
        <h1>{member.full_name}</h1>
        <p className="lede">在这里修改客户名称、手机号、到期时间和状态。</p>
        <div className="inline-actions">
          <span className="secondary-link">账号 {member.account_number}</span>
          <span className="secondary-link">初始密码 = 手机号</span>
          <a className="secondary-link" href="/admin/members">返回客户列表</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>编辑客户资料</h2>
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>姓名</span>
            <input name="fullName" defaultValue={member.full_name ?? ''} />
          </label>
          <label>
            <span>手机号</span>
            <input name="phone" defaultValue={member.phone ?? ''} />
          </label>
          <label>
            <span>到期时间</span>
            <input name="expireDate" defaultValue={member.expire_date ?? ''} />
          </label>
          <label>
            <span>状态</span>
            <select name="status" defaultValue={member.status}>
              <option value="active">active</option>
              <option value="expired">expired</option>
              <option value="disabled">disabled</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存客户'}
          </button>
        </form>
        {message ? <p className="subtle" style={{ marginTop: 12 }}>{message}</p> : null}
      </section>
    </main>
  );
}
