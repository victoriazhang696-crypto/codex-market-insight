'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminLoginFormProps = {
  searchParams: {
    next?: string;
    reason?: string;
  };
};

export default function AdminLoginForm({ searchParams }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('正在登录...');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (payload.ok) {
        const next = searchParams.next || '/admin';
        setMessage('登录成功，正在跳转...');
        router.push(next);
      } else {
        setMessage(payload.message ?? '登录失败');
      }
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="center-shell">
      <section className="auth-card">
        <p className="eyebrow">Staff Login</p>
        <h1>工作人员登录</h1>
        <p className="lede">这里是后台专用登录口，只给内部工作人员使用。</p>
        {searchParams.reason === 'forbidden' ? (
          <p className="subtle">你没有后台权限，请使用工作人员账号登录。</p>
        ) : null}
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>管理员邮箱</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@company.com" />
          </label>
          <label>
            <span>管理员密码</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              type="password"
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? '登录中...' : '登录后台'}
          </button>
        </form>
        <div className="helper-box">
          {message ? <p className="subtle">{message}</p> : null}
          <p className="subtle">
            客户登录请走 <a href="/login">会员登录</a>
          </p>
        </div>
      </section>
    </main>
  );
}
