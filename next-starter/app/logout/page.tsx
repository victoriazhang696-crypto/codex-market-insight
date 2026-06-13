"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState('正在退出...');

  useEffect(() => {
    async function run() {
      try {
        window.localStorage.removeItem('member-login');
        window.sessionStorage.setItem('member-logout-intent', '1');
        await fetch('/api/auth/logout', { method: 'POST' });
        setMessage('退出成功，正在返回登录页...');
        router.replace('/login?loggedOut=1');
      } catch {
        setMessage('退出失败');
      }
    }

    void run();
  }, [router]);

  return (
    <main className="center-shell">
      <section className="auth-card">
        <p className="eyebrow">Logout</p>
        <h1>退出登录</h1>
        <p className="lede">{message}</p>
      </section>
    </main>
  );
}
