'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { LayoutDashboard, GitMerge, History, Settings, Plus } from 'lucide-react';

interface MobileNavProps {
  locale: string;
}

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', href: 'dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.history',   href: 'history',   icon: History },
  { labelKey: 'nav.settings',  href: 'settings',  icon: Settings },
] as const;

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

export default function MobileNav({ locale }: MobileNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(`/${locale}/${href}`);
  const mergeActive = pathname.includes(`/${locale}/merge`);

  return (
    <div className="mobile-dock">
      <nav className="mobile-dock-inner" role="navigation" aria-label="Navigacija">
        {/* Home */}
        {NAV_ITEMS.slice(0, 1).map((item) => {
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
                animate={{ scale: active ? 1.1 : 1 }}
                transition={SPRING}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              </motion.div>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Center: "+ Novo" floating button */}
        <div className="flex flex-col items-center justify-center" style={{ marginTop: -12 }}>
          <Link
            href={`/${locale}/merge`}
            aria-label="Novo spajanje"
          >
            <motion.div
              whileTap={{ scale: 0.93 }}
              transition={SPRING}
              className="flex items-center justify-center rounded-full cursor-pointer"
              style={{
                width: 48,
                height: 48,
                background: mergeActive
                  ? 'linear-gradient(135deg, #1a4eda, #3a81f6)'
                  : '#3a81f6',
                boxShadow: '0 4px 20px rgba(58, 129, 246, 0.5)',
              }}
            >
              <Plus size={22} strokeWidth={2.5} style={{ color: '#ffffff' }} />
            </motion.div>
          </Link>
          <span
            className="text-[10px] font-medium mt-1"
            style={{ color: mergeActive ? '#3a81f6' : '#a1a1a1' }}
          >
            Novo
          </span>
        </div>

        {/* History + Settings */}
        {NAV_ITEMS.slice(1).map((item) => {
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
                animate={{ scale: active ? 1.1 : 1 }}
                transition={SPRING}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              </motion.div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
