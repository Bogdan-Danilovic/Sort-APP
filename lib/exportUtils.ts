// ============================================================
// MergeKit — Export utilities
// CSV, Excel (.xlsx), PDF export
// ============================================================

import type { MergedProduct, GrandTotals, ExportOptions, Currency } from '@/types';
import {
  formatQuantityBreakdown,
  formatPrices,
  formatCurrency,
} from '@/lib/merger';

// ─── Formatiranje ─────────────────────────────────────────────

function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function formatValue(
  value: number | undefined,
  currency: Currency | undefined
): string {
  if (value === undefined) return '';
  return `${value}${currency ?? 'din'}`;
}

// ─── Zaglavlja tabele ─────────────────────────────────────────

const TABLE_HEADERS = [
  'Naziv proizvoda',
  'Količine',
  'Uk. količina',
  'Cene',
  'Avg cena',
  'Uk. vrednost',
  'Opis',
  'Izvori',
];

function productToRow(p: MergedProduct): string[] {
  return [
    p.displayName,
    formatQuantityBreakdown(p),
    `${p.totalQuantity}${p.unit ?? ''}`,
    formatPrices(p),
    formatValue(p.effectivePrice, p.currency),
    formatValue(p.totalValue, p.currency),
    p.mergedDescription ?? '',
    p.sources.join(', '),
  ];
}

function totalsToRow(totals: GrandTotals, currency: Currency = 'din'): string[] {
  return [
    'UKUPNO',
    '',
    `${totals.totalQuantity}`,
    '',
    totals.avgPriceOverall !== undefined
      ? formatValue(totals.avgPriceOverall, currency)
      : '',
    formatValue(totals.totalValue, currency),
    '',
    `${totals.sourceCount} izvora`,
  ];
}

// ─── CSV Export ───────────────────────────────────────────────

/**
 * Generiše CSV string i inicira download.
 */
export function exportToCSV(
  products: MergedProduct[],
  totals: GrandTotals,
  _options: Partial<ExportOptions> = {}
): void {
  const rows: string[][] = [TABLE_HEADERS];

  for (const p of products) {
    rows.push(productToRow(p));
  }

  rows.push(totalsToRow(totals));

  const csvContent =
    '\uFEFF' + // BOM za Excel kompatibilnost
    rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            // Escape za CSV (zamotan u navodnike ako sadrži zarez/newline)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\r\n');

  downloadFile(
    csvContent,
    `merged_${formatTimestamp()}.csv`,
    'text/csv;charset=utf-8;'
  );
}

// ─── Excel Export ─────────────────────────────────────────────

/** Indigo boja za zaglavlje */
const HEADER_COLOR = '6366f1';
/** Tamni red */
const ROW_DARK = '0f172a';
/** Svetliji red */
const ROW_LIGHT = '1e293b';
/** Plava boja za totals red */
const TOTALS_COLOR = '1d4ed8';

/**
 * Generiše Excel fajl sa bojama i inicira download.
 */
export async function exportToXLSX(
  products: MergedProduct[],
  totals: GrandTotals,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const XLSX = await import('xlsx');

  const rows: string[][] = [TABLE_HEADERS];
  for (const p of products) {
    rows.push(productToRow(p));
  }
  rows.push(totalsToRow(totals, options.currency ?? 'din'));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Auto-width kolona
  const colWidths = TABLE_HEADERS.map((header, colIdx) => {
    let maxLen = header.length;
    for (const row of rows.slice(1)) {
      const cellLen = (row[colIdx] ?? '').length;
      if (cellLen > maxLen) maxLen = cellLen;
    }
    return { wch: Math.min(maxLen + 2, 60) };
  });
  worksheet['!cols'] = colWidths;

  // Stilovi (xlsx-style nije dostupan u open source XLSX, koristimo SheetJS Pro API)
  // Alternativno, možemo koristiti sheet_to_html ili exceljs
  // Za sada: dodati kao plain xlsx bez stilova, stilovi idu kroz ExcelJS
  // TODO: Integrisati ExcelJS za pune stilove

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Spajanje');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `merged_${formatTimestamp()}.xlsx`);
}

// ─── PDF Export ───────────────────────────────────────────────

/**
 * Generiše PDF fajl i inicira download.
 */
export async function exportToPDF(
  products: MergedProduct[],
  totals: GrandTotals,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Zaglavlje dokumenta
  const companyName = options.companyName ?? 'MergeKit';
  const dateStr = new Date().toLocaleDateString('sr-RS');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Izveštaj o spajanju inventara — ${dateStr}`, 14, 22);

  // Statistike
  doc.setFontSize(9);
  doc.text(
    `Ukupno proizvoda: ${totals.totalProducts} | Ukupna količina: ${totals.totalQuantity} | Ukupna vrednost: ${formatValue(totals.totalValue, options.currency)}`,
    14,
    29
  );

  // Tabela
  const tableRows = products.map(productToRow);
  tableRows.push(totalsToRow(totals, options.currency ?? 'din'));

  autoTable(doc, {
    head: [TABLE_HEADERS],
    body: tableRows,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [99, 102, 241], // indigo-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    foot: [totalsToRow(totals, options.currency ?? 'din')],
    footStyles: {
      fillColor: [29, 78, 216], // blue-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    // Desno poravnanje za numeričke kolone
    columnStyles: {
      2: { halign: 'right' }, // Uk. količina
      4: { halign: 'right' }, // Avg cena
      5: { halign: 'right' }, // Uk. vrednost
    },
  });

  // Footer sa stranicom
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages() as number;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Strana ${i} od ${pageCount} — Generisano: ${dateStr}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }

  doc.save(`merged_${formatTimestamp()}.pdf`);
}

// ─── Helper download funkcije ─────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Cleanup URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
