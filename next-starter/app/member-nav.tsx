'use client';

import { useEffect, useState } from 'react';

export type MemberNavItem = {
  label: string;
  href: string;
  enabled: boolean;
  active?: boolean;
  icon: string;
  badgeCount?: number;
  badgeKey?: string;
  badgeSignature?: string;
};

type Props = {
  items: MemberNavItem[];
  ariaLabel: string;
};

export default function MemberNav({ items, ariaLabel }: Props) {
  const [seenBadges, setSeenBadges] = useState<Record<string, string>>({});

  useEffect(() => {
    const entries = items
      .filter((item) => item.badgeKey)
      .map((item) => [item.badgeKey!, window.localStorage.getItem(`seen:${item.badgeKey}`) ?? '']);
    setSeenBadges(Object.fromEntries(entries));
  }, [items]);

  function rememberBadge(item: MemberNavItem) {
    if (!item.badgeKey || !item.badgeSignature) {
      return;
    }

    window.localStorage.setItem(`seen:${item.badgeKey}`, item.badgeSignature);
    setSeenBadges((current) => ({ ...current, [item.badgeKey!]: item.badgeSignature! }));
  }

  return (
    <nav className="member-nav" aria-label={ariaLabel}>
      {items.map((item) => {
        const hasUnread =
          Boolean(item.badgeKey && item.badgeSignature) &&
          Number(item.badgeCount ?? 0) > 0 &&
          seenBadges[item.badgeKey!] !== item.badgeSignature;

        return (
          <a
            key={item.href}
            className={`${item.active ? 'active' : ''} ${item.enabled ? '' : 'locked'}`}
            href={item.enabled ? item.href : '/soon'}
            aria-disabled={!item.enabled}
            onClick={() => rememberBadge(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {hasUnread ? <strong>{item.badgeCount}</strong> : null}
          </a>
        );
      })}
    </nav>
  );
}
