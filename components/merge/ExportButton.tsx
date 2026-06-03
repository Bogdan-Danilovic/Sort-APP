'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileText, FileSpreadsheet, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MergedProduct, GrandTotals, ExportOptions } from '@/types';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/lib/exportUtils';

interface ExportButtonProps {
  products: MergedProduct[];
  totals: GrandTotals;
  companyName?: string;
}

export default function ExportButton({ products, totals, companyName }: ExportButtonProps) {
  const t = useTranslations('merge.export');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'csv' | 'xlsx' | 'pdf' | null>(null);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setLoading(format);
    setOpen(false);

    try {
      const options: Partial<ExportOptions> = {
        companyName,
        includeSourceColumn: true,
        includeDescriptionColumn: true,
      };

      if (format === 'csv') {
        exportToCSV(products, totals, options);
      } else if (format === 'xlsx') {
        await exportToXLSX(products, totals, options);
      } else {
        await exportToPDF(products, totals, options);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(null);
    }
  };

  const options = [
    {
      key: 'csv' as const,
      label: t('csv'),
      icon: FileText,
      color: '#10b981',
    },
    {
      key: 'xlsx' as const,
      label: t('excel'),
      icon: FileSpreadsheet,
      color: '#3b82f6',
    },
    {
      key: 'pdf' as const,
      label: t('pdf'),
      icon: FileText,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading !== null || products.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} strokeWidth={2} />
        )}
        {loading ? t('exporting') : t('csv').replace('kao CSV', '')}
        {!loading && <ChevronDown size={13} strokeWidth={2} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden py-1"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-dim)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                minWidth: 180,
              }}
            >
              {options.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleExport(opt.key)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: 'var(--text-1)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={14} style={{ color: opt.color }} />
                    {opt.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
