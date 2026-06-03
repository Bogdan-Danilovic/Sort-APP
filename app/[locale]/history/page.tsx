import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import HistoryClient from '@/components/history/HistoryClient';
import { History } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Istorija',
};

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
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

        <HistoryClient
          locale={locale}
          userId={session.user.id}
        />
      </div>
    </AppShell>
  );
}
