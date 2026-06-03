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
        {/* pb uzima u obzir dock visinu (72px) + gap (16px) + buffer na mobilnom */}
        <div className="min-h-full p-4 md:p-6" style={{ paddingBottom: 'calc(var(--dock-h) + var(--dock-gap) + 24px)' }}>
          {children}
        </div>
      </main>

      <MobileNav locale={locale} />
    </div>
  );
}
