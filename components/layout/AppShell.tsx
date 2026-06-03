import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  userEmail?: string;
}

export default function AppShell({ children, locale, userEmail }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar locale={locale} userEmail={userEmail} />

      <main className="app-main">
        {/* pb na mobilnom = 60px dock + safe area + buffer */}
        <div className="min-h-full px-4 py-5 sm:px-6 md:px-8 md:py-8" style={{ paddingBottom: 'calc(var(--dock-h) + env(safe-area-inset-bottom) + 24px)' }}>
          {children}
        </div>
      </main>

      <MobileNav locale={locale} />
    </div>
  );
}
