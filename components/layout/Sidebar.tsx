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
  Layers,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', href: 'dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.merge', href: 'merge', icon: GitMerge },
  { labelKey: 'nav.history', href: 'history', icon: History },
  { labelKey: 'nav.settings', href: 'settings', icon: Settings },
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

  // Persist collapse state
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

  const isActive = (href: string) => {
    return pathname.includes(`/${locale}/${href}`);
  };

  // User initials za avatar
  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'MK';

  return (
    <motion.nav
      className="app-sidebar"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-12 px-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Layers size={14} strokeWidth={2.5} className="text-white" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono font-semibold text-sm tracking-tight overflow-hidden whitespace-nowrap"
                style={{ color: 'var(--text-1)' }}
              >
                MergeKit
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--text-3)' }}
          aria-label={
            collapsed ? t('nav.expand') : t('nav.collapse')
          }
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={2} />
          ) : (
            <ChevronLeft size={14} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-hidden">
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
                      color: active ? '#818cf8' : 'var(--text-3)',
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
      <div
        className="border-t p-3 flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-semibold"
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
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
                <p
                  className="text-xs truncate font-medium"
                  style={{ color: 'var(--text-2)' }}
                >
                  {userEmail ?? 'Korisnik'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="nav-item w-full text-left"
          title={collapsed ? t('nav.logout') : undefined}
          style={{ margin: 0 }}
        >
          <LogOut
            size={15}
            strokeWidth={2}
            style={{ color: 'var(--text-3)', flexShrink: 0 }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-xs"
                style={{ color: 'var(--text-3)' }}
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
