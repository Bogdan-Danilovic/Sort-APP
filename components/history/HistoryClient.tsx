'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Trash2,
  Upload,
  GitMerge,
  Package,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { MergeSessionRow, MergedProduct } from '@/types';

interface HistoryClientProps {
  locale: string;
  userId: string;
  onLoadSession: (products: MergedProduct[]) => void;
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

export default function HistoryClient({
  locale,
  userId,
  onLoadSession,
}: HistoryClientProps) {
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

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = sessions.filter((s) =>
    s.session_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(filteredSessions.map((s) => s.id)));
  };

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
    onLoadSession(products);
    router.push(`/${locale}/merge`);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="skeleton h-12 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-3)' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
            }}
          />
        </div>

        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>
              {selected.size} izabrano
            </span>
            <button
              onClick={() =>
                setConfirmDelete('bulk')
              }
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
              }}
            >
              <Trash2 size={12} strokeWidth={2} />
              {t('deleteSelected')}
            </button>
            <button
              onClick={deselectAll}
              className="text-xs"
              style={{ color: 'var(--text-3)' }}
            >
              {t('common.deselectAll', { ns: 'common' })}
            </button>
          </motion.div>
        )}

        <div className="flex-1" />

        {filteredSessions.length > 0 && selected.size === 0 && (
          <button
            onClick={selectAll}
            className="text-xs"
            style={{ color: 'var(--text-3)' }}
          >
            Izaberi sve
          </button>
        )}
      </div>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-lg flex items-center justify-between"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <p className="text-sm" style={{ color: '#fca5a5' }}>
                {confirmDelete === 'bulk'
                  ? t('deleteMultipleConfirm', { count: selected.size })
                  : t('deleteConfirm')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1.5 text-xs rounded-md"
                  style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }}
                >
                  Otkaži
                </button>
                <button
                  onClick={() =>
                    handleDelete(
                      confirmDelete === 'bulk'
                        ? [...selected]
                        : [confirmDelete]
                    )
                  }
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs rounded-md font-medium disabled:opacity-40"
                  style={{ background: '#ef4444', color: 'white' }}
                >
                  {deleting ? 'Brisanje...' : 'Obriši'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions list */}
      {filteredSessions.length === 0 ? (
        <div
          className="py-16 text-center rounded-lg"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
          }}
        >
          {sessions.length === 0 ? (
            <>
              <Package size={24} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
              <p className="font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                {t('noSessions.title')}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
                {t('noSessions.description')}
              </p>
              <Link
                href={`/${locale}/merge`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <GitMerge size={14} strokeWidth={2} />
                {t('noSessions.action')}
              </Link>
            </>
          ) : (
            <>
              <p className="font-medium" style={{ color: 'var(--text-2)' }}>
                {t('noResults', { term: searchTerm })}
              </p>
            </>
          )}
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={
                      selected.size === filteredSessions.length &&
                      filteredSessions.length > 0
                    }
                    onChange={() =>
                      selected.size === filteredSessions.length
                        ? deselectAll()
                        : selectAll()
                    }
                    className="accent-indigo-500"
                  />
                </th>
                <th>{t('columns.name')}</th>
                <th className="numeric">{t('columns.products')}</th>
                <th className="numeric">{t('columns.sources')}</th>
                <th>{t('columns.date')}</th>
                <th>{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => {
                const productCount = Array.isArray(session.merged_result)
                  ? session.merged_result.length
                  : 0;
                const fileCount = Array.isArray(session.source_files)
                  ? session.source_files.length
                  : 0;
                const isSelected = selected.has(session.id);

                return (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.06)'
                        : undefined,
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(session.id)}
                        className="accent-indigo-500"
                      />
                    </td>
                    <td>
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-1)' }}
                      >
                        {session.session_name}
                      </span>
                      {session.notes && (
                        <p
                          className="text-xs mt-0.5 truncate max-w-xs"
                          style={{ color: 'var(--text-3)' }}
                        >
                          {session.notes}
                        </p>
                      )}
                    </td>
                    <td className="numeric font-mono">{productCount}</td>
                    <td className="numeric font-mono">{fileCount}</td>
                    <td>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-3)' }}
                      >
                        {formatDate(session.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadSession(session)}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#818cf8' }}
                          title={t('load')}
                        >
                          <Upload size={13} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(session.id)}
                          className="text-xs transition-colors"
                          style={{ color: 'var(--text-3)' }}
                          title={t('delete')}
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
