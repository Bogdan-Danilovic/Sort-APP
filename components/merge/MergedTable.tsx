'use client';

import { useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { MergedProduct, GrandTotals, SortConfig, FilterConfig } from '@/types';
import { formatQuantityBreakdown, formatPrices, formatCurrency } from '@/lib/merger';
import PriceEditor from '@/components/merge/PriceEditor';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

interface MergedTableProps {
  products: MergedProduct[];
  grandTotals: GrandTotals;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  onSort: (config: SortConfig) => void;
  onFilter: (config: FilterConfig) => void;
  onUpdatePrice: (key: string, price: number | undefined) => void;
}

type SortableColumn = SortConfig['column'];

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

const SORTABLE_COLS: Array<{
  key: SortableColumn;
  labelKey: string;
  numeric?: boolean;
}> = [
  { key: 'displayName', labelKey: 'columns.name' },
  { key: 'totalQuantity', labelKey: 'columns.totalQty', numeric: true },
  { key: 'avgPrice', labelKey: 'columns.avgPrice', numeric: true },
  { key: 'totalValue', labelKey: 'columns.totalValue', numeric: true },
];

export default function MergedTable({
  products,
  grandTotals,
  sortConfig,
  filterConfig,
  onSort,
  onFilter,
  onUpdatePrice,
}: MergedTableProps) {
  const t = useTranslations('merge.result');
  const priceRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleSort = useCallback(
    (column: SortableColumn) => {
      if (sortConfig.column === column) {
        onSort({
          column,
          direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
        });
      } else {
        onSort({ column, direction: 'asc' });
      }
    },
    [sortConfig, onSort]
  );

  const SortIcon = ({ column }: { column: SortableColumn }) => {
    if (sortConfig.column !== column)
      return <ChevronsUpDown size={12} style={{ color: 'var(--text-3)' }} />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={12} style={{ color: 'var(--accent)' }} />
    ) : (
      <ArrowDown size={12} style={{ color: 'var(--accent)' }} />
    );
  };

  const handleTabToNext = useCallback(
    (currentKey: string) => {
      const keys = products.map((p) => p.normalizedKey);
      const idx = keys.indexOf(currentKey);
      if (idx >= 0 && idx < keys.length - 1) {
        const nextKey = keys[idx + 1];
        if (nextKey) {
          const nextInput = priceRefs.current.get(nextKey);
          nextInput?.focus();
        }
      }
    },
    [products]
  );

  if (products.length === 0) {
    return (
      <div
        className="py-16 text-center rounded-lg"
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--text-2)' }}>
          {t('noResults')}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          {t('noResultsHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ─── MOBILE VIEW (Cards <768px) ─── */}
      <div className="md:hidden flex flex-col gap-3 scroll-touch">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
            {grandTotals.totalProducts} stavki
          </span>
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>
            {formatCurrency(grandTotals.totalValue, undefined)}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {products.map((product, idx) => (
            <motion.div
              key={product.normalizedKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ ...SPRING, delay: Math.min(idx * 0.015, 0.15) }}
              className="merge-card"
            >
              {/* Row 1: Name + Value */}
              <div className="merge-card-row">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-jakarta)' }}>
                    {product.displayName}
                  </p>
                  {product.rawNames.length > 1 && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }} title={product.rawNames.join(', ')}>
                      +{product.rawNames.length - 1} varijanti
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="mono font-bold text-sm" style={{ color: 'var(--accent)' }}>
                    {product.totalValue !== undefined
                      ? formatCurrency(product.totalValue, product.currency)
                      : '—'}
                  </p>
                  <p className="mono text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                    {product.totalQuantity} {product.unit || 'kom'}
                  </p>
                </div>
              </div>

              {/* Row 2: Price input */}
              <div
                className="merge-card-row rounded-lg px-3"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', minHeight: 44 }}
              >
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Cena / kom</span>
                <PriceEditor
                  productKey={product.normalizedKey}
                  value={product.manualPrice}
                  suggestedValue={product.avgPrice}
                  currency={product.currency}
                  onChange={onUpdatePrice}
                  onTabNext={() => handleTabToNext(product.normalizedKey)}
                  inputRef={(el) => {
                    if (el) priceRefs.current.set(product.normalizedKey, el);
                    else priceRefs.current.delete(product.normalizedKey);
                  }}
                />
              </div>

              {/* Row 3: Sources */}
              <div className="flex flex-wrap gap-1">
                {product.sources.map((src) => (
                  <span key={src} className="status-chip info" style={{ fontSize: '0.6rem' }}>
                    {src.length > 14 ? src.slice(0, 12) + '…' : src}
                  </span>
                ))}
                {product.mergedDescription && (
                  <span className="text-[10px] italic truncate max-w-[50%]" style={{ color: 'var(--text-3)' }}>
                    {product.mergedDescription}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── DESKTOP VIEW (Table ≥768px) ─── */}
      <div className="hidden md:block rounded-xl overflow-hidden glass shadow-lg">
        <div className="overflow-auto scroll-touch" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="data-table w-full">
            <thead>
              <tr className="bg-[var(--bg-2)]/80 backdrop-blur-md">
                <th onClick={() => handleSort('displayName')} className="cursor-pointer select-none">
                  <div className="flex items-center gap-1.5">
                    {t('columns.name')}
                    <SortIcon column="displayName" />
                  </div>
                </th>
                <th className="numeric">{t('columns.quantities')}</th>
                <th className="numeric cursor-pointer select-none" onClick={() => handleSort('totalQuantity')}>
                  <div className="flex items-center justify-end gap-1.5">
                    {t('columns.totalQty')}
                    <SortIcon column="totalQuantity" />
                  </div>
                </th>
                <th>{t('columns.prices')}</th>
                <th className="numeric cursor-pointer select-none" onClick={() => handleSort('avgPrice')}>
                  <div className="flex items-center justify-end gap-1.5">
                    {t('columns.avgPrice')}
                    <SortIcon column="avgPrice" />
                  </div>
                </th>
                <th className="numeric cursor-pointer select-none" onClick={() => handleSort('totalValue')}>
                  <div className="flex items-center justify-end gap-1.5">
                    {t('columns.totalValue')}
                    <SortIcon column="totalValue" />
                  </div>
                </th>
                <th>{t('columns.description')}</th>
                <th>{t('columns.sources')}</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
                {products.map((product, idx) => (
                  <motion.tr
                    key={product.normalizedKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ...SPRING, delay: Math.min(idx * 0.01, 0.1) }}
                    className="hover:bg-white/5 transition-colors border-b border-[var(--border)]"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-sm text-[var(--text-1)]">
                        {product.displayName}
                      </span>
                      {product.rawNames.length > 1 && (
                        <div className="text-[10px] mt-1 text-[var(--text-3)]" title={product.rawNames.join(', ')}>
                          +{product.rawNames.length - 1} varijanti
                        </div>
                      )}
                    </td>
                    <td className="numeric py-3 px-4">
                      <span className="font-mono text-xs text-[var(--text-3)]">
                        {formatQuantityBreakdown(product)}
                      </span>
                    </td>
                    <td className="numeric py-3 px-4">
                      <span className="font-mono font-bold text-[var(--text-1)]">
                        {product.totalQuantity}
                        {product.unit && (
                          <span className="text-xs ml-1 text-[var(--text-3)] font-normal">
                            {product.unit}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-[var(--text-3)]">
                        {formatPrices(product)}
                      </span>
                    </td>
                    <td className="numeric py-3 px-4">
                      <PriceEditor
                        productKey={product.normalizedKey}
                        value={product.manualPrice}
                        suggestedValue={product.avgPrice}
                        currency={product.currency}
                        onChange={onUpdatePrice}
                        onTabNext={() => handleTabToNext(product.normalizedKey)}
                        inputRef={(el) => {
                          if (el) priceRefs.current.set(product.normalizedKey, el);
                          else priceRefs.current.delete(product.normalizedKey);
                        }}
                      />
                    </td>
                    <td className="numeric py-3 px-4">
                      {product.totalValue !== undefined ? (
                        <span className="font-mono font-bold text-[var(--accent)]">
                          {formatCurrency(product.totalValue, product.currency)}
                        </span>
                      ) : (
                        <span className="text-[var(--text-3)]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[150px] truncate text-xs text-[var(--text-2)]" title={product.mergedDescription}>
                      {product.mergedDescription || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.sources.map((src) => (
                          <span key={src} className="status-chip info text-[10px] px-1.5 py-0.5" title={src}>
                            {src.length > 10 ? src.slice(0, 8) + '…' : src}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>

            <tfoot>
              <tr className="bg-[var(--bg-2)]/80 backdrop-blur-md">
                <td colSpan={2} className="py-4 px-4">
                  <span className="font-semibold text-xs tracking-wide text-[var(--text-2)] uppercase">
                    {t('totals')} — {grandTotals.totalProducts} stavki, {grandTotals.sourceCount} izvora
                  </span>
                </td>
                <td className="numeric font-mono font-bold text-[var(--text-1)] py-4 px-4">
                  {grandTotals.totalQuantity}
                </td>
                <td />
                <td />
                <td className="numeric font-mono font-bold text-[var(--accent)] py-4 px-4 text-base">
                  {formatCurrency(grandTotals.totalValue, undefined)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
