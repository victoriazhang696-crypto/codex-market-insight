"use client";

import { FormEvent, useEffect, useState } from 'react';

export default function AdminMembersPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Array<{
    id: string;
    account_number: string;
    full_name: string | null;
    phone: string | null;
    expire_date: string | null;
    status: string;
  }>>([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await fetch('/api/admin/members');
        const payload = (await response.json()) as {
          ok: boolean;
          members?: Array<{
            id: string;
            account_number: string;
            full_name: string | null;
            phone: string | null;
            expire_date: string | null;
            status: string;
          }>;
        };
        if (payload.ok && payload.members) {
          setMembers(payload.members);
        }
      } catch {
        setMembers([
          {
            id: 'seed-1',
            account_number: '10002888',
            full_name: '张先生',
            phone: '60123456789',
            expire_date: '2026-12-31',
            status: 'active'
          },
          {
            id: 'seed-2',
            account_number: '10002889',
            full_name: '李女士',
            phone: '60123456790',
            expire_date: '2026-06-30',
            status: 'expired'
          }
        ]);
      }
    }

    void loadMembers();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('正在创建客户...');

    const formData = new FormData(event.currentTarget);
    const payload = {
      accountNumber: String(formData.get('accountNumber') ?? ''),
      fullName: String(formData.get('fullName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      expireDate: String(formData.get('expireDate') ?? '')
    };

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as { ok: boolean; message?: string };
      setMessage(result.ok ? '客户创建请求已提交。' : result.message ?? '创建失败');
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card dark">
        <p className="eyebrow">Staff Only</p>
        <h1>客户管理</h1>
        <p className="lede">
          新增客户时输入 8 位账号、姓名、手机号和到期时间。初始密码就是手机号。
        </p>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>新增客户</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            <span className="label">8位账号</span>
            <input name="accountNumber" placeholder="10002888" />
          </label>
          <label>
            <span className="label">姓名</span>
            <input name="fullName" placeholder="张先生" />
          </label>
          <label>
            <span className="label">手机号</span>
            <input name="phone" placeholder="60123456789" />
          </label>
          <label>
            <span className="label">到期时间</span>
            <input name="expireDate" placeholder="2026-12-31" />
          </label>
          <button
            className="primary-button"
            type="submit"
            style={{ marginTop: 16, gridColumn: '1 / -1' }}
            disabled={loading}
          >
            {loading ? '创建中...' : '创建客户'}
          </button>
        </form>
        {message ? <p className="subtle" style={{ marginTop: 12 }}>{message}</p> : null}
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>客户列表</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>账号</th>
                <th>姓名</th>
                <th>手机号</th>
                <th>到期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.account_number}</td>
                  <td>{member.full_name}</td>
                  <td>{member.phone}</td>
                  <td>{member.expire_date}</td>
                  <td>{member.status}</td>
                  <td><a href={`/admin/members/${member.id}`}>编辑 / 续期 / 禁用</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
