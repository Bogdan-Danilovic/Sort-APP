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
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Hero card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#111111',
            border: '1px solid #1f1f1f',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1a4eda, #3a81f6)', color: '#ffffff' }}
            >
              {userInitials}
            </div>
            <div>
              <h1 className="text-base font-semibold" style={{ color: '#fafafa' }}>
                Dobrodošli nazad
              </h1>
              <p className="text-xs font-mono" style={{ color: '#a1a1a1' }}>
                {session.user.email}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/merge`}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(58, 129, 246, 0.35)',
            }}
          >
            <GitMerge size={16} strokeWidth={2} />
            Novo spajanje
          </Link>
        </div>

        {/* Stats — bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className="p-4 rounded-xl"
                style={{
                  background: '#111111',
                  border: '1px solid #1f1f1f',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: '#a1a1a1' }}>
                    {stat.label}
                  </p>
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
                <p
                  className={`text-2xl font-bold ${stat.mono ? 'font-mono' : ''}`}
                  style={{ color: '#fafafa' }}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Link
            href={`/${locale}/history`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: '#111111',
              color: '#d4d4d4',
              border: '1px solid #1f1f1f',
            }}
          >
            <History size={15} strokeWidth={2} />
            Istorija
          </Link>
        </div>

        {/* Recent sessions */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#525252' }}>
            Poslednja spajanja
          </h2>

          {typedSessions.length === 0 ? (
            <div
              className="py-12 text-center rounded-xl"
              style={{ background: '#111111', border: '1px solid #1f1f1f' }}
            >
              <Package size={24} className="mx-auto mb-3" style={{ color: '#333333' }} />
              <p className="font-medium mb-1 text-sm" style={{ color: '#a1a1a1' }}>
                Još uvek nema sačuvanih spajanja
              </p>
              <p className="text-xs mb-4" style={{ color: '#525252' }}>
                Počnite sa prvim spajanjem inventara.
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #2563ef, #3a81f6)', color: '#ffffff' }}
              >
                <GitMerge size={14} strokeWidth={2} />
                Kreirajte prvo spajanje
              </Link>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid #1f1f1f' }}
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
                          <span className="font-medium text-sm" style={{ color: '#fafafa' }}>
                            {s.session_name}
                          </span>
                        </td>
                        <td className="numeric font-mono text-sm" style={{ color: '#d4d4d4' }}>
                          {productCount}
                        </td>
                        <td className="numeric font-mono text-sm" style={{ color: '#d4d4d4' }}>
                          {fileCount}
                        </td>
                        <td>
                          <span
                            className="text-xs font-mono"
                            style={{ color: '#a1a1a1' }}
                            title={formatDate(s.created_at)}
                          >
                            {timeAgo(s.created_at)}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/${locale}/history`}
                            className="text-xs font-medium transition-colors"
                            style={{ color: '#91c5ff' }}
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
