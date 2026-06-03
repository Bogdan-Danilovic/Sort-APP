// ============================================================
// MergeKit — Merger
// Spaja ParsedRow[] iz više izvora u MergedProduct[]
// Logika: isti proizvod → saberi količine, prikaži sve cene
// ============================================================

import {
  type ParsedRow,
  type MergedProduct,
  type GrandTotals,
  type QuantityContribution,
  type PriceEntry,
  type Currency,
  type QuantityUnit,
} from '@/types';
import { createMergeKey } from '@/lib/normalizer';

// ─── Helper funkcije ─────────────────────────────────────────

/**
 * Bira najprikladniju valutu za prikaz.
 * Prioritet: din > eur > usd > '' 
 */
function pickCurrency(prices: PriceEntry[]): Currency {
  if (prices.length === 0) return 'din';
  const currencies = prices.map((p) => p.currency);
  if (currencies.includes('din')) return 'din';
  if (currencies.includes('eur')) return 'eur';
  if (currencies.includes('usd')) return 'usd';
  return 'din';
}

/**
 * Bira najprikladniju jedinicu mere za prikaz.
 */
function pickUnit(contributions: QuantityContribution[]): QuantityUnit | undefined {
  const units = contributions
    .map((c) => c.unit)
    .filter((u): u is QuantityUnit => !!u);
  if (units.length === 0) return undefined;
  // Najčešća jedinica
  const counts: Record<string, number> = {};
  for (const u of units) {
    counts[u] = (counts[u] ?? 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] ?? units[0]) as QuantityUnit;
}

/**
 * Računa prosečnu cenu (weighted average po količini).
 * Ako nema količina, koristi jednostavnu aritmetičku sredinu.
 */
