'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Trash2, Upload, GitMerge, Package, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { MergeSessionRow, MergedProduct } from '@/types';

interface HistoryClientProps {
  locale: string;
  userId: string;
  onLoadSession?: (products: MergedProduct[]) => void;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
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

export default function HistoryClient({ locale, userId, onLoadSession }: HistoryClientProps) {
  const t = useTranslations('history');
  const router = useRouter();
  const supabase = createClient();

  const [sessions, setSessions] = useState<MergeSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('merge_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    setSessions((data ?? []) as unknown as MergeSessionRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void fetchSessions(); }, [fetchSessions]);

  const filteredSessions = sessions.filter((s) =>
    s.session_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filteredSessions.map((s) => s.id)));
  const deselectAll = () => setSelected(new Set());

  const handleDelete = async (ids: string[]) => {
    setDeleting(true);
    try {
      await supabase.from('merge_sessions').delete().in('id', ids);
      setSessions((prev) => prev.filter((s) => !ids.includes(s.id)));
      setSelected(new Set());
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleLoadSession = (session: MergeSessionRow) => {
    const products = session.merged_result as unknown as MergedProduct[];
    if (onLoadSession) {
      onLoadSession(products);
    } else {
      try { sessionStorage.setItem('loaded-session', JSON.stringify(products)); } catch {}
    }
    router.push(`/${locale}/merge`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton rounded-xl" style={{ height: 72 }} />
        ))}
      </div>
    );
  }

  const S = { background: '#0c0c12', border: '1px solid #141420' } as const;

