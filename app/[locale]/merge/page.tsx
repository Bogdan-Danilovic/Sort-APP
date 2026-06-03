import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import MergePageClient from '@/components/merge/MergePageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novo spajanje',
};

interface MergePageProps {
  params: Promise<{ locale: string }>;
}

export default async function MergePage({ params }: MergePageProps) {
  const { locale } = await params;
  const supabase = await createServerComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  // Dohvati podešavanja korisnika
  const { data: settingsData } = await supabase
    .from('merge_sessions')
    .select('id')
    .limit(1);

  const companyName = session.user.user_metadata?.['company_name'] as string | undefined;

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <MergePageClient
        locale={locale}
        userId={session.user.id}
        companyName={companyName}
      />
    </AppShell>
  );
}
