// ============================================================
// MergeKit — Parser
// Parsuje CSV, TXT, XLSX i paste tekst u ParsedRow[]
// ============================================================

import {
  type ParsedRow,
  type ParsedFile,
  type InputFormat,
  type QuantityUnit,
  type Currency,
  CURRENCY_MAP,
  UNIT_MAP,
} from '@/types';
import { normalizeProductName } from '@/lib/normalizer';

// ─── Regex konstante ─────────────────────────────────────────

/** Prepoznaje čistu cenu (broj + opciona valuta) */
const PRICE_RE = /^(\d+[.,]?\d*)\s*(din\.?|rsd|RSD|DIN|eur|EUR|€|\$|usd|USD)?$/i;

/** Prepoznaje količinu sa jedinicom ili bez */
const QTY_RE = /^(\d+[.,]?\d*)\s*(kg|g|l|ml|kom|m|cm|kos|komad[ae]?)?$/i;

/** Prepoznaje token oblika "50kg", "10kom", "200din" itd. */
const COMPOUND_TOKEN_RE =
  /^(\d+[.,]?\d*)\s*(kg|g|l|ml|kom|m|cm|din\.?|rsd|eur|€|\$)$/i;

/** BOM karakter koji treba ukloniti */
const BOM = '\uFEFF';

/** WhatsApp/chat preambule koje treba ignorisati */
const CHAT_PREAMBLE_RE =
  /^(zdravo|halo|cao|pozdrav|treba\s+mi|trebaju\s+mi|hocu|molim|please|hello|hi)[,:!?\s]*/i;

/** Linije koje su samo metapodaci chata (datum, ime pošiljaoca itd.) */
const CHAT_META_RE =
  /^\[?\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}[\],\s]|^\w+\s+\w+:/;

/** Minimalna dužina da bi token bio ime proizvoda */
const MIN_NAME_LENGTH = 2;

// ─── Pomoćne funkcije ────────────────────────────────────────

