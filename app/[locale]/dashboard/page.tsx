import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import { GitMerge, History, Clock, Package } from 'lucide-react';
import type { Metadata } from 'next';
import type { MergeSessionRow } from '@/types';

export const metadata: Metadata = {
  title: 'Kontrolna tabla',
};

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `pre ${minutes}min`;
  if (hours < 24) return `pre ${hours}h`;
  return `pre ${days}d`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const supabase = await createServerComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: sessions } = await supabase
    .from('merge_sessions')
    .select('id, session_name, created_at, source_files, merged_result')
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalCount } = await supabase
    .from('merge_sessions')
    .select('id', { count: 'exact', head: true });

  const typedSessions = (sessions ?? []) as unknown as MergeSessionRow[];
  const totalSessions = totalCount ?? 0;
  const lastSession = typedSessions[0];

  const totalProducts = typedSessions.reduce((acc, s) => {
    const result = s.merged_result;
    return acc + (Array.isArray(result) ? result.length : 0);
  }, 0);

  const userInitials = session.user.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : 'MK';

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Hero card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#111111',
            border: '1px solid #1f1f1f',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* User info */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1a4eda, #3a81f6)', color: '#ffffff' }}
              >
                {userInitials}
              </div>
              <div>
                <h1 className="text-xl font-semibold mb-1" style={{ color: '#fafafa' }}>
                  Dobrodošli nazad
                </h1>
                <p className="text-sm font-mono" style={{ color: '#525252' }}>
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/${locale}/merge`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all self-start sm:self-auto"
              style={{
                background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                color: '#ffffff',
                boxShadow: '0 4px 24px rgba(58, 129, 246, 0.4)',
              }}
            >
              <GitMerge size={16} strokeWidth={2} />
              Novo spajanje
            </Link>
          </div>
        </div>

        {/* Stats — bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Ukupno spajanja',
              value: String(totalSessions),
              icon: History,
              color: '#91c5ff',
            },
            {
              label: 'Poslednje',
              value: lastSession ? timeAgo(lastSession.created_at) : 'Nikad',
              icon: Clock,
              color: '#fcd34d',
              mono: true,
            },
            {
              label: 'Ukupno proizvoda',
              value: String(totalProducts),
              icon: Package,
              color: '#34d399',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-6 rounded-xl"
                style={{
                  background: '#111111',
                  border: '1px solid #1f1f1f',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#525252' }}>
                    {stat.label}
                  </p>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Icon size={15} style={{ color: stat.color }} />
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold ${stat.mono ? 'font-mono' : ''}`}
                  style={{ color: '#fafafa' }}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>
              Poslednja spajanja
            </h2>
            <Link
              href={`/${locale}/history`}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#91c5ff' }}
            >
              <History size={13} strokeWidth={2} />
              Sva spajanja
            </Link>
          </div>

          {typedSessions.length === 0 ? (
            <div
              className="py-16 text-center rounded-2xl"
              style={{ background: '#111111', border: '1px solid #1f1f1f' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#1a1a1a' }}
              >
                <Package size={22} style={{ color: '#333333' }} />
              </div>
              <p className="font-medium mb-2 text-sm" style={{ color: '#a1a1a1' }}>
                Još uvek nema sačuvanih spajanja
              </p>
              <p className="text-xs mb-6" style={{ color: '#333333' }}>
                Počnite sa prvim spajanjem inventara.
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #2563ef, #3a81f6)', color: '#ffffff' }}
              >
                <GitMerge size={14} strokeWidth={2} />
                Kreirajte prvo spajanje
              </Link>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #1f1f1f', background: '#111111' }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>Naziv</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>Proizvodi</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>Fajlovi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#525252' }}>Datum</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {typedSessions.map((s, i) => {
                    const productCount = Array.isArray(s.merged_result)
                      ? s.merged_result.length
                      : 0;
                    const fileCount = Array.isArray(s.source_files)
                      ? s.source_files.length
                      : 0;

                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: i < typedSessions.length - 1 ? '1px solid #1a1a1a' : 'none',
                        }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-sm" style={{ color: '#fafafa' }}>
                            {s.session_name}
                          </span>
                        </td>
                        <td className="text-right px-6 py-4 font-mono text-sm" style={{ color: '#d4d4d4' }}>
                          {productCount}
                        </td>
                        <td className="text-right px-6 py-4 font-mono text-sm" style={{ color: '#d4d4d4' }}>
                          {fileCount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-mono"
                            style={{ color: '#525252' }}
                            title={formatDate(s.created_at)}
                          >
                            {timeAgo(s.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/${locale}/history`}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#91c5ff' }}
                          >
                            Otvori →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
