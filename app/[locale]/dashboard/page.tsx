import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import { LayoutDashboard, GitMerge, History, TrendingUp, Clock, Package } from 'lucide-react';
import type { Metadata } from 'next';
import type { MergeSessionRow } from '@/types';

export const metadata: Metadata = {
  title: 'Kontrolna tabla',
};

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `pre ${minutes}min`;
  if (hours < 24) return `pre ${hours}h`;
  return `pre ${days}d`;
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

  // Dohvati statistike i poslednje sesije
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

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2.5"
            style={{ color: 'var(--text-1)' }}
          >
            <LayoutDashboard size={20} style={{ color: 'var(--accent)' }} />
            Kontrolna tabla
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
            {session.user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Ukupno spajanja',
              value: totalSessions,
              icon: History,
              color: '#818cf8',
            },
            {
              label: 'Poslednje spajanje',
              value: lastSession ? timeAgo(lastSession.created_at) : 'Nikad',
              icon: Clock,
              color: '#fcd34d',
            },
            {
              label: 'Ukupno proizvoda',
              value: totalProducts,
              icon: Package,
              color: '#6ee7b7',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 rounded-lg"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                    {stat.label}
                  </p>
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
                <p
                  className="text-2xl font-semibold font-mono"
                  style={{ color: 'var(--text-1)' }}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick action */}
        <div className="flex gap-3">
          <Link
            href={`/${locale}/merge`}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            <GitMerge size={16} strokeWidth={2} />
            Novo spajanje
          </Link>
          <Link
            href={`/${locale}/history`}
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bg-2)',
              color: 'var(--text-2)',
              border: '1px solid var(--border)',
            }}
          >
            <History size={16} strokeWidth={2} />
            Pogledajte istoriju
          </Link>
        </div>

        {/* Recent sessions */}
        <div>
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--text-2)' }}
          >
            Poslednja spajanja
          </h2>

          {typedSessions.length === 0 ? (
            <div
              className="py-12 text-center rounded-lg"
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
              }}
            >
              <Package
                size={24}
                className="mx-auto mb-3"
                style={{ color: 'var(--text-3)' }}
              />
              <p className="font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                Još uvek nema sačuvanih spajanja
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                Počnite sa prvim spajanjem inventara.
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <GitMerge size={14} strokeWidth={2} />
                Kreirajte prvo spajanje
              </Link>
            </div>
          ) : (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th className="numeric">Proizvodi</th>
                    <th className="numeric">Fajlovi</th>
                    <th>Datum</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {typedSessions.map((s) => {
                    const productCount = Array.isArray(s.merged_result)
                      ? s.merged_result.length
                      : 0;
                    const fileCount = Array.isArray(s.source_files)
                      ? s.source_files.length
                      : 0;

                    return (
                      <tr key={s.id}>
                        <td>
                          <span
                            className="font-medium"
                            style={{ color: 'var(--text-1)' }}
                          >
                            {s.session_name}
                          </span>
                        </td>
                        <td className="numeric font-mono">{productCount}</td>
                        <td className="numeric font-mono">{fileCount}</td>
                        <td>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--text-3)' }}
                            title={formatDate(s.created_at)}
                          >
                            {timeAgo(s.created_at)}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/${locale}/history`}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#818cf8' }}
                          >
                            Otvori
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
