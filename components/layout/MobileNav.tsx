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
    <div className="mobile-nav-container">
      <nav className="mobile-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const label = t(item.labelKey as Parameters<typeof t>[0]);

          return (
            <Link
              key={item.href}
              href={`/${locale}/${item.href}`}
              className="relative flex flex-col items-center justify-center w-16 h-12 transition-all duration-300 rounded-2xl"
              style={{
                color: active ? '#818cf8' : 'var(--text-3)',
                background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              }}
            >
              <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} className="transition-all duration-300" />
              {active && (
                <span className="text-[10px] font-semibold mt-1 tracking-tight animate-fade-in">
                  {String(label)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
