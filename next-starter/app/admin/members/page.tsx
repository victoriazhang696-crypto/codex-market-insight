"use client";

import { FormEvent, useEffect, useState } from 'react';

import {
  defaultMemberPermissions,
  featurePermissions,
  normalizeFeatureExpiries,
  normalizeFeaturePermissions,
  type FeatureExpiries,
  type FeaturePermission
} from '@/lib/feature-permissions';

type Member = {
  id: string;
  account_number: string;
  full_name: string | null;
  phone: string | null;
  expire_date: string | null;
  status: string;
  feature_permissions?: FeaturePermission[] | null;
  feature_expiries?: FeatureExpiries | null;
};

function collectPermissionExpiries(formData: FormData) {
  return Object.fromEntries(
    featurePermissions
      .map((item) => [item.value, String(formData.get(`expiry_${item.value}`) ?? '').trim()])
      .filter(([, value]) => value)
  );
}

export default function AdminMembersPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  async function loadMembers() {
    try {
      const response = await fetch('/api/admin/members', { cache: 'no-store' });
      const payload = (await response.json()) as {
        ok: boolean;
        members?: Member[];
        message?: string;
      };
      if (payload.ok && payload.members) {
        setMembers(payload.members);
      }
    } catch {
      setMembers([]);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage('正在创建客户...');

    const formData = new FormData(form);
    const payload = {
      accountNumber: String(formData.get('accountNumber') ?? ''),
      fullName: String(formData.get('fullName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      permissions: formData.getAll('permissions').map(String) as FeaturePermission[],
      permissionExpiries: collectPermissionExpiries(formData)
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
      if (result.ok) {
        setMessage(`客户创建成功。账号：${payload.accountNumber}，密码：${payload.phone}`);
        form.reset();
        await loadMembers();
      } else {
        setMessage(result.message ?? '创建失败');
      }
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
          新增客户时输入 8 位账号、姓名和手机号。初始密码就是手机号，阅读期限按栏目单独设置。
        </p>
        <div className="inline-actions">
          <a className="secondary-link" href="/admin">返回后台首页</a>
        </div>
      </section>

      <section className="hero-card" style={{ marginTop: 16 }}>
        <h2>新增客户</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            <span className="label">8位账号</span>
            <input name="accountNumber" placeholder="10002888" required />
          </label>
          <label>
            <span className="label">姓名</span>
            <input name="fullName" placeholder="张先生" required />
          </label>
          <label>
            <span className="label">手机号</span>
            <input name="phone" placeholder="60123456789" required />
          </label>
          <fieldset className="form-fieldset">
            <legend>开通权限</legend>
            <div className="permission-grid">
              {featurePermissions.map((item) => (
                <div key={item.value} className="permission-option">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      name="permissions"
                      value={item.value}
                      defaultChecked={defaultMemberPermissions.includes(item.value)}
                    />
                    <span>{item.label}</span>
                  </label>
                  <input name={`expiry_${item.value}`} type="date" aria-label={`${item.label} 单独到期日`} />
                  <span className="subtle">留空表示长期有效</span>
                </div>
              ))}
            </div>
          </fieldset>
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
                <th>状态</th>
                <th>权限</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? members.map((member) => (
                <tr key={member.id}>
                  <td>{member.account_number}</td>
                  <td>{member.full_name}</td>
                  <td>{member.phone}</td>
                  <td>{member.status}</td>
                  <td>
                    {normalizeFeaturePermissions(member.feature_permissions).map((permission) => (
                      <span key={permission} className="mini-badge">
                        {featurePermissions.find((item) => item.value === permission)?.label ?? permission}
                        {normalizeFeatureExpiries(member.feature_expiries)[permission]
                          ? ` 至 ${normalizeFeatureExpiries(member.feature_expiries)[permission]}`
                          : ''}
                      </span>
                    ))}
                  </td>
                  <td><a href={`/admin/members/${member.id}`}>编辑 / 续期 / 禁用</a></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>暂无客户</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
