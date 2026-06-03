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
        style={{ background: '#111111', border: '1px solid #1f1f1f' }}
      >
        <p className="font-medium mb-1" style={{ color: '#a1a1a1' }}>
          {t('noResults')}
        </p>
        <p className="text-xs" style={{ color: '#525252' }}>
          {t('noResultsHint')}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid #1f1f1f' }}
    >
      <div
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        <table className="data-table">
          <thead>
            <tr>
              {/* Naziv */}
              <th
                onClick={() => handleSort('displayName')}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  {t('columns.name')}
                  <SortIcon column="displayName" />
                </div>
              </th>

              {/* Količine */}
              <th className="numeric">{t('columns.quantities')}</th>

              {/* Uk. kol. */}
              <th
                className="numeric cursor-pointer select-none"
                onClick={() => handleSort('totalQuantity')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  {t('columns.totalQty')}
                  <SortIcon column="totalQuantity" />
                </div>
              </th>

              {/* Cene */}
              <th>{t('columns.prices')}</th>

              {/* Avg cena */}
              <th
                className="numeric cursor-pointer select-none"
                onClick={() => handleSort('avgPrice')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  {t('columns.avgPrice')}
                  <SortIcon column="avgPrice" />
                </div>
              </th>

              {/* Uk. vrednost */}
              <th
                className="numeric cursor-pointer select-none"
                onClick={() => handleSort('totalValue')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  {t('columns.totalValue')}
                  <SortIcon column="totalValue" />
                </div>
              </th>

              {/* Opis */}
              <th>{t('columns.description')}</th>

              {/* Izvori */}
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
                  transition={{ duration: 0.1, delay: idx * 0.01 }}
                >
                  {/* Naziv */}
                  <td>
                    <span
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-1)' }}
                    >
                      {product.displayName}
                    </span>
                    {product.rawNames.length > 1 && (
                      <div
                        className="text-2xs mt-0.5"
                        style={{ color: 'var(--text-3)' }}
                        title={product.rawNames.join(', ')}
                      >
                        +{product.rawNames.length - 1} varijanti
                      </div>
                    )}
                  </td>

                  {/* Količine (breakdown) */}
                  <td className="numeric">
                    <span
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {formatQuantityBreakdown(product)}
                    </span>
                  </td>

                  {/* Uk. kol. */}
                  <td className="numeric">
                    <span className="font-mono font-medium">
                      {product.totalQuantity}
                      {product.unit && (
                        <span
                          className="text-xs ml-0.5"
                          style={{ color: 'var(--text-3)' }}
                        >
                          {product.unit}
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Cene */}
                  <td>
                    <span
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {formatPrices(product)}
                    </span>
                  </td>

                  {/* Avg cena — editable */}
                  <td className="numeric">
                    <PriceEditor
                      productKey={product.normalizedKey}
                      value={product.manualPrice}
                      suggestedValue={product.avgPrice}
                      currency={product.currency}
                      onChange={onUpdatePrice}
                      onTabNext={() => handleTabToNext(product.normalizedKey)}
                      inputRef={(el) => {
                        if (el)
                          priceRefs.current.set(
                            product.normalizedKey,
                            el
                          );
                        else priceRefs.current.delete(product.normalizedKey);
                      }}
                    />
                  </td>

                  {/* Uk. vrednost */}
                  <td className="numeric">
                    {product.totalValue !== undefined ? (
                      <span className="font-mono font-medium">
                        {formatCurrency(product.totalValue, product.currency)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-3)' }}>—</span>
                    )}
                  </td>

                  {/* Opis */}
                  <td>
                    {product.mergedDescription ? (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-2)' }}
                        title={product.mergedDescription}
                      >
                        {product.mergedDescription.length > 40
                          ? product.mergedDescription.slice(0, 40) + '...'
                          : product.mergedDescription}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-3)' }}>—</span>
                    )}
                  </td>

                  {/* Izvori */}
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {product.sources.map((src) => (
                        <span
                          key={src}
                          className="status-chip info text-2xs"
                          title={src}
                        >
                          {src.length > 14 ? src.slice(0, 12) + '…' : src}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>

          {/* Grand totals */}
          <tfoot>
            <tr>
              <td colSpan={2}>
                <span
                  className="font-semibold text-xs tracking-wide"
                  style={{ color: 'var(--text-2)' }}
                >
                  {t('totals')} — {grandTotals.totalProducts} proizvoda,{' '}
                  {grandTotals.sourceCount} izvora
                </span>
              </td>
              <td className="numeric font-mono font-bold">
                {grandTotals.totalQuantity}
              </td>
              <td />
              <td />
              <td className="numeric font-mono font-bold">
                {formatCurrency(grandTotals.totalValue, undefined)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
