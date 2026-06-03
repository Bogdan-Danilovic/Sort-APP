// ============================================================
// MergeKit — useFlavorInit
// Hook koji pri startu fetcha flavor aliases iz /api/flavors
// i inicijalizuje flavorMap sa kombinovanim JSON + Supabase podacima.
//
// Poziva se jednom u MergePageClient (Client Component).
// normalizer.ts se auto-inicijalizuje sa JSON-om pri importu,
// ovaj hook ga dopunjuje sa Supabase podacima.
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { initFlavorMap, type FlavorEntry } from '@/lib/normalizer';

// ── Modul-level state (preživi React Strict Mode double-effect) ──
// useRef se resetuje između Strict Mode re-mount ciklusa, pa ne radi.
// Modul-level flag ostaje između svih rendera iste sesije.

let _supabaseReady = false;
let _fetchPromise: Promise<void> | null = null;

function fetchAndInitFlavors(): Promise<void> {
  if (_fetchPromise) return _fetchPromise; // deduplikat paralelnih poziva

  _fetchPromise = fetch('/api/flavors', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<{ entries: FlavorEntry[] }>;
    })
    .then((data) => {
      if (Array.isArray(data.entries) && data.entries.length > 0) {
        initFlavorMap(data.entries);
        _supabaseReady = true;
      }
    })
    .catch((err) => {
      console.warn('[useFlavorInit] Nije moguće učitati Supabase aliases:', err);
      // Graceful degradacija — normalizer ostaje sa JSON-om
      _fetchPromise = null; // dozvoli retry pri sledećem mount-u
    });

  return _fetchPromise;
}

/**
 * Fetcha flavor aliases iz /api/flavors pri mount-u komponente.
 * Re-inicijalizuje flavorMap sa Supabase + JSON kombinacijom.
 *
 * Vraća { isReady } — true kad su Supabase podaci učitani u mapu.
 * Idempotentno i Strict Mode safe (modul-level flag).
 */
export function useFlavorInit(): { isReady: boolean } {
  const [isReady, setIsReady] = useState(_supabaseReady);

  useEffect(() => {
    if (_supabaseReady) {
      setIsReady(true);
      return;
    }

    fetchAndInitFlavors().then(() => {
      setIsReady(_supabaseReady);
    });
  }, []); // Bez zavisnosti — pozovi samo jednom pri mount-u

  return { isReady };
}

