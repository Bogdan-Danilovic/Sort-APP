// ============================================================
// MergeKit — useMergeSession hook
// Centralni state management za ceo 3-step merge flow
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  MergeStep,
  UploadedFile,
  PasteInput,
  ParsedFile,
  MergedProduct,
  GrandTotals,
  SortConfig,
  FilterConfig,
  PriceUndoEntry,
} from '@/types';
import { parseFileContent, parsePaste } from '@/lib/parser';
import {
  mergeProducts,
  calculateGrandTotals,
  updateProductPrice,
  recalculateProduct,
} from '@/lib/merger';
import { useUndoStack } from '@/lib/hooks/useUndoStack';

interface UseMergeSessionReturn {
  // ── Step state ──────────────────────────────────────────
  step: MergeStep;
  goToStep: (step: MergeStep) => void;
  goNext: () => void;
  goBack: () => void;

  // ── Upload (Step 1) ─────────────────────────────────────
  uploadedFiles: UploadedFile[];
  pasteInputs: PasteInput[];
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  addPaste: (content: string) => void;
  removePaste: (id: string) => void;
  updatePaste: (id: string, content: string) => void;
  isLoading: boolean;

  // ── Preview (Step 2) ────────────────────────────────────
  parsedFiles: ParsedFile[];
  updateParsedRow: (
    fileIndex: number,
    rowIndex: number,
    field: string,
    value: string
  ) => void;
  removeSource: (fileIndex: number) => void;

  // ── Result (Step 3) ─────────────────────────────────────
  mergedProducts: MergedProduct[];
  filteredProducts: MergedProduct[];
  grandTotals: GrandTotals;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  setSortConfig: (config: SortConfig) => void;
  setFilterConfig: (config: FilterConfig) => void;
  updatePrice: (normalizedKey: string, price: number | undefined) => void;
  applyPriceToAll: (price: number) => number;

  // ── Undo ────────────────────────────────────────────────
  canUndo: boolean;
  undoStackSize: number;

  // ── Reset ───────────────────────────────────────────────
  reset: () => void;

