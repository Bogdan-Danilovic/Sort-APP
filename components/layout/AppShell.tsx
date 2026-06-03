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
      {/* Desktop Sidebar */}
      <Sidebar locale={locale} userEmail={userEmail} />

      {/* Main content */}
      <main className="app-main">
        <div
          className="min-h-full p-6 pb-20 md:pb-6"
          style={{ maxWidth: '100%' }}
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav locale={locale} />
    </div>
  );
}
