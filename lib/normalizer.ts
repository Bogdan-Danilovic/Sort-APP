// ============================================================
// MergeKit — Normalizacija teksta
// Accent-insensitive + case-insensitive matching
// šećer = secer = SECER = Secer = шећер
// ============================================================

import flavorData from './flavorAliases.json';

/** Mapa srpskih latiničnih dijakritika → ASCII */
const LATIN_DIACRITIC_MAP: Record<string, string> = {
  // Mala slova
  'š': 's', 'č': 'c', 'ć': 'c', 'ž': 'z', 'đ': 'dj',
  // Velika slova
  'Š': 's', 'Č': 'c', 'Ć': 'c', 'Ž': 'z', 'Đ': 'dj',
  // Ostali česti dijakritici (evropski)
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ý': 'y', 'ÿ': 'y',
  'ñ': 'n', 'ç': 'c',
  'Á': 'a', 'À': 'a', 'Â': 'a', 'Ä': 'a', 'Ã': 'a', 'Å': 'a',
  'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
  'Í': 'i', 'Ì': 'i', 'Î': 'i', 'Ï': 'i',
  'Ó': 'o', 'Ò': 'o', 'Ô': 'o', 'Ö': 'o', 'Õ': 'o',
  'Ú': 'u', 'Ù': 'u', 'Û': 'u', 'Ü': 'u',
  'Ý': 'y', 'Ñ': 'n', 'Ç': 'c',
};

/**
 * Mapa srpske ćirilice → latinica (kanonski oblici).
 * Pokriva cijelu azbuku uključujući dvoslove.
 */
const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  // Mala slova
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'ђ': 'dj', 'е': 'e', 'ж': 'z', 'з': 'z', 'и': 'i',
  'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj', 'м': 'm',
  'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'ћ': 'c', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'c', 'ч': 'c', 'џ': 'dz', 'ш': 's',
  // Velika slova
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd',
  'Ђ': 'dj', 'Е': 'e', 'Ж': 'z', 'З': 'z', 'И': 'i',
  'Ј': 'j', 'К': 'k', 'Л': 'l', 'Љ': 'lj', 'М': 'm',
  'Н': 'n', 'Њ': 'nj', 'О': 'o', 'П': 'p', 'Р': 'r',
  'С': 's', 'Т': 't', 'Ћ': 'c', 'У': 'u', 'Ф': 'f',
  'Х': 'h', 'Ц': 'c', 'Ч': 'c', 'Џ': 'dz', 'Ш': 's',
};

/**
 * Detektuje da li je tekst napisan ćiriličnim pismom.
 * Koristi Unicode range za srpsku ćirilicu.
 */
export function isCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Konvertuje srpsku ćirilicu u latinicu.
 * Dvoslovi (Љ, Њ, Џ, Ђ) se pravilno mapiraju.
 */
export function cyrillicToLatin(text: string): string {
  let result = '';
  for (const char of text) {
    result += CYRILLIC_TO_LATIN_MAP[char] ?? char;
  }
  return result;
}

/**
 * Uklanja dijakritike iz latiničnog teksta.
 * š → s, č → c, ć → c, ž → z, đ → dj
 */
export function removeDiacritics(text: string): string {
  let result = '';
  for (const char of text) {
    result += LATIN_DIACRITIC_MAP[char] ?? char;
  }
  return result;
}

/**
 * Normalizuje tekst za matching:
 * 1. Ćirilica → latinica
 * 2. Dijakritici → ASCII
 * 3. Lowercase
 * 4. Trim whitespace
 * 5. Višestruki razmaci → jedan
 *
 * @example
 * normalize("Šećer") === normalize("secer") // true
 * normalize("шећер") === normalize("Secer") // true
 */
export function normalize(text: string): string {
  let result = text.trim();

  // Ćirilica → latinica
  if (isCyrillic(result)) {
    result = cyrillicToLatin(result);
  }

  // Dijakritici → ASCII
  result = removeDiacritics(result);

  // Lowercase
  result = result.toLowerCase();

  // Višestruki razmaci → jedan
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Normalizuje ime proizvoda za matching (agresivnije).
 * Dodatno uklanja interpunkciju i kratke reči koje nisu deo naziva.
 */
export function normalizeProductName(name: string): string {
  let result = normalize(name);

  // Ukloni emoji karaktere
  result = result.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1FFFF}]/gu, '').trim();

  // Ukloni tačke, zareze, dvotačke na krajevima
  result = result.replace(/[.,;:!?]+$/, '').trim();

  // Ukloni zagrade i sadržaj unutar njih
  result = result.replace(/\([^)]*\)/g, '').trim();

  // Višestruki razmaci ponovo
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Poredi dva naziva proizvoda ignorišući velikomalost i dijakritike.
 * Vraća true ako se smatraju istim proizvodom.
 *
 * @example
 * isSameName("Šećer", "secer") // true
 * isSameName("шећер", "SECER") // true
 * isSameName("Brašno", "Ulje")  // false
 */
export function isSameName(a: string, b: string): boolean {
  return normalizeProductName(a) === normalizeProductName(b);
}

/**
 * Traži ime u listi i vraća normalizovani ključ ako postoji.
 * Korisno za merge logiku.
 */
export function findMatchingKey(
  name: string,
  existingKeys: string[]
): string | undefined {
  const normalized = normalizeProductName(name);
  return existingKeys.find((key) => key === normalized);
}