  // ── Load from session ───────────────────────────────────
  loadFromSession: (products: MergedProduct[]) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const DEFAULT_SORT: SortConfig = {
  column: 'displayName',
  direction: 'asc',
};

const DEFAULT_FILTER: FilterConfig = {
  searchTerm: '',
};

/**
 * Centralni hook za ceo merge flow.
 * Drži sve stanje i exposuje sve akcije.
 */
export function useMergeSession(): UseMergeSessionReturn {
  const [step, setStep] = useState<MergeStep>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pasteInputs, setPasteInputs] = useState<PasteInput[]>([]);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [mergedProducts, setMergedProducts] = useState<MergedProduct[]>([]);
  const [grandTotals, setGrandTotals] = useState<GrandTotals>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    sourceCount: 0,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>(DEFAULT_SORT);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);

  // Ref za tracking cena (za undo)
  const priceHistoryRef = useRef<Map<string, number | undefined>>(new Map());

  // ── Undo handling ──────────────────────────────────────

  const handleUndo = useCallback((entry: PriceUndoEntry) => {
    setMergedProducts((prev) => {
      const updated = updateProductPrice(prev, entry.productKey, entry.previousPrice);
      // Recalculate totals
      const totals = calculateGrandTotals(
        updated,
        [...new Set(updated.flatMap((p) => p.sources))]
      );
      setGrandTotals(totals);
      return updated;
    });
  }, []);

  const { push: pushUndo, canUndo, stackSize: undoStackSize } = useUndoStack(
    handleUndo,
    step === 3
  );

  // ── Step navigation ───────────────────────────────────

  const goToStep = useCallback((s: MergeStep) => {
    setStep(s);
  }, []);

  const goNext = useCallback(() => {
    setStep((prev) => {
      if (prev === 1) {
        // Parse sve fajlove i pređi na Step 2
        const allParsed: ParsedFile[] = [];

        for (const uf of uploadedFiles) {
          if (uf.parsed) {
            allParsed.push(uf.parsed);
          }
        }

        for (const pi of pasteInputs) {
          if (pi.parsed) {
            allParsed.push(pi.parsed);
          }
        }

        setParsedFiles(allParsed);
        return 2;
      }

      if (prev === 2) {
        // Merge sve parsovane redove i pređi na Step 3
        const allRows = parsedFiles.map((pf) => pf.rows);
        const merged = mergeProducts(allRows);
        const sources = [...new Set(parsedFiles.map((pf) => pf.filename))];
        const totals = calculateGrandTotals(merged, sources);

        setMergedProducts(merged);
        setGrandTotals(totals);
        setFilterConfig(DEFAULT_FILTER);
        setSortConfig(DEFAULT_SORT);
        return 3;
      }

      return prev;
    });
  }, [uploadedFiles, pasteInputs, parsedFiles]);

  const goBack = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as MergeStep) : prev));
  }, []);

  // ── File upload ───────────────────────────────────────

  const addFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);

    const newUploads: UploadedFile[] = files.map((file) => ({
      id: generateId(),
      file,
      content: '',
      isLoading: true,
    }));

    setUploadedFiles((prev) => [...prev, ...newUploads]);

    // Čitaj fajlove asinhrono
    const results = await Promise.all(
      newUploads.map(async (upload) => {
        try {
          let content: string;
          let parsed: ParsedFile;

          if (
            upload.file.name.endsWith('.xlsx') ||
            upload.file.name.endsWith('.xls')
          ) {
            const buffer = await upload.file.arrayBuffer();
            const { parseXLSXBuffer } = await import('@/lib/parser');
            parsed = await parseXLSXBuffer(buffer, upload.file.name);
            content = '[xlsx binary]';
          } else {
            content = await upload.file.text();
            parsed = parseFileContent(content, upload.file.name);
          }

          return { id: upload.id, content, parsed, error: undefined };
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Greška pri čitanju fajla';
          return { id: upload.id, content: '', parsed: undefined, error };
        }
      })
    );

    setUploadedFiles((prev) =>
      prev.map((uf) => {
        const result = results.find((r) => r.id === uf.id);
        if (!result) return uf;
        return {
          ...uf,
          content: result.content,
          parsed: result.parsed,
          isLoading: false,
          error: result.error,
        };
      })
    );

    setIsLoading(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ── Paste input ───────────────────────────────────────

  const addPaste = useCallback((content: string) => {
    const id = generateId();
    const parsed = parsePaste(content, `paste-${id}`);
    const newPaste: PasteInput = { id, content, parsed };
    setPasteInputs((prev) => [...prev, newPaste]);
  }, []);

  const removePaste = useCallback((id: string) => {
    setPasteInputs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePaste = useCallback((id: string, content: string) => {
    setPasteInputs((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const parsed = parsePaste(content, `paste-${id}`);
        return { ...p, content, parsed };
      })
    );
  }, []);

  // ── Parsed row editing ────────────────────────────────

  const updateParsedRow = useCallback(
    (fileIndex: number, rowIndex: number, field: string, value: string) => {
      setParsedFiles((prev) => {
        const updated = [...prev];
        const file = updated[fileIndex];
        if (!file) return prev;

        const rows = [...file.rows];
        const row = rows[rowIndex];
        if (!row) return prev;

        // Type-safe field update using index-based approach
        const updatedRow = { ...row };
        if (field === 'name' || field === 'rawName' || field === 'description') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updatedRow as any)[field] = value;
        } else if (field === 'quantity' || field === 'price') {
          const num = parseFloat(value);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updatedRow as any)[field] = isNaN(num) ? undefined : num;
        }

        rows[rowIndex] = updatedRow;
        updated[fileIndex] = { ...file, rows };
        return updated;
      });
    },
    []
  );

  const removeSource = useCallback((fileIndex: number) => {
    setParsedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
  }, []);

  // ── Price editing ─────────────────────────────────────

  const updatePrice = useCallback(
    (normalizedKey: string, price: number | undefined) => {
      // Sačuvaj u history za undo
      const previousPrice = priceHistoryRef.current.get(normalizedKey);
      priceHistoryRef.current.set(normalizedKey, price);

      const undoEntry: PriceUndoEntry = {
        productKey: normalizedKey,
        previousPrice,
        newPrice: price,
        timestamp: Date.now(),
      };
      pushUndo(undoEntry);

      setMergedProducts((prev) => {
        const updated = updateProductPrice(prev, normalizedKey, price);
        const sources = [...new Set(updated.flatMap((p) => p.sources))];
        const totals = calculateGrandTotals(updated, sources);
        setGrandTotals(totals);
        return updated;
      });
    },
    [pushUndo]
  );

  const applyPriceToAll = useCallback(
    (price: number): number => {
      let count = 0;

      setMergedProducts((prev) => {
        const updated = prev.map((p) => {
          if (p.effectivePrice !== undefined) return p; // Već ima cenu
          count++;
          priceHistoryRef.current.set(p.normalizedKey, p.manualPrice);
          const withPrice = { ...p, manualPrice: price };
          return recalculateProduct(withPrice);
        });

        const sources = [...new Set(updated.flatMap((p) => p.sources))];
        setGrandTotals(calculateGrandTotals(updated, sources));
        return updated;
      });

      return count;
    },
    []
  );

  // ── Filtering & Sorting ───────────────────────────────

  const filteredProducts = (() => {
    let products = [...mergedProducts];

    // Filter
    if (filterConfig.searchTerm) {
      const term = filterConfig.searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          p.normalizedKey.includes(term) ||
          p.displayName.toLowerCase().includes(term)
      );
    }

    // Sort
    products.sort((a, b) => {
      const { column, direction } = sortConfig;
      let comparison = 0;

      switch (column) {
        case 'displayName':
          comparison = a.normalizedKey.localeCompare(b.normalizedKey, 'sr');
          break;
        case 'totalQuantity':
          comparison = a.totalQuantity - b.totalQuantity;
          break;
        case 'avgPrice':
          comparison =
            (a.effectivePrice ?? -1) - (b.effectivePrice ?? -1);
          break;
        case 'totalValue':
          comparison = (a.totalValue ?? -1) - (b.totalValue ?? -1);
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return products;
  })();

  // ── Reset ─────────────────────────────────────────────

  const reset = useCallback(() => {
    setStep(1);
    setUploadedFiles([]);
    setPasteInputs([]);
    setParsedFiles([]);
    setMergedProducts([]);
    setGrandTotals({
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      sourceCount: 0,
    });
    setSortConfig(DEFAULT_SORT);
    setFilterConfig(DEFAULT_FILTER);
    priceHistoryRef.current.clear();
  }, []);

  // ── Load from saved session ───────────────────────────

  const loadFromSession = useCallback((products: MergedProduct[]) => {
    setMergedProducts(products);
    const sources = [...new Set(products.flatMap((p) => p.sources))];
    setGrandTotals(calculateGrandTotals(products, sources));
    setStep(3);
  }, []);

  return {
    step,
    goToStep,
    goNext,
    goBack,
    uploadedFiles,
    pasteInputs,
    addFiles,
    removeFile,
    addPaste,
    removePaste,
    updatePaste,
    isLoading,
    parsedFiles,
    updateParsedRow,
    removeSource,
    mergedProducts,
    filteredProducts,
    grandTotals,
    sortConfig,
    filterConfig,
    setSortConfig,
    setFilterConfig,
    updatePrice,
    applyPriceToAll,
    canUndo,
    undoStackSize,
    reset,
    loadFromSession,
  };
}
