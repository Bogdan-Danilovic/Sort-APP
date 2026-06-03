'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  GitMerge,
  History,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  locale: string;
}

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', href: 'dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.merge', href: 'merge', icon: GitMerge },
  { labelKey: 'nav.history', href: 'history', icon: History },
  { labelKey: 'nav.settings', href: 'settings', icon: Settings },
] as const;

export default function MobileNav({ locale }: MobileNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(`/${locale}/${href}`);

  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        const label = t(item.labelKey as Parameters<typeof t>[0]);

        return (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              color: active ? '#818cf8' : 'var(--text-3)',
              background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {active && (
              <span className="text-2xs font-medium">{String(label)}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
