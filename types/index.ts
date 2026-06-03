// ============================================================
// MergeKit — Centralne TypeScript definicije tipova
// ============================================================

// ─── Parsing ────────────────────────────────────────────────

/** Format ulaznih podataka */
export type InputFormat = 'csv' | 'tsv' | 'txt' | 'paste' | 'xlsx';

/** Jedinica količine */
export type QuantityUnit = 'kg' | 'g' | 'l' | 'ml' | 'kom' | 'm' | 'cm' | '';

/** Valuta */
export type Currency = 'din' | 'rsd' | 'eur' | 'usd' | '';

/** Jedan token iz sirovog teksta */
export interface RawToken {
  raw: string;
  type: 'name' | 'quantity' | 'price' | 'unit' | 'currency' | 'unknown';
  numericValue?: number;
  unit?: QuantityUnit;
  currency?: Currency;
}

/** Jedan parsovani red iz jednog izvora */
export interface ParsedRow {
  /** Normalizovano ime proizvoda */
  name: string;
  /** Originalni tekst iz fajla (pre normalizacije) */
  rawName: string;
  /** Količina (može biti decimalna) */
  quantity?: number;
  /** Jedinica mere */
  unit?: QuantityUnit;
  /** Cena */
  price?: number;
  /** Valuta cene */
  currency?: Currency;
  /** Opis / napomena */
  description?: string;
  /** Ime izvornog fajla */
  sourceFilename: string;
  /** Originalni redni broj u fajlu */
  originalLineNumber: number;
  /** Procenat pouzdanosti parsovanja (0–1) */
  confidence: number;
  /** Da li je red sumnjiv (confidence < 0.7) */
  isSuspect: boolean;
}

/** Rezultat parsovanja jednog fajla */
export interface ParsedFile {
  filename: string;
  format: InputFormat;
  rows: ParsedRow[];
  /** Redovi koji nisu mogli biti parsirani */
  skippedLines: string[];
  /** Broj uspešno parsovanih redova */
  parsedCount: number;
}

// ─── Merging ────────────────────────────────────────────────

/** Jedan doprinos količine od jednog izvora */
export interface QuantityContribution {
  sourceFilename: string;
  quantity: number;
  unit?: QuantityUnit;
}

/** Jedna cena iz jednog izvora */
export interface PriceEntry {
  sourceFilename: string;
  price: number;
  currency: Currency;
}

/** Spojen proizvod (rezultat merging-a) */
export interface MergedProduct {
  /** Normalizovani ključ za matching (lowercase, bez dijakritika) */
  normalizedKey: string;
  /** Prikazno ime (prvi originalni naziv koji se pojavio) */
  displayName: string;
  /** Svi originalni nazivi */
  rawNames: string[];
  /** Doprinosi količina po izvoru */
  quantityContributions: QuantityContribution[];
  /** Ukupna količina */
  totalQuantity: number;
  /** Jedinica mere (iz prvog pojavljivanja) */
  unit?: QuantityUnit;
  /** Sve cene iz svih izvora */
  prices: PriceEntry[];
  /** Prosečna cena (weighted average) */
  avgPrice?: number;
  /** Ručno uneta cena (override) */
  manualPrice?: number;
  /** Efektivna cena (manualPrice ?? avgPrice) */
  effectivePrice?: number;
  /** Valuta (iz prvog pojavljivanja) */
  currency?: Currency;
  /** Ukupna vrednost = totalQuantity × effectivePrice */
  totalValue?: number;
  /** Opisi iz svih izvora */
  descriptions: string[];
  /** Spojeni opis */
  mergedDescription?: string;
  /** Izvorni fajlovi */
  sources: string[];
}

/** Totali za celu tabelu */
export interface GrandTotals {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  avgPriceOverall?: number;
  sourceCount: number;
}

// ─── Export ─────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  companyName?: string;
  currency?: Currency;
  includeSourceColumn: boolean;
  includeDescriptionColumn: boolean;
}

// ─── Supabase / Session ─────────────────────────────────────

/** Jedan izvor u bazi (za JSONB kolonu source_files) */
export interface SourceFileRecord {
  filename: string;
  format: InputFormat;
  uploadedAt: string;
  rowCount: number;
  rawContent?: string;
}