function calcWeightedAvgPrice(
  prices: PriceEntry[],
  contributions: QuantityContribution[]
): number | undefined {
  if (prices.length === 0) return undefined;

  // Pokušaj weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const price of prices) {
    const matchingQty = contributions.find(
      (c) => c.sourceFilename === price.sourceFilename
    );
    const weight = matchingQty?.quantity ?? 1;
    weightedSum += price.price * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return undefined;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Spaja opise iz više izvora u jedan string.
 * Uzima samo unikatne vrednosti, spaja sa " / ".
 */
function mergeDescriptions(descriptions: string[]): string | undefined {
  const unique = [...new Set(descriptions.filter(Boolean))];
  if (unique.length === 0) return undefined;
  return unique.join(' / ');
}

/**
 * Uklanja duplikate iz liste fajlova.
 */
function uniqueSources(sources: string[]): string[] {
  return [...new Set(sources)];
}

// ─── Glavna merge funkcija ───────────────────────────────────

/**
 * Spaja redove iz više izvora u listu MergedProduct.
 *
 * Algoritam:
 * 1. Za svaki ParsedRow → napravi/ažuriraj MergedProduct po normalizedKey
 * 2. Saberi količine, skupi sve cene i opise
 * 3. Izračunaj ukupnu količinu, prosečnu cenu, ukupnu vrednost
 *
 * @param sources - Niz niza ParsedRow (svaki niz = jedan fajl)
 * @returns Sortirana lista MergedProduct
 */
export function mergeProducts(sources: ParsedRow[][]): MergedProduct[] {
  // Mapa: normalizedKey → MergedProduct
  const productMap = new Map<string, MergedProduct>();

  for (const rows of sources) {
    for (const row of rows) {
      if (!row.name) continue;

      const key = createMergeKey(row.name);

      if (!productMap.has(key)) {
        // Novi proizvod
        productMap.set(key, {
          normalizedKey: key,
          displayName: row.rawName || row.name,
          rawNames: [row.rawName || row.name],
          quantityContributions: [],
          totalQuantity: 0,
          unit: row.unit,
          prices: [],
          avgPrice: undefined,
          manualPrice: undefined,
          effectivePrice: undefined,
          currency: row.currency,
          totalValue: undefined,
          descriptions: [],
          mergedDescription: undefined,
          sources: [],
        });
      }

      const product = productMap.get(key)!;

      // Dodaj originalni naziv ako je novi
      if (!product.rawNames.includes(row.rawName || row.name)) {
        product.rawNames.push(row.rawName || row.name);
      }

      // Dodaj doprinos količine
      if (row.quantity !== undefined) {
        const contribution: QuantityContribution = {
          sourceFilename: row.sourceFilename,
          quantity: row.quantity,
          unit: row.unit,
        };
        product.quantityContributions.push(contribution);
        product.totalQuantity += row.quantity;
      }

      // Dodaj cenu (ako je nova kombinacija fajl+vrednost)
      if (row.price !== undefined) {
        const existing = product.prices.find(
          (p) =>
            p.sourceFilename === row.sourceFilename && p.price === row.price
        );
        if (!existing) {
          const priceEntry: PriceEntry = {
            sourceFilename: row.sourceFilename,
            price: row.price,
            currency: row.currency ?? 'din',
          };
          product.prices.push(priceEntry);
        }
      }

      // Dodaj opis
      if (row.description) {
        product.descriptions.push(row.description);
      }

      // Dodaj izvor
      if (!product.sources.includes(row.sourceFilename)) {
        product.sources.push(row.sourceFilename);
      }
    }
  }

  // Post-procesiranje: izračunaj izvedene vrednosti
  const products: MergedProduct[] = [];

  for (const product of productMap.values()) {
    // Jedinica mere
    product.unit = pickUnit(product.quantityContributions);

    // Valuta
    product.currency = pickCurrency(product.prices);

    // Prosečna cena
    product.avgPrice = calcWeightedAvgPrice(
      product.prices,
      product.quantityContributions
    );

    // Efektivna cena (manual override ili prosečna)
    product.effectivePrice = product.manualPrice ?? product.avgPrice;

    // Ukupna vrednost
    if (product.effectivePrice !== undefined && product.totalQuantity > 0) {
      product.totalValue =
        Math.round(product.totalQuantity * product.effectivePrice * 100) / 100;
    }

    // Spojeni opis
    product.mergedDescription = mergeDescriptions(product.descriptions);

    // Izvorni fajlovi (deduplikovani)
    product.sources = uniqueSources(product.sources);

    products.push(product);
  }

  // Sortiraj po displayName (asc)
  products.sort((a, b) =>
    a.normalizedKey.localeCompare(b.normalizedKey, 'sr')
  );

  return products;
}

// ─── Recalculate ────────────────────────────────────────────

/**
 * Recalculate-uje izvedene vrednosti za jedan proizvod.
 * Poziva se nakon ručne izmene cene.
 */
export function recalculateProduct(product: MergedProduct): MergedProduct {
  const effectivePrice = product.manualPrice ?? product.avgPrice;
  const totalValue =
    effectivePrice !== undefined && product.totalQuantity > 0
      ? Math.round(product.totalQuantity * effectivePrice * 100) / 100
      : undefined;

  return {
    ...product,
    effectivePrice,
    totalValue,
  };
}

/**
 * Ažurira manualPrice za jedan proizvod i recalculate-uje.
 */
export function updateProductPrice(
  products: MergedProduct[],
  normalizedKey: string,
  newPrice: number | undefined
): MergedProduct[] {
  return products.map((p) => {
    if (p.normalizedKey !== normalizedKey) return p;
    const updated = { ...p, manualPrice: newPrice };
    return recalculateProduct(updated);
  });
}

// ─── Grand totals ────────────────────────────────────────────

/**
 * Računa ukupne vrednosti za celu tabelu.
 */
export function calculateGrandTotals(
  products: MergedProduct[],
  sourceFiles: string[]
): GrandTotals {
  let totalQuantity = 0;
  let totalValue = 0;
  let priceSum = 0;
  let priceCount = 0;

  for (const product of products) {
    totalQuantity += product.totalQuantity;
    if (product.totalValue !== undefined) {
      totalValue += product.totalValue;
    }
    if (product.effectivePrice !== undefined) {
      priceSum += product.effectivePrice;
      priceCount++;
    }
  }

  return {
    totalProducts: products.length,
    totalQuantity: Math.round(totalQuantity * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100,
    avgPriceOverall:
      priceCount > 0
        ? Math.round((priceSum / priceCount) * 100) / 100
        : undefined,
    sourceCount: sourceFiles.length,
  };
}

// ─── Formatiranje za prikaz ──────────────────────────────────

/**
 * Formatira doprinos količina kao string: "50+30+2=82"
 */
export function formatQuantityBreakdown(product: MergedProduct): string {
  if (product.quantityContributions.length === 0) return '—';
  if (product.quantityContributions.length === 1) {
    const c = product.quantityContributions[0];
    if (!c) return '—';
    return `${c.quantity}${c.unit ? c.unit : ''}`;
  }

  const parts = product.quantityContributions.map(
    (c) => `${c.quantity}${c.unit ? c.unit : ''}`
  );
  const total = `${product.totalQuantity}${product.unit ?? ''}`;
  return `${parts.join('+')}=${total}`;
}

/**
 * Formatira sve cene kao string: "120din | 135din"
 */
export function formatPrices(product: MergedProduct): string {
  if (product.prices.length === 0) return '—';

  // Deduplikovane unikatne cene
  const unique = [...new Map(product.prices.map((p) => [p.price, p])).values()];
  return unique.map((p) => `${p.price}${p.currency}`).join(' | ');
}

/**
 * Formatira vrednost sa valutom.
 */
export function formatCurrency(
  value: number | undefined,
  currency: Currency | undefined
): string {
  if (value === undefined) return '—';
  const curr = currency ?? 'din';
  return `${value.toLocaleString('sr-RS')}${curr}`;
}

// ─── Test case verifikacija ──────────────────────────────────

/**
 * Verifikuje merge logiku sa spec test case-ovima.
 * brasno 82, secer 30, ulje 15
 */
export function verifyMergeTestCases(): boolean {
  const { parseFileContent } = require('@/lib/parser');

  const txt1 = 'brasno 50kg 120din\nsecer 20 85\nulje-10-200rsd nerafinski';
  const paste1 =
    'Zdravo, treba mi:\nBrasno x2 (ima 30 u magacinu)\nUlje 5 komada 180din\nSecer: 10kg';
  const csv1 = 'naziv,kolicina,cena\nBrašno,50,120\nŠećer,20,85';

  const parsed1 = parseFileContent(txt1, 'txt1.txt');
  const parsed2 = parseFileContent(paste1, 'whatsapp.txt');
  const parsed3 = parseFileContent(csv1, 'podaci.csv');

  const merged = mergeProducts([parsed1.rows, parsed2.rows, parsed3.rows]);

  const brasno = merged.find((p) => p.normalizedKey === 'brasno');
  const secer = merged.find((p) => p.normalizedKey === 'secer');
  const ulje = merged.find((p) => p.normalizedKey === 'ulje');

  const ok =
    brasno?.totalQuantity === 82 &&
    secer?.totalQuantity === 30 &&
    ulje?.totalQuantity === 15;

  if (!ok) {
    console.error('Merge test FAIL:', {
      brasno: brasno?.totalQuantity,
      secer: secer?.totalQuantity,
      ulje: ulje?.totalQuantity,
    });
  }

  return ok;
}
