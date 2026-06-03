'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { LayoutDashboard, GitMerge, History, Settings } from 'lucide-react';

interface MobileNavProps {
  locale: string;
}

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', href: 'dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.merge',     href: 'merge',     icon: GitMerge },
  { labelKey: 'nav.history',   href: 'history',   icon: History },
  { labelKey: 'nav.settings',  href: 'settings',  icon: Settings },
] as const;

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

export default function MobileNav({ locale }: MobileNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(`/${locale}/${href}`);

  return (
    <div className="mobile-dock">
      <nav className="mobile-dock-inner" role="navigation" aria-label="Navigacija">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const label = String(t(item.labelKey as Parameters<typeof t>[0]));

          return (
            <Link
              key={item.href}
              href={`/${locale}/${item.href}`}
              className={`dock-item${active ? ' active' : ''}`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                animate={{
                  scale:   active ? 1.12 : 1,
                  opacity: active ? 1 : 0.55,
                }}
                transition={SPRING}
                className="relative flex items-center justify-center"
              >
                {active && (
                  <motion.div
                    layoutId="dock-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)' }}
                    transition={SPRING}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.75}
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-3)',
                    position: 'relative',
                  }}
                />
              </motion.div>

              <motion.span
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 4 }}
                transition={SPRING}
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--accent)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
