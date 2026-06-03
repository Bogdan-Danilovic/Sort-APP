import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import HistoryClient from '@/components/history/HistoryClient';
import { History } from 'lucide-react';
import type { Metadata } from 'next';
import type { MergedProduct } from '@/types';

export const metadata: Metadata = {
  title: 'Istorija',
};

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

// Client wrapper koji bridžuje između server page i client HistoryClient
// Kad se sesija učita, ide na /merge
function HistoryClientWrapper({ locale, userId }: { locale: string; userId: string }) {
  'use client';
  const { useRouter } = require('next/navigation');
  const router = useRouter();

  const handleLoadSession = (products: MergedProduct[]) => {
    // Čuvamo u sessionStorage, merge page će ga učitati
    sessionStorage.setItem('loaded-session', JSON.stringify(products));
    router.push(`/${locale}/merge`);
  };

  return (
    <HistoryClient
      locale={locale}
      userId={userId}
      onLoadSession={handleLoadSession}
    />
  );
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;
  const supabase = await createServerComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2.5"
            style={{ color: 'var(--text-1)' }}
          >
            <History size={20} style={{ color: 'var(--accent)' }} />
            Istorija spajanja
          </h1>
        </div>

        <HistoryClientWrapper locale={locale} userId={session.user.id} />
      </div>
    </AppShell>
  );
}