function parseNumber(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

function normalizeCurrency(raw: string): Currency {
  const key = raw.toLowerCase().replace('.', '');
  return CURRENCY_MAP[raw] ?? CURRENCY_MAP[key] ?? 'din';
}

function normalizeUnit(raw: string): QuantityUnit {
  const key = raw.toLowerCase();
  return UNIT_MAP[key] ?? '';
}

function stripBOM(content: string): string {
  return content.startsWith(BOM) ? content.slice(1) : content;
}

function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Računanje pouzdanosti parsovanja reda.
 * Više polja → veća pouzdanost.
 */
function calcConfidence(row: Partial<ParsedRow>): number {
  let score = 0;
  if (row.name && row.name.length >= MIN_NAME_LENGTH) score += 0.5;
  if (row.quantity !== undefined) score += 0.25;
  if (row.price !== undefined) score += 0.25;
  return Math.min(score, 1);
}

// ─── Token analiza ───────────────────────────────────────────

interface TokenAnalysis {
  isPrice: boolean;
  isQuantity: boolean;
  isCompound: boolean;
  numericValue?: number;
  unit?: QuantityUnit;
  currency?: Currency;
}

function analyzeToken(token: string): TokenAnalysis {
  const trimmed = token.trim();

  // Compound token: "50kg", "200din"
  const compoundMatch = trimmed.match(COMPOUND_TOKEN_RE);
  if (compoundMatch && compoundMatch[1] && compoundMatch[2]) {
    const num = parseNumber(compoundMatch[1]);
    const suffix = compoundMatch[2].toLowerCase();
    const isCurr = ['din', 'din.', 'rsd', 'eur', '€', '$'].includes(suffix);
    return {
      isPrice: isCurr,
      isQuantity: !isCurr,
      isCompound: true,
      numericValue: num,
      unit: isCurr ? undefined : normalizeUnit(suffix),
      currency: isCurr ? normalizeCurrency(compoundMatch[2]) : undefined,
    };
  }

  // Cena
  const priceMatch = trimmed.match(PRICE_RE);
  if (priceMatch && priceMatch[2]) {
    return {
      isPrice: true,
      isQuantity: false,
      isCompound: false,
      numericValue: parseNumber(priceMatch[1]),
      currency: normalizeCurrency(priceMatch[2]),
    };
  }

  // Čist broj — može biti i cena i količina
  const qtyMatch = trimmed.match(QTY_RE);
  if (qtyMatch) {
    const num = parseNumber(qtyMatch[1]);
    const unit = qtyMatch[2] ? normalizeUnit(qtyMatch[2]) : '';
    return {
      isPrice: false,
      isQuantity: true,
      isCompound: false,
      numericValue: num,
      unit: unit,
    };
  }

  return { isPrice: false, isQuantity: false, isCompound: false };
}

// ─── TXT / Paste parser ──────────────────────────────────────

/**
 * Parsuje jedan red slobodnog teksta u ParsedRow.
 * Strategija: tokenizuj → identifikuj numeričke tokene → ostatak je ime.
 */
function parseFreeTextLine(
  line: string,
  filename: string,
  lineNumber: number
): ParsedRow | null {
  let cleaned = line.trim();

  // Preskočiti prazne redove
  if (!cleaned) return null;

  // Ukloniti chat preamble
  cleaned = cleaned.replace(CHAT_PREAMBLE_RE, '').trim();
  if (!cleaned) return null;

  // Preskočiti chat meta redove
  if (CHAT_META_RE.test(cleaned)) return null;

  // Ukloniti "x2", "X2" prefiks/sufiks za množenje
  // npr. "Brasno x2" → name=Brasno, qty=2
  const xMultiplierRe = /\bx(\d+)\b/i;
  let xMultiplier: number | undefined;
  const xMatch = cleaned.match(xMultiplierRe);
  if (xMatch) {
    xMultiplier = parseNumber(xMatch[1]);
    cleaned = cleaned.replace(xMultiplierRe, ' ').trim();
  }

  // Ukloniti "ima X u magacinu" beleške
  const stockNoteRe = /\(ima\s+(\d+)\s+u\s+magacinu\)/i;
  const stockMatch = cleaned.match(stockNoteRe);
  let stockQty: number | undefined;
  if (stockMatch) {
    stockQty = parseNumber(stockMatch[1]);
    cleaned = cleaned.replace(stockNoteRe, '').trim();
  }

  // Tokenizacija: split po razmaku, crtici, dvotački, pipe, zarezu
  // Ali pazi da ne razbiješ "200din" ili "50kg"
  const tokens = cleaned
    .split(/[\s\-|,;:\t]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return null;

  const nameParts: string[] = [];
  let quantity: number | undefined = xMultiplier ?? stockQty;
  let unit: QuantityUnit | undefined;
  let price: number | undefined;
  let currency: Currency | undefined;
  const descParts: string[] = [];

  // Prolaz kroz tokene
  for (const token of tokens) {
    const analysis = analyzeToken(token);

    if (analysis.isPrice && !analysis.isQuantity) {
      // Sigurna cena (ima valutu uz broj)
      if (price === undefined) {
        price = analysis.numericValue;
        currency = analysis.currency;
      }
    } else if (analysis.isCompound && analysis.isPrice) {
      if (price === undefined) {
        price = analysis.numericValue;
        currency = analysis.currency;
      }
    } else if (analysis.isCompound && analysis.isQuantity) {
      if (quantity === undefined) {
        quantity = analysis.numericValue;
        unit = analysis.unit;
      }
    } else if (analysis.isQuantity && analysis.numericValue !== undefined) {
      // Čist broj — heuristic: ako je velik (>500) → verovatno cena
      const num = analysis.numericValue;
      if (quantity === undefined && num <= 10000) {
        quantity = num;
        unit = analysis.unit ?? undefined;
      } else if (price === undefined && num > quantity!) {
        price = num;
      }
    } else if (!analysis.isPrice && !analysis.isQuantity) {
      // Nije numerički token
      if (token.length >= MIN_NAME_LENGTH) {
        // Deskriptivni token koji izgleda kao napomena
        const isDesc =
          /^(nerafinski|organsko|domaće|domaći|svez[ae]|zamrznuto)/i.test(
            token
          );
        if (isDesc) {
          descParts.push(token);
        } else {
          nameParts.push(token);
        }
      }
    }
  }

  const rawName = nameParts.join(' ').trim();
  if (!rawName) return null;

  const name = normalizeProductName(rawName);
  if (!name) return null;

  const partial: Partial<ParsedRow> = {
    name,
    rawName,
    quantity,
    unit: unit ?? undefined,
    price,
    currency,
    description: descParts.length > 0 ? descParts.join(', ') : undefined,
  };

  const confidence = calcConfidence(partial);

  return {
    name,
    rawName,
    quantity,
    unit: unit ?? undefined,
    price,
    currency,
    description: partial.description,
    sourceFilename: filename,
    originalLineNumber: lineNumber,
    confidence,
    isSuspect: confidence < 0.7,
  };
}

// ─── CSV parser ──────────────────────────────────────────────

/** Poznati nazivi kolona za svako polje */
const NAME_HEADERS = ['naziv', 'name', 'ime', 'product', 'proizvod', 'artikal', 'item', 'roba'];
const QTY_HEADERS = ['kolicina', 'količina', 'qty', 'quantity', 'kol', 'amount', 'kom'];
const PRICE_HEADERS = ['cena', 'cijena', 'price', 'cost', 'cjn', 'cij', 'vrednost'];
const DESC_HEADERS = ['opis', 'description', 'desc', 'napomena', 'note', 'beleska'];

function detectDelimiter(firstLine: string): string {
  const counts: Record<string, number> = {
    ',': 0,
    ';': 0,
    '\t': 0,
    '|': 0,
  };
  for (const char of firstLine) {
    if (char in counts) counts[char]++;
  }
  const sortedDelimiters = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sortedDelimiters[0]?.[0] ?? ',';
}

function matchHeader(header: string, candidates: string[]): boolean {
  const norm = normalizeProductName(header);
  return candidates.some((c) => normalizeProductName(c) === norm);
}

/**
 * Parsuje CSV/TSV sadržaj.
 * Podržava: BOM, CRLF, auto-detect delimiter, header row detekcija.
 */
export function parseCSVContent(
  rawContent: string,
  filename: string
): ParsedFile {
  const content = normalizeLineEndings(stripBOM(rawContent));
  const lines = content.split('\n').filter((l) => l.trim());

  if (lines.length === 0) {
    return { filename, format: 'csv', rows: [], skippedLines: [], parsedCount: 0 };
  }

  const delimiter = detectDelimiter(lines[0]);

  const splitLine = (line: string): string[] =>
    line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());

  // Da li prvi red izgleda kao zaglavlje?
  const hasHeader =
    headers.some((h) => matchHeader(h, NAME_HEADERS)) ||
    headers.some((h) => matchHeader(h, QTY_HEADERS)) ||
    headers.some((h) => matchHeader(h, PRICE_HEADERS));

  // Mapiranje kolona
  let nameIdx = -1;
  let qtyIdx = -1;
  let priceIdx = -1;
  let descIdx = -1;

  if (hasHeader) {
    headers.forEach((h, i) => {
      if (matchHeader(h, NAME_HEADERS) && nameIdx === -1) nameIdx = i;
      if (matchHeader(h, QTY_HEADERS) && qtyIdx === -1) qtyIdx = i;
      if (matchHeader(h, PRICE_HEADERS) && priceIdx === -1) priceIdx = i;
      if (matchHeader(h, DESC_HEADERS) && descIdx === -1) descIdx = i;
    });
  }

  // Ako nema header-a, pretpostavi: col0=name, col1=qty, col2=price
  if (nameIdx === -1) nameIdx = 0;
  if (qtyIdx === -1 && headers.length > 1) qtyIdx = 1;
  if (priceIdx === -1 && headers.length > 2) priceIdx = 2;

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: ParsedRow[] = [];
  const skippedLines: string[] = [];

  dataLines.forEach((line, idx) => {
    if (!line.trim()) return;
    const cells = splitLine(line);

    const rawName = nameIdx >= 0 ? cells[nameIdx] ?? '' : '';
    if (!rawName.trim()) {
      skippedLines.push(line);
      return;
    }

    const name = normalizeProductName(rawName);
    if (!name) {
      skippedLines.push(line);
      return;
    }

    // Količina
    let quantity: number | undefined;
    let unit: QuantityUnit | undefined;
    if (qtyIdx >= 0 && cells[qtyIdx]) {
      const qRaw = cells[qtyIdx].trim();
      const qMatch = qRaw.match(QTY_RE);
      if (qMatch) {
        quantity = parseNumber(qMatch[1]);
        unit = qMatch[2] ? normalizeUnit(qMatch[2]) : undefined;
      }
    }

    // Cena
    let price: number | undefined;
    let currency: Currency | undefined;
    if (priceIdx >= 0 && cells[priceIdx]) {
      const pRaw = cells[priceIdx].trim();
      const pMatch = pRaw.match(PRICE_RE);
      if (pMatch) {
        price = parseNumber(pMatch[1]);
        currency = pMatch[2] ? normalizeCurrency(pMatch[2]) : undefined;
      } else {
        // Čist broj bez valute
        const num = parseFloat(pRaw.replace(',', '.'));
        if (!isNaN(num)) price = num;
      }
    }

    // Opis
    const description =
      descIdx >= 0 && cells[descIdx]?.trim() ? cells[descIdx].trim() : undefined;

    const partial: Partial<ParsedRow> = { name, quantity, price };
    const confidence = calcConfidence(partial);

    rows.push({
      name,
      rawName,
      quantity,
      unit,
      price,
      currency,
      description,
      sourceFilename: filename,
      originalLineNumber: (hasHeader ? 2 : 1) + idx,
      confidence,
      isSuspect: confidence < 0.7,
    });
  });

  return {
    filename,
    format: 'csv',
    rows,
    skippedLines,
    parsedCount: rows.length,
  };
}

// ─── TXT parser ──────────────────────────────────────────────

/**
 * Parsuje slobodan tekst (TXT fajl).
 */
export function parseTXTContent(
  rawContent: string,
  filename: string
): ParsedFile {
  const content = normalizeLineEndings(stripBOM(rawContent));
  const lines = content.split('\n');

  const rows: ParsedRow[] = [];
  const skippedLines: string[] = [];

  lines.forEach((line, idx) => {
    const parsed = parseFreeTextLine(line, filename, idx + 1);
    if (parsed) {
      rows.push(parsed);
    } else if (line.trim()) {
      skippedLines.push(line);
    }
  });

  return {
    filename,
    format: 'txt',
    rows,
    skippedLines,
    parsedCount: rows.length,
  };
}

// ─── Paste parser ─────────────────────────────────────────────

/**
 * Parsuje zalepljeni tekst (WhatsApp, Instagram, SMS format).
 * Isti algoritam kao TXT, ali sa dodatnom preradom chat formata.
 */
export function parsePasteContent(
  rawContent: string,
  pasteId: string
): ParsedFile {
  // Prepoznaj da li je CSV format
  const firstLine = rawContent.trim().split('\n')[0] ?? '';
  const delimiter = detectDelimiter(firstLine);
  const csvLike = firstLine.split(delimiter).length >= 2 && /\d/.test(firstLine);

  if (csvLike && (firstLine.includes(',') || firstLine.includes(';'))) {
    return parseCSVContent(rawContent, pasteId);
  }

  return parseTXTContent(rawContent, pasteId);
}

// ─── XLSX parser ─────────────────────────────────────────────

/**
 * Parsuje XLSX fajl koristeći xlsx biblioteku.
 * Konvertuje u CSV string, pa parsuje kao CSV.
 * Ovu funkciju treba pozvati sa već učitanim ArrayBuffer.
 */
export async function parseXLSXBuffer(
  buffer: ArrayBuffer,
  filename: string
): Promise<ParsedFile> {
  // Dinamički import da ne bi uticao na server-side rendering
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Uzmi prvi sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { filename, format: 'xlsx', rows: [], skippedLines: [], parsedCount: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  const csvContent = XLSX.utils.sheet_to_csv(sheet);

  const result = parseCSVContent(csvContent, filename);
  return { ...result, format: 'xlsx' };
}

// ─── Auto-detect i parse ──────────────────────────────────────

/**
 * Detektuje format fajla po ekstenziji i sadržaju.
 */
export function detectFormat(filename: string, content: string): InputFormat {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv') return 'csv';
  if (ext === 'tsv') return 'tsv';
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
  if (ext === 'txt') return 'txt';

  // Heuristika po sadržaju
  const firstLine = content.trim().split('\n')[0] ?? '';
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  if (commaCount >= 2 || semicolonCount >= 2) return 'csv';

  return 'txt';
}

/**
 * Glavni entry point za parsovanje string sadržaja.
 * Automatski bira parser po formatu.
 */
export function parseFileContent(
  content: string,
  filename: string,
  format?: InputFormat
): ParsedFile {
  const detectedFormat = format ?? detectFormat(filename, content);

  switch (detectedFormat) {
    case 'csv':
    case 'tsv':
      return parseCSVContent(content, filename);
    case 'txt':
      return parseTXTContent(content, filename);
    case 'paste':
      return parsePasteContent(content, filename);
    default:
      return parseTXTContent(content, filename);
  }
}

/**
 * Parsuje paste tekst direktno.
 */
export function parsePaste(content: string, pasteId: string = 'paste'): ParsedFile {
  return parsePasteContent(content, pasteId);
}
