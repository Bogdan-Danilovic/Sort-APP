'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParsedFile } from '@/types';

interface ParsedPreviewProps {
  parsedFiles: ParsedFile[];
  onUpdateRow: (
    fileIndex: number,
    rowIndex: number,
    field: string,
    value: string
  ) => void;
  onRemoveSource: (fileIndex: number) => void;
}

export default function ParsedPreview({
  parsedFiles,
  onUpdateRow,
  onRemoveSource,
}: ParsedPreviewProps) {
  const t = useTranslations('merge.preview');
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(parsedFiles.map((_, i) => i))
  );

  const toggleExpanded = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (parsedFiles.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-lg"
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
        }}
      >
        <p style={{ color: 'var(--text-3)' }}>Nema parsovanih fajlova</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parsedFiles.map((file, fileIdx) => {
        const isOpen = expanded.has(fileIdx);
        const suspectCount = file.rows.filter((r) => r.isSuspect).length;

        return (
          <motion.div
            key={`${file.filename}-${fileIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: fileIdx * 0.05 }}
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-1)',
            }}
          >
            {/* Section header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              style={{ background: 'var(--bg-2)' }}
              onClick={() => toggleExpanded(fileIdx)}
            >
              <button
                type="button"
                className="flex-shrink-0"
                style={{ color: 'var(--text-3)' }}
              >
                {isOpen ? (
                  <ChevronDown size={14} strokeWidth={2} />
                ) : (
                  <ChevronRight size={14} strokeWidth={2} />
                )}
              </button>

              <span
                className="font-medium text-sm flex-1 truncate"
                style={{ color: 'var(--text-1)' }}
              >
                {file.filename}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className="status-chip info"
                >
                  {file.parsedCount} {t('parsedRows')}
                </span>

                {suspectCount > 0 && (
                  <span className="status-chip warning flex items-center gap-1">
                    <AlertTriangle size={10} strokeWidth={2} />
                    {suspectCount}
                  </span>
                )}

                {file.skippedLines.length > 0 && (
                  <span className="status-chip" style={{ background: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-3)' }}>
                    {file.skippedLines.length} {t('skipped')}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSource(fileIdx);
                  }}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  title={t('removeSource')}
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Table */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}>
                            <span style={{ color: 'var(--text-3)' }}>#</span>
                          </th>
                          <th>{t('columns.name')}</th>
                          <th className="numeric">{t('columns.quantity')}</th>
                          <th>{t('columns.unit')}</th>
                          <th className="numeric">{t('columns.price')}</th>
                          <th>{t('columns.description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {file.rows.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className={row.isSuspect ? 'suspect' : ''}
                          >
                            <td
                              className="font-mono text-xs"
                              style={{ color: 'var(--text-3)' }}
                            >
                              {row.originalLineNumber}
                            </td>
                            <EditableCell
                              value={row.rawName}
                              onChange={(v) =>
                                onUpdateRow(fileIdx, rowIdx, 'rawName', v)
                              }
                            />
                            <EditableCell
                              value={row.quantity?.toString() ?? ''}
                              onChange={(v) =>
                                onUpdateRow(fileIdx, rowIdx, 'quantity', v)
                              }
                              numeric
                            />
                            <td
                              className="text-xs"
                              style={{ color: 'var(--text-3)' }}
                            >
                              {row.unit ?? '—'}
                            </td>
                            <EditableCell
                              value={row.price?.toString() ?? ''}
                              onChange={(v) =>
                                onUpdateRow(fileIdx, rowIdx, 'price', v)
                              }
                              numeric
                            />
                            <EditableCell
                              value={row.description ?? ''}
                              onChange={(v) =>
                                onUpdateRow(fileIdx, rowIdx, 'description', v)
                              }
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Editable cell ────────────────────────────────────────────

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
}

function EditableCell({ value, onChange, numeric }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <td className={numeric ? 'numeric' : ''}>
        <input
          type={numeric ? 'number' : 'text'}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full bg-transparent border-b focus:outline-none font-mono text-sm"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--text-1)',
          }}
        />
      </td>
    );
  }

  return (
    <td
      className={`${numeric ? 'numeric font-mono' : ''} cursor-text group`}
      onClick={() => {
        setLocalValue(value);
        setEditing(true);
      }}
      title="Kliknite za uređivanje"
    >
      <span className="group-hover:opacity-80 transition-opacity">
        {value || (
          <span style={{ color: 'var(--text-3)' }}>—</span>
        )}
      </span>
    </td>
  );
}
