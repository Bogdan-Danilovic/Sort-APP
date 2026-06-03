import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import SettingsClient from '@/components/settings/SettingsClient';
import { Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podešavanja',
};

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const supabase = await createServerComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const userMeta = session.user.user_metadata as Record<string, unknown>;

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2.5"
            style={{ color: 'var(--text-1)' }}
          >
            <Settings size={20} style={{ color: 'var(--accent)' }} />
            Podešavanja
          </h1>
        </div>

        <SettingsClient
          locale={locale}
          userId={session.user.id}
          userEmail={session.user.email ?? ''}
          initialSettings={{
            companyName: (userMeta?.['company_name'] as string) ?? '',
            defaultCurrency: (userMeta?.['default_currency'] as 'din' | 'eur' | 'usd') ?? 'din',
            locale: locale as 'sr' | 'en',
            theme: (userMeta?.['theme'] as 'dark' | 'light' | 'system') ?? 'dark',
          }}
        />
      </div>
    </AppShell>
  );
}
