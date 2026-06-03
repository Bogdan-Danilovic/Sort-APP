import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabaseServer';
import AppShell from '@/components/layout/AppShell';
import { GitMerge, History, Clock, Package, ArrowRight, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import type { MergeSessionRow } from '@/types';

export const metadata: Metadata = { title: 'Kontrolna tabla' };

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect(`/${locale}/auth/login`);

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
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Welcome ──────────────────────────────────── */}
        <div
          className="rounded-2xl mb-6"
          style={{
            background: 'linear-gradient(135deg, #080d1f 0%, #0a1228 60%, #060b1a 100%)',
            border: '1px solid rgba(58,129,246,0.12)',
            padding: '24px 20px',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a4eda, #3a81f6)',
                color: '#fff', fontWeight: 800, fontSize: 16,
                boxShadow: '0 4px 20px rgba(58,129,246,0.3)',
              }}>
                {userInitials}
              </div>
              <div>
                <p style={{ color: '#2a4a7a', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
                  {greeting()}
                </p>
                <h1 style={{
                  color: '#e8f0ff', fontSize: 20, fontWeight: 700,
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans"),system-ui',
                }}>
                  {userName}
                </h1>
              </div>
            </div>

            <Link
              href={`/${locale}/merge`}
              className="inline-flex items-center gap-2 self-start sm:self-auto"
              style={{
                background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                color: '#fff', padding: '12px 20px', borderRadius: 12,
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(58,129,246,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Novo spajanje
            </Link>
          </div>
        </div>

        {/* ── Stats — 2 col mobile, 3 col desktop ──────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              label: 'Spajanja',
              value: String(totalSessions),
              sub: 'ukupno sačuvano',
              icon: History,
              color: '#91c5ff',
              bg: 'rgba(145,197,255,0.07)',
            },
            {
              label: 'Poslednje',
              value: lastSession ? timeAgo(lastSession.created_at) : '—',
              sub: lastSession ? lastSession.session_name : 'nema aktivnosti',
              icon: Clock,
              color: '#fcd34d',
              bg: 'rgba(252,211,77,0.07)',
              mono: true,
            },
            {
              label: 'Proizvodi',
              value: String(totalProducts),
              sub: 'iz poslednjih sesija',
              icon: Package,
              color: '#34d399',
              bg: 'rgba(52,211,153,0.07)',
              wide: true,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`rounded-xl p-4 sm:p-6${stat.wide ? ' col-span-2 sm:col-span-1' : ''}`}
                style={{ background: '#0c0c12', border: '1px solid #141420' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: '#2a2a38', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </p>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: stat.bg, flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: stat.color }} />
                  </div>
                </div>
                <p
                  className={stat.mono ? 'font-mono' : ''}
                  style={{ color: '#e0e0f0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}
                >
                  {stat.value}
                </p>
                <p style={{ color: '#242430', fontSize: 11, lineHeight: 1.4 }} className="truncate">
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Recent sessions ──────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#e0e0f0', fontSize: 14, fontWeight: 600 }}>
              Poslednja spajanja
            </h2>
            <Link
              href={`/${locale}/history`}
              className="inline-flex items-center gap-1"
              style={{ color: '#3a81f6', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
            >
              Sve
              <ArrowRight size={11} strokeWidth={2.5} />
            </Link>
          </div>

          {typedSessions.length === 0 ? (
            <div
              className="rounded-2xl text-center"
              style={{ background: '#0c0c12', border: '1px solid #141420', padding: '48px 24px' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#101018', margin: '0 auto 16px',
              }}>
                <Package size={20} style={{ color: '#1e1e2c' }} />
              </div>
              <p style={{ color: '#a1a1a1', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                Nema sačuvanih spajanja
              </p>
              <p style={{ color: '#222230', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
                Počnite sa prvim spajanjem inventara.
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                  color: '#fff', padding: '12px 20px', borderRadius: 12,
                  fontWeight: 600, fontSize: 14, textDecoration: 'none',
                }}
              >
                <GitMerge size={14} strokeWidth={2} />
                Kreirajte prvo spajanje
              </Link>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #141420', background: '#0c0c12' }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #101018' }}>
                    <th style={{ textAlign: 'left', padding: '13px 16px', color: '#222230', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Naziv
                    </th>
                    <th style={{ textAlign: 'right', padding: '13px 16px', color: '#222230', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Prod.
                    </th>
                    <th style={{ textAlign: 'left', padding: '13px 16px', color: '#222230', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}
                      className="hidden sm:table-cell">
                      Kada
                    </th>
                    <th style={{ padding: '13px 16px' }} />
                  </tr>
                </thead>
                <tbody>
                  {typedSessions.map((s, i) => {
                    const productCount = Array.isArray(s.merged_result) ? s.merged_result.length : 0;

                    return (
                      <tr
                        key={s.id}
                        style={{ borderBottom: i < typedSessions.length - 1 ? '1px solid #0e0e16' : 'none' }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: '#c8c8d8', fontWeight: 500, fontSize: 14 }}>
                            {s.session_name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', padding: '14px 16px', fontFamily: 'var(--font-jetbrains,monospace)', color: '#555568', fontSize: 13 }}>
                          {productCount}
                        </td>
                        <td className="hidden sm:table-cell" style={{ padding: '14px 16px' }}>
                          <span
                            style={{ color: '#222230', fontSize: 12, fontFamily: 'var(--font-jetbrains,monospace)' }}
                            title={formatDate(s.created_at)}
                          >
                            pre {timeAgo(s.created_at)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                          <Link
                            href={`/${locale}/history`}
                            style={{ color: '#3a81f6', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
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
