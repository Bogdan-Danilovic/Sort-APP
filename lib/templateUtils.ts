// Generisanje i download predložaka za korisnike
// Template sadrži ispravne kolone: Naziv, Količina, Cijena

const EXAMPLE_ROWS = [
  ['Brašno T-500', '50kg', 85],
  ['Šećer kristal', '100kom', 120],
  ['Ulje suncokretovo 1L', '200kom', 180],
  ['Mlijeko 1L', '150kom', 65],
  ['Jaja L (10kom)', '300kom', 220],
] as const;

const HEADERS = ['Naziv', 'Količina', 'Cijena'] as const;

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Preuzima CSV predložak sa UTF-8 BOM-om (čitljiv u Excelu) */
export function downloadCSVTemplate() {
  const rows = [HEADERS, ...EXAMPLE_ROWS];
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\r\n');

  const BOM = '﻿';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'mergekit-predlozak.csv');
}

/** Preuzima XLSX predložak koristeći xlsx biblioteku */
export async function downloadXLSXTemplate() {
  const XLSX = await import('xlsx');

  const data: unknown[][] = [HEADERS, ...EXAMPLE_ROWS].map((row) => [...row]);
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 14 }];

  // Stil zaglavlja — bold
  const headerRange = XLSX.utils.decode_range(ws['!ref'] ?? 'A1:C1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
    if (cell) cell.s = { font: { bold: true } };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Predložak');
  XLSX.writeFile(wb, 'mergekit-predlozak.xlsx');
}
