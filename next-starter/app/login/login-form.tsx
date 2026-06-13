'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { accountNumberToEmail, isEightDigitAccountNumber, normalizePhonePassword } from '@/lib/account';

type LoginFormProps = {
  searchParams: {
    next?: string;
    reason?: string;
    loggedOut?: string;
  };
};

export default function LoginForm({ searchParams }: LoginFormProps) {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('10002888');
  const [password, setPassword] = useState('60123456789');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(nextAccountNumber: string, nextPassword: string, shouldRemember: boolean) {
    setLoading(true);
    setMessage('正在登录...');

    try {
      const response = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountNumber: nextAccountNumber,
          password: nextPassword
        })
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (payload.ok) {
        const next = searchParams.next || '/';
        if (shouldRemember) {
          window.localStorage.setItem(
            'member-login',
            JSON.stringify({ accountNumber: nextAccountNumber, password: nextPassword })
          );
        } else {
          window.localStorage.removeItem('member-login');
        }
        setMessage('登录成功，正在跳转...');
        router.replace(next);
      } else {
        setMessage(payload.message ?? '登录失败');
      }
    } catch {
      setMessage('网络请求失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const wasExplicitLogout =
      searchParams.loggedOut === '1' || window.sessionStorage.getItem('member-logout-intent') === '1';

    if (wasExplicitLogout) {
      window.sessionStorage.removeItem('member-logout-intent');
      window.localStorage.removeItem('member-login');
      setRemember(false);
      setMessage('已退出登录，可以输入新的账号。');
      return;
    }

    const saved = window.localStorage.getItem('member-login');
    if (!saved || searchParams.reason) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as { accountNumber?: string; password?: string };
      if (parsed.accountNumber && parsed.password) {
        setAccountNumber(parsed.accountNumber);
        setPassword(parsed.password);
        setRemember(true);
        void login(parsed.accountNumber, parsed.password, true);
      }
    } catch {
      window.localStorage.removeItem('member-login');
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(accountNumber, password, remember);
  }

  return (
    <main className="center-shell">
      <section className="auth-card">
        <p className="eyebrow">Member Login</p>
        <h1>会员登录</h1>
        <p className="lede">
          输入 8 位账号和手机号密码登录。系统会把账号映射到内部认证邮箱。
        </p>
        {searchParams.reason === 'inactive' ? (
          <p className="subtle">您的阅读权限已到期，请联系顾问续期开通。</p>
        ) : null}
        {searchParams.reason === 'member_required' ? (
          <p className="subtle">请使用会员账号登录客户前端。管理员账号只能进入管理后台。</p>
        ) : null}
        <form className="form-stack" onSubmit={onSubmit}>
          <label>
            <span>8位账号</span>
            <input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="10002888"
            />
          </label>
          <label>
            <span>手机号密码</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="60123456789"
              type="password"
            />
          </label>
          <label className="checkbox-row">
            <input
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              type="checkbox"
            />
            <span>记住账号和密码，下次自动登录</span>
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className="helper-box">
          <p className="subtle">
            账号示例：{accountNumberToEmail('10002888')}
          </p>
          <p className="subtle">
            校验规则：{String(isEightDigitAccountNumber('10002888'))} / 密码示例：{normalizePhonePassword('60123456789')}
          </p>
          {message ? <p className="subtle">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}
