'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitMerge,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MergeKitLogo from '@/components/ui/MergeKitLogo';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', href: 'dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.merge',     href: 'merge',     icon: GitMerge },
  { labelKey: 'nav.history',   href: 'history',   icon: History },
  { labelKey: 'nav.settings',  href: 'settings',  icon: Settings },
];

interface SidebarProps {
  locale: string;
  userEmail?: string;
}

export default function Sidebar({ locale, userEmail }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
    router.refresh();
  };

  const isActive = (href: string) => pathname.includes(`/${locale}/${href}`);

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'MK';

  return (
    <motion.nav
      className="app-sidebar"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo area */}
      <div
        className="flex items-center h-[52px] px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #1f1f1f' }}
      >
        <div className="flex items-center flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <MergeKitLogo locale={locale} iconOnly />
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <MergeKitLogo locale={locale} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleCollapsed}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer"
          style={{ color: '#525252' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1a1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey as Parameters<typeof t>[0]);

            return (
              <li key={item.href}>
                <Link
                  href={`/${locale}/${item.href}`}
                  className={`nav-item ${active ? 'active' : ''}`}
                  title={collapsed ? String(label) : undefined}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.5 : 2}
                    style={{
                      color: active ? '#3a81f6' : '#a1a1a1',
                      flexShrink: 0,
                    }}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="truncate"
                      >
                        {String(label)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid #1f1f1f' }}>
        <div className="flex items-center gap-2 mb-2">
          {/* Gradient avatar */}
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #1a4eda, #3a81f6)',
              color: '#ffffff',
            }}
          >
            {initials}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs truncate" style={{ color: '#a1a1a1' }}>
                  {userEmail ?? 'Korisnik'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="nav-item w-full text-left"
          title={collapsed ? t('nav.logout') : undefined}
          style={{ margin: 0, opacity: signingOut ? 0.5 : 1 }}
        >
          <LogOut size={15} style={{ color: '#a1a1a1', flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-xs"
                style={{ color: '#a1a1a1' }}
              >
                {signingOut ? 'Odjavljivanje...' : t('nav.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.nav>
  );
}
