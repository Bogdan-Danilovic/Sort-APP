// ============================================================
// MergeKit — Undo stack hook za izmene cena
// Podržava Ctrl+Z sa max 20 koraka
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PriceUndoEntry } from '@/types';

const MAX_STACK_SIZE = 20;

interface UseUndoStackReturn {
  /** Dodaje novo stanje na stack */
  push: (entry: PriceUndoEntry) => void;
  /** Opoziva poslednju izmenu */
  undo: () => PriceUndoEntry | undefined;
  /** Da li postoji nešto za opozivanje */
  canUndo: boolean;
  /** Broj koraka u stack-u */
  stackSize: number;
  /** Briše ceo stack */
  clear: () => void;
}

/**
 * Hook za upravljanje undo stack-om izmena cena.
 * Automatski bind-uje Ctrl+Z kada je `enabled` true.
 *
 * @param onUndo - Callback koji se poziva kada se uradi undo
 * @param enabled - Da li je Ctrl+Z aktivan (default: true)
 */
export function useUndoStack(
  onUndo?: (entry: PriceUndoEntry) => void,
  enabled: boolean = true
): UseUndoStackReturn {
  const [stack, setStack] = useState<PriceUndoEntry[]>([]);

  const push = useCallback((entry: PriceUndoEntry) => {
    setStack((prev) => {
      const newStack = [...prev, entry];
      // Ograniči veličinu stack-a
      if (newStack.length > MAX_STACK_SIZE) {
        return newStack.slice(newStack.length - MAX_STACK_SIZE);
      }
      return newStack;
    });
  }, []);

  const undo = useCallback((): PriceUndoEntry | undefined => {
    let entry: PriceUndoEntry | undefined;

    setStack((prev) => {
      if (prev.length === 0) return prev;
      entry = prev[prev.length - 1];
      return prev.slice(0, -1);
    });

    if (entry && onUndo) {
      onUndo(entry);
    }

    return entry;
  }, [onUndo]);

  const clear = useCallback(() => {
    setStack([]);
  }, []);

  // Ctrl+Z keyboard binding
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        // Ne interferiraj sa undo u text input-ima
        const target = event.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        if (!isInput && stack.length > 0) {
          event.preventDefault();
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, undo, stack.length]);

  return {
    push,
    undo,
    canUndo: stack.length > 0,
    stackSize: stack.length,
    clear,
  };
}
