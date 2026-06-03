'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileText, FileSpreadsheet, Loader2, Save, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MergedProduct, GrandTotals, ExportOptions } from '@/types';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/exportUtils';
import { formatCurrency } from '@/lib/merger';

interface ExportBarProps {
  products: MergedProduct[];
  totals: GrandTotals;
  companyName?: string;
  onSave?: () => void;
}

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

const FORMATS = [
  { key: 'csv'  as const, label: 'CSV',   icon: FileText,        color: '#10b981' },
  { key: 'xlsx' as const, label: 'Excel',  icon: FileSpreadsheet, color: '#3b82f6' },
  { key: 'pdf'  as const, label: 'PDF',    icon: FileText,        color: '#f59e0b' },
] as const;

export default function ExportBar({ products, totals, companyName, onSave }: ExportBarProps) {
  const t = useTranslations('merge.export');
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState<'csv' | 'xlsx' | 'pdf' | null>(null);

  const disabled = loading !== null || products.length === 0;

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setLoading(format);
    setOpen(false);
    try {
      const opts: Partial<ExportOptions> = {
        companyName,
        includeSourceColumn: true,
        includeDescriptionColumn: true,
      };
      if (format === 'csv')       exportToCSV(products, totals, opts);
      else if (format === 'xlsx') await exportToXLSX(products, totals, opts);
      else                        await exportToPDF(products, totals, opts);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Backdrop for dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="bd"
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="export-bar">
        {/* Grand total */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>
            Ukupno
          </span>
          <span
            className="mono font-bold text-lg leading-none"
            style={{ color: 'var(--accent)' }}
          >
            {formatCurrency(totals.totalValue, undefined)}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
            {totals.totalProducts} stavki · {totals.sourceCount} izvora
          </span>
        </div>

        <div className="flex-1" />

        {/* Save button */}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#6ee7b7',
              border: '1px solid rgba(16,185,129,0.2)',
              height: 40,
              minWidth: 44,
            }}
          >
            <Save size={14} strokeWidth={2} />
            <span className="hidden sm:inline">{t('save') || 'Spremi'}</span>
          </button>
        )}

        {/* Export dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: disabled ? 'rgba(58,129,246,0.06)' : 'rgba(58,129,246,0.12)',
              color: '#91c5ff',
              border: '1px solid rgba(58,129,246,0.25)',
              height: 40,
              minWidth: 44,
            }}
            aria-expanded={open}
            aria-haspopup="true"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} strokeWidth={2} />
            )}
            <span className="hidden sm:inline">
              {loading ? t('exporting') : 'Izvezi'}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={SPRING}
              style={{ display: 'flex' }}
            >
              <ChevronUp size={13} strokeWidth={2} />
            </motion.span>
          </button>

          {/* Dropdown — opens upward */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={SPRING}
                className="absolute right-0 bottom-full mb-2 z-40 rounded-xl overflow-hidden py-1.5"
                style={{
                  background: '#0c0c12',
                  border: '1px solid #141420',
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.9)',
                  minWidth: 200,
                }}
              >
                <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>
                  Format izvoza
                </p>
                {FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => handleExport(fmt.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
                      style={{ color: 'var(--text-1)', minHeight: 44 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={15} style={{ color: fmt.color, flexShrink: 0 }} />
                      <span className="flex-1 text-left">{fmt.label}</span>
                      {loading === fmt.key && <Loader2 size={13} className="animate-spin" style={{ color: 'var(--text-3)' }} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
