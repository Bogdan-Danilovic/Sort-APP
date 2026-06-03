import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import { GitMerge, History, Clock, Package, ArrowRight, Plus } from 'lucide-react';
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Dobro jutro';
  if (h < 18) return 'Dobar dan';
  return 'Dobro veče';
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

  const userName = session.user.email?.split('@')[0] ?? '';

  return (
    <AppShell locale={locale} userEmail={session.user.email}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }} className="space-y-8">

        {/* Welcome banner */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0d1a3a', border: '1px solid rgba(58,129,246,0.15)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 sm:p-10">
            {/* Left: avatar + greeting */}
            <div className="flex items-center gap-5">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-lg"
                style={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #1a4eda, #3a81f6)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(58,129,246,0.35)',
                }}
              >
                {userInitials}
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#4d7ab5' }}>
                  {greeting()}
                </p>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
                >
                  {userName}
                </h1>
                <p className="text-xs font-mono mt-1" style={{ color: '#2d5a8c' }}>
                  {session.user.email}
                </p>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                  color: '#ffffff',
                  boxShadow: '0 4px 24px rgba(58,129,246,0.45)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Novo spajanje
              </Link>
              <Link
                href={`/${locale}/history`}
                className="inline-flex items-center gap-1.5 text-xs font-medium"
                style={{ color: '#4d7ab5' }}
              >
                <History size={12} strokeWidth={2} />
                Pogledaj istoriju
                <ArrowRight size={11} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Ukupno spajanja',
              value: String(totalSessions),
              desc: totalSessions === 0 ? 'Još nema spajanja' : totalSessions === 1 ? '1 sačuvana sesija' : `${totalSessions} sačuvanih sesija`,
              icon: History,
              color: '#91c5ff',
              bg: 'rgba(145,197,255,0.06)',
            },
            {
              label: 'Poslednja aktivnost',
              value: lastSession ? timeAgo(lastSession.created_at) : '—',
              desc: lastSession ? lastSession.session_name : 'Nema aktivnosti',
              icon: Clock,
              color: '#fcd34d',
              bg: 'rgba(252,211,77,0.06)',
              mono: true,
            },
            {
              label: 'Ukupno proizvoda',
              value: String(totalProducts),
              desc: 'Iz poslednih 5 sesija',
              icon: Package,
              color: '#34d399',
              bg: 'rgba(52,211,153,0.06)',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-5 sm:p-7 rounded-2xl"
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #1a1a1a',
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: '#333333' }}
                  >
                    {stat.label}
                  </p>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stat.bg, border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                </div>
                <p
                  className={`text-4xl font-bold mb-2 ${stat.mono ? 'font-mono' : ''}`}
                  style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: '#333333' }}>
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: '#fafafa' }}
              >
                Poslednja spajanja
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#333333' }}>
                Poslednih {Math.min(typedSessions.length, 5)} sačuvanih sesija
              </p>
            </div>
            <Link
              href={`/${locale}/history`}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
              style={{ color: '#91c5ff', background: 'rgba(145,197,255,0.06)', border: '1px solid rgba(145,197,255,0.1)' }}
            >
              <History size={12} strokeWidth={2} />
              Sve sesije
            </Link>
          </div>

          {typedSessions.length === 0 ? (
            <div
              className="rounded-2xl text-center"
              style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', padding: '64px 32px' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: '#111111', border: '1px solid #1a1a1a' }}
              >
                <Package size={24} style={{ color: '#2a2a2a' }} />
              </div>
              <p className="font-semibold mb-2" style={{ color: '#a1a1a1' }}>
                Još uvek nema sačuvanih spajanja
              </p>
              <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: '#2a2a2a' }}>
                Počnite sa prvim spajanjem — učitajte fajlove i dobijte
                kombinovani inventar za sekunde.
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(58,129,246,0.35)',
                }}
              >
                <GitMerge size={15} strokeWidth={2} />
                Kreirajte prvo spajanje
              </Link>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #1a1a1a', background: '#0e0e0e' }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #141414' }}>
                    <th
                      className="text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#2a2a2a', padding: '14px 16px' }}
                    >
                      Naziv sesije
                    </th>
                    <th
                      className="text-right text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#2a2a2a', padding: '14px 16px' }}
                    >
                      Proizvodi
                    </th>
                    <th
                      className="text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: '#2a2a2a', padding: '14px 16px' }}
                    >
                      Fajlovi
                    </th>
                    <th
                      className="text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: '#2a2a2a', padding: '14px 16px' }}
                    >
                      Kada
                    </th>
                    <th style={{ padding: '14px 16px' }} />
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
                          borderBottom: i < typedSessions.length - 1 ? '1px solid #141414' : 'none',
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            className="font-medium text-sm"
                            style={{ color: '#e0e0e0' }}
                          >
                            {s.session_name}
                          </span>
                        </td>
                        <td
                          className="text-right font-mono text-sm"
                          style={{ padding: '14px 16px', color: '#a1a1a1' }}
                        >
                          {productCount}
                        </td>
                        <td
                          className="text-right font-mono text-sm hidden sm:table-cell"
                          style={{ padding: '14px 16px', color: '#525252' }}
                        >
                          {fileCount}
                        </td>
                        <td className="hidden sm:table-cell" style={{ padding: '14px 16px' }}>
                          <span
                            className="text-xs font-mono"
                            style={{ color: '#3a3a3a' }}
                            title={formatDate(s.created_at)}
                          >
                            {timeAgo(s.created_at)}
                          </span>
                        </td>
                        <td className="text-right" style={{ padding: '14px 16px' }}>
                          <Link
                            href={`/${locale}/history`}
                            className="text-xs font-medium inline-flex items-center gap-1"
                            style={{ color: '#91c5ff' }}
                          >
                            Otvori
                            <ArrowRight size={11} strokeWidth={2.5} />
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