/** Sesija spajanja */
export interface MergeSession {
  id: string;
  userId: string;
  createdAt: string;
  sessionName: string;
  sourceFiles: SourceFileRecord[];
  mergedResult: MergedProduct[];
  notes?: string;
  productCount: number;
  sourceCount: number;
}

/** DB row za merge_sessions */
export interface MergeSessionRow {
  id: string;
  user_id: string;
  created_at: string;
  session_name: string;
  source_files: SourceFileRecord[];
  merged_result: MergedProduct[];
  notes?: string;
}

/** DB row za uploaded_files */
export interface UploadedFileRow {
  id: string;
  user_id: string;
  session_id: string;
  filename: string;
  file_type: string;
  raw_content: string;
  uploaded_at: string;
}

// ─── UI State ────────────────────────────────────────────────

/** Korak u merge flow-u */
export type MergeStep = 1 | 2 | 3;

/** Stanje jednog uploadovanog fajla u UI-u */
export interface UploadedFile {
  id: string;
  file: File;
  content: string;
  parsed?: ParsedFile;
  isLoading: boolean;
  error?: string;
}

/** Paste unos */
export interface PasteInput {
  id: string;
  content: string;
  parsed?: ParsedFile;
}

/** Konfiguracija sortiranja tabele */
export interface SortConfig {
  column: keyof MergedProduct | 'displayName' | 'totalQuantity' | 'avgPrice' | 'totalValue';
  direction: 'asc' | 'desc';
}

/** Konfiguracija filtera */
export interface FilterConfig {
  searchTerm: string;
}

/** Entry u undo stack-u za cene */
export interface PriceUndoEntry {
  productKey: string;
  previousPrice: number | undefined;
  newPrice: number | undefined;
  timestamp: number;
}

// ─── Settings ────────────────────────────────────────────────

export type AppTheme = 'dark' | 'light' | 'system';
export type AppLocale = 'sr' | 'en';

export interface AppSettings {
  companyName: string;
  defaultCurrency: Currency;
  locale: AppLocale;
  theme: AppTheme;
}

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: '',
  defaultCurrency: 'din',
  locale: 'sr',
  theme: 'dark',
};

// ─── Auth ─────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  settings: AppSettings;
}

// ─── Parser helpers ──────────────────────────────────────────

/** Regex za detekciju valute u tokenu */
export const CURRENCY_REGEX = /(\d+[\.,]?\d*)\s*(din\.?|rsd|eur|€|\$)/i;

/** Regex za detekciju čiste cene (broj sa valutom) */
export const PRICE_REGEX = /^(\d+[\.,]?\d*)\s*(din\.?|rsd|eur|€|\$)?$/i;

/** Regex za detekciju količine sa jedinicom */
export const QUANTITY_REGEX = /^(\d+[\.,]?\d*)\s*(kg|g|l|ml|kom|m|cm)?$/i;

/** Mapiranje valuta na kanonski oblik */
export const CURRENCY_MAP: Record<string, Currency> = {
  'din': 'din',
  'din.': 'din',
  'rsd': 'din',
  'RSD': 'din',
  'DIN': 'din',
  '€': 'eur',
  'eur': 'eur',
  'EUR': 'eur',
  '$': 'usd',
  'usd': 'usd',
  'USD': 'usd',
};

/** Mapiranje jedinica na kanonski oblik */
export const UNIT_MAP: Record<string, QuantityUnit> = {
  'kg': 'kg',
  'KG': 'kg',
  'Kg': 'kg',
  'g': 'g',
  'G': 'g',
  'l': 'l',
  'L': 'l',
  'ml': 'ml',
  'ML': 'ml',
  'mL': 'ml',
  'kom': 'kom',
  'KOM': 'kom',
  'Kom': 'kom',
  'komad': 'kom',
  'komada': 'kom',
  'komade': 'kom',
  'kos': 'kom',
  'kosov': 'kom',
  'komad.': 'kom',
  'm': 'm',
  'M': 'm',
  'cm': 'cm',
  'CM': 'cm',
};