  return (
    <div className="space-y-4">

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 180, maxWidth: 320 }}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#252535' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 rounded-xl text-sm focus:outline-none"
            style={{ ...S, color: '#c8c8d8', height: 40,
              caretColor: '#3a81f6' }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#141420'; }}
          />
        </div>

        <div className="flex-1" />

        {selected.size > 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span style={{ color: '#333344', fontSize: 12 }}>{selected.size} izabrano</span>
              <button
                onClick={() => setConfirmDelete('bulk')}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg disabled:opacity-40 cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171',
                  padding: '7px 12px', fontSize: 12, fontWeight: 600 }}
              >
                <Trash2 size={12} strokeWidth={2} />
                Obriši
              </button>
              <button onClick={deselectAll} style={{ color: '#252535', fontSize: 12, cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </motion.div>
          </AnimatePresence>
        ) : filteredSessions.length > 0 ? (
          <button onClick={selectAll} style={{ color: '#252535', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            Izaberi sve
          </button>
        ) : null}
      </div>

      {/* ── Confirm delete ────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div
              className="p-4 rounded-xl flex items-center justify-between gap-4"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
            >
              <p style={{ color: '#fca5a5', fontSize: 13 }}>
                {confirmDelete === 'bulk'
                  ? t('deleteMultipleConfirm', { count: selected.size })
                  : t('deleteConfirm')}
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-lg cursor-pointer"
                  style={{ background: '#0c0c12', color: '#555568', border: '1px solid #141420', padding: '6px 12px', fontSize: 12 }}
                >
                  Otkaži
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete === 'bulk' ? [...selected] : [confirmDelete])}
                  disabled={deleting}
                  className="rounded-lg font-medium disabled:opacity-40 cursor-pointer"
                  style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: 12 }}
                >
                  {deleting ? 'Brisanje...' : 'Obriši'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────── */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-2xl text-center" style={{ ...S, padding: '56px 24px' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#101018', margin: '0 auto 14px',
          }}>
            {sessions.length === 0
              ? <Package size={19} style={{ color: '#1e1e2c' }} />
              : <Search size={19} style={{ color: '#1e1e2c' }} />}
          </div>
          <p style={{ color: '#a1a1a1', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
            {sessions.length === 0 ? t('noSessions.title') : t('noResults', { term: searchTerm })}
          </p>
          {sessions.length === 0 && (
            <>
              <p style={{ color: '#1e1e2c', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
                {t('noSessions.description')}
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#2563ef,#3a81f6)', color: '#fff',
                  padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
              >
                <GitMerge size={14} strokeWidth={2} />
                {t('noSessions.action')}
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/* ── Mobile: Cards ─────────────────────────── */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredSessions.map((session) => {
              const productCount = Array.isArray(session.merged_result) ? session.merged_result.length : 0;
              const fileCount = Array.isArray(session.source_files) ? session.source_files.length : 0;
              const isSelected = selected.has(session.id);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4"
                  style={{
                    background: isSelected ? 'rgba(58,129,246,0.06)' : '#0c0c12',
                    border: isSelected ? '1px solid rgba(58,129,246,0.2)' : '1px solid #141420',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(session.id)}
                        className="mt-0.5 w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: '#3a81f6' }}
                      />
                      <div>
                        <p style={{ color: '#c8c8d8', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                          {session.session_name}
                        </p>
                        <p style={{ color: '#252535', fontSize: 11, fontFamily: 'var(--font-jetbrains,monospace)' }}>
                          {timeAgo(session.created_at)} · {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoadSession(session)}
                        className="flex items-center justify-center rounded-lg cursor-pointer"
                        title={t('load')}
                        style={{ width: 32, height: 32, background: 'rgba(58,129,246,0.1)', border: '1px solid rgba(58,129,246,0.2)' }}
                      >
                        <Upload size={13} style={{ color: '#3a81f6' }} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(session.id)}
                        className="flex items-center justify-center rounded-lg cursor-pointer"
                        title={t('delete')}
                        style={{ width: 32, height: 32, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                      >
                        <Trash2 size={13} style={{ color: '#f87171' }} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {session.notes && (
                    <p style={{ color: '#444458', fontSize: 12, marginBottom: 12,
                      fontStyle: 'italic', background: '#101018', borderRadius: 8, padding: '8px 10px' }}>
                      {session.notes}
                    </p>
                  )}

                  <div className="flex gap-5" style={{ borderTop: '1px solid #101018', paddingTop: 12 }}>
                    <div>
                      <p style={{ color: '#1e1e2c', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Proizvodi</p>
                      <p style={{ color: '#c8c8d8', fontFamily: 'var(--font-jetbrains,monospace)', fontWeight: 700, fontSize: 16 }}>{productCount}</p>
                    </div>
                    <div>
                      <p style={{ color: '#1e1e2c', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Fajlovi</p>
                      <p style={{ color: '#c8c8d8', fontFamily: 'var(--font-jetbrains,monospace)', fontWeight: 700, fontSize: 16 }}>{fileCount}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Desktop: Table ─────────────────────────── */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={S}>
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th style={{ width: 44, paddingLeft: 16 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === filteredSessions.length && filteredSessions.length > 0}
                      onChange={() => selected.size === filteredSessions.length ? deselectAll() : selectAll()}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: '#3a81f6' }}
                    />
                  </th>
                  <th>{t('columns.name')}</th>
                  <th className="numeric">{t('columns.products')}</th>
                  <th className="numeric">{t('columns.sources')}</th>
                  <th>{t('columns.date')}</th>
                  <th style={{ paddingRight: 16 }}>{t('columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const productCount = Array.isArray(session.merged_result) ? session.merged_result.length : 0;
                  const fileCount = Array.isArray(session.source_files) ? session.source_files.length : 0;
                  const isSelected = selected.has(session.id);

                  return (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ background: isSelected ? 'rgba(58,129,246,0.05)' : undefined }}
                    >
                      <td style={{ paddingLeft: 16 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(session.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                          style={{ accentColor: '#3a81f6' }}
                        />
                      </td>
                      <td>
                        <span style={{ color: '#c8c8d8', fontWeight: 500, fontSize: 13 }}>
                          {session.session_name}
                        </span>
                        {session.notes && (
                          <p style={{ color: '#252535', fontSize: 11, marginTop: 2 }} className="truncate max-w-xs">
                            {session.notes}
                          </p>
                        )}
                      </td>
                      <td className="numeric" style={{ color: '#444458', fontFamily: 'var(--font-jetbrains,monospace)' }}>
                        {productCount}
                      </td>
                      <td className="numeric" style={{ color: '#444458', fontFamily: 'var(--font-jetbrains,monospace)' }}>
                        {fileCount}
                      </td>
                      <td style={{ color: '#1e1e2c', fontSize: 12, fontFamily: 'var(--font-jetbrains,monospace)' }}>
                        {formatDate(session.created_at)}
                      </td>
                      <td style={{ paddingRight: 16 }}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadSession(session)}
                            className="flex items-center justify-center rounded-lg cursor-pointer"
                            title={t('load')}
                            style={{ width: 30, height: 30, background: 'rgba(58,129,246,0.08)', border: '1px solid rgba(58,129,246,0.15)' }}
                          >
                            <Upload size={13} style={{ color: '#3a81f6' }} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(session.id)}
                            className="flex items-center justify-center rounded-lg cursor-pointer"
                            title={t('delete')}
                            style={{ width: 30, height: 30, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
                          >
                            <Trash2 size={13} style={{ color: '#f87171' }} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