/**
 * Kreira ključ za grupisanje u merge-u.
 * Isto što i normalizeProductName.
 */
export function createMergeKey(name: string): string {
  return normalizeProductName(name);
}

/**
 * Formatira ime za prikaz: first letter uppercase, ostalo lowercase.
 * Čuva originalne dijakritike.
 */
export function formatDisplayName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Testira sve ključne slučajeve normalizacije.
 * Vraća true ako svi prolaze (za development debug).
 */
export function runNormalizerTests(): boolean {
  const tests: [string, string, boolean][] = [
    ['Šećer', 'secer', true],
    ['šećer', 'SECER', true],
    ['шећер', 'secer', true],
    ['шећер', 'Šećer', true],
    ['Brašno', 'brasno', true],
    ['BRAŠNO', 'brasno', true],
    ['брашно', 'brasno', true],
    ['Ulje', 'ulje', true],
    ['Šećer', 'Brašno', false],
    ['secer', 'ulje', false],
  ];

  return tests.every(([a, b, expected]) => {
    const result = isSameName(a, b) === expected;
    if (!result) {
      console.error(`FAIL: isSameName("${a}", "${b}") expected ${expected}`);
    }
    return result;
  });
}

// ─── Flavor alias matching ────────────────────────────────────

export type FlavorEntry = {
  canonical: string;
  display?: string;
  aliases: string[];
};

let _flavorMap: Map<string, string> | null = null;
let _flavorEntries: FlavorEntry[] = [];

/**
 * Učitava JSON listu ukusa u memorijsku mapu.
 * Poziva se jednom pri startu (auto-poziv na dnu ovog fajla).
 */
export function initFlavorMap(entries: FlavorEntry[]): void {
  _flavorEntries = entries;
  _flavorMap = new Map<string, string>();
  for (const entry of entries) {
    _flavorMap.set(normalizeProductName(entry.canonical), entry.canonical);
    if (entry.display) {
      _flavorMap.set(normalizeProductName(entry.display), entry.canonical);
    }
    for (const alias of entry.aliases) {
      _flavorMap.set(normalizeProductName(alias), entry.canonical);
    }
  }
}

/**
 * Dodaje privremeni alias u memorijsku mapu (ne menja JSON).
 * Koristi se za user-defined matcheve u toku sesije.
 */
export function addTemporaryAlias(rawName: string, canonicalName: string): void {
  if (_flavorMap === null) {
    _flavorMap = new Map<string, string>();
  }
  _flavorMap.set(normalizeProductName(rawName), canonicalName);
}

/**
 * Vraća canonical naziv ukusa za dati naziv, ili null ako nije prepoznat.
 */
export function getFlavorCanonical(name: string): string | null {
  if (_flavorMap === null) return null;
  return _flavorMap.get(normalizeProductName(name)) ?? null;
}

/**
 * Vraća true ako su dva naziva isti ukus (direktno ili kroz aliases).
 */
export function isSameFlavor(a: string, b: string): boolean {
  const ca = getFlavorCanonical(a);
  const cb = getFlavorCanonical(b);
  if (ca !== null && cb !== null) return ca === cb;
  return normalizeProductName(a) === normalizeProductName(b);
}

/**
 * Zamena za createMergeKey — koristi canonical ako je ukus prepoznat.
 * Ovo je ključ koji merger.ts koristi za grupisanje istih ukusa.
 */
export function createFlavorMergeKey(name: string): string {
  const canonical = getFlavorCanonical(name);
  if (canonical !== null) return normalizeProductName(canonical);
  return createMergeKey(name);
}

/**
 * Vraća sve poznate sinonime za dati naziv ukusa.
 */
export function getFlavorAliases(name: string): string[] {
  if (_flavorMap === null) return [name];
  const canonical = getFlavorCanonical(name);
  if (!canonical) return [name];
  const entry = _flavorEntries.find(
    (e) => normalizeProductName(e.canonical) === normalizeProductName(canonical)
  );
  if (!entry) return [canonical];
  return [entry.canonical, ...entry.aliases];
}

/**
 * Vraća canonical naziv za prikaz u tabeli.
 * Ako ukus nije prepoznat, vraća formatovano originalno ime.
 */
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Vraća sve sinonime za prepoznati ukus spojene sa ' / ' u Title Case.
 * Ako ukus nije prepoznat, vraća formatovano originalno ime.
 *
 * @example
 * buildFlavorDisplayName("malina kola")
 * // → "Raspberry Coke / Malina Kola / Malina / Raspberry"
 */
export function buildFlavorDisplayName(name: string): string {
  const canonical = getFlavorCanonical(name);
  if (canonical === null) return formatDisplayName(name);

  const entry = _flavorEntries.find(
    (e) => normalizeProductName(e.canonical) === normalizeProductName(canonical)
  );
  if (!entry) return toTitleCase(canonical);

  // display field is the primary name; prepend it and deduplicate
  const primary = entry.display ?? toTitleCase(entry.canonical);
  const rest = entry.aliases
    .map(toTitleCase)
    .filter((a) => a.toLowerCase() !== primary.toLowerCase());
  const unique = [...new Set([primary, ...rest])];
  return unique.join(' / ');
}

/**
 * Vraća sve učitane flavor entries (za dropdown u modalima).
 */
export function getLoadedFlavorEntries(): FlavorEntry[] {
  return _flavorEntries;
}

// Auto-inicijalizacija iz bundlovanog JSON-a
initFlavorMap(flavorData as FlavorEntry[]);
