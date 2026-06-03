'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import FileUploadZone from '@/components/merge/FileUploadZone';
import FileChip from '@/components/merge/FileChip';
import PasteTextArea from '@/components/merge/PasteTextArea';
import StepIndicator from '@/components/merge/StepIndicator';
import ParsedPreview from '@/components/merge/ParsedPreview';
import MergedTable from '@/components/merge/MergedTable';
import ExportBar from '@/components/merge/ExportBar';
import SaveSessionModal from '@/components/merge/SaveSessionModal';
import UnknownFlavorModal from '@/components/merge/UnknownFlavorModal';

import { useMergeSession } from '@/lib/hooks/useMergeSession';
import { createClient } from '@/lib/supabase';
import {
  getFlavorCanonical,
  addTemporaryAlias,
  getLoadedFlavorEntries,
  normalizeProductName,
} from '@/lib/normalizer';

import { ArrowRight, ArrowLeft, RotateCcw, Undo2, Search, X } from 'lucide-react';
import MergeKitLogo from '@/components/ui/MergeKitLogo';

interface MergePageClientProps {
  locale: string;
  userId: string;
  companyName?: string;
}

const BG1 = '#0c0c12';
const BG2 = '#141420';
const T1  = '#fafafa';
const T2  = '#a1a1a1';
const T3  = '#525252';
const ACCENT_GRAD = 'linear-gradient(135deg, #2563ef, #3a81f6)';

export default function MergePageClient({ locale, userId, companyName }: MergePageClientProps) {
  const t = useTranslations();
  const supabase = createClient();

  const [saveModalOpen, setSaveModalOpen]           = useState(false);
  const [confirmReset, setConfirmReset]             = useState(false);
  const [bulkPrice, setBulkPrice]                   = useState('');
  const [unknownQueue, setUnknownQueue]             = useState<string[]>([]);
  const step3DetectedRef                            = useRef(false);

  const session = useMergeSession();

  // ── Session storage helpers ──────────────────────────────

  const SS_KEY = 'mergekit-flavor-decisions';

  type FlavorDecisions = {
    dismissed: string[];
    linked: Record<string, string>;
  };

  function loadDecisions(): FlavorDecisions {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return { dismissed: [], linked: {} };
      return JSON.parse(raw) as FlavorDecisions;
    } catch {
      return { dismissed: [], linked: {} };
    }
  }

  function saveDecisions(d: FlavorDecisions): void {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(d));
    } catch {
      // sessionStorage may be unavailable in some contexts
    }
  }

  // Apply any previously linked aliases from this session on mount
  useEffect(() => {
    const { linked } = loadDecisions();
    for (const [raw, canonical] of Object.entries(linked)) {
      addTemporaryAlias(raw, canonical);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect unknown flavor names when step 3 is entered
  useEffect(() => {
    if (session.step === 3 && !step3DetectedRef.current) {
      step3DetectedRef.current = true;

      const { dismissed, linked } = loadDecisions();
      const decidedKeys = new Set([
        ...dismissed,
        ...Object.keys(linked),
      ]);

      const unknowns = session.mergedProducts
        .map((p) => p.displayName)
        .filter((name) => {
          if (getFlavorCanonical(name) !== null) return false;
          const norm = normalizeProductName(name);
          return !decidedKeys.has(norm);
        });

      if (unknowns.length > 0) setUnknownQueue(unknowns);
    }

    if (session.step !== 3) {
      step3DetectedRef.current = false;
      setUnknownQueue([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.step]);

  // ── Unknown flavor handlers ──────────────────────────────

  const handleFlavorLink = (name: string, canonical: string) => {
    const norm = normalizeProductName(name);
    addTemporaryAlias(name, canonical);
    const d = loadDecisions();
    saveDecisions({ ...d, linked: { ...d.linked, [norm]: canonical } });
    session.reMerge();
    setUnknownQueue((prev) => prev.filter((n) => n !== name));
  };

  const handleFlavorDismiss = (name: string) => {
    const norm = normalizeProductName(name);
    const d = loadDecisions();
    saveDecisions({ ...d, dismissed: [...d.dismissed, norm] });
    setUnknownQueue((prev) => prev.filter((n) => n !== name));
  };

  const canonicals = getLoadedFlavorEntries().map((e) => e.canonical);

  const hasInput =
    session.uploadedFiles.some((f) => !f.isLoading && !f.error) ||
    session.pasteInputs.length > 0;

  const handleSave = async (name: string, notes: string) => {
    const sourceFiles = session.parsedFiles.map((pf) => ({
      filename: pf.filename,
      format: pf.format,
      uploadedAt: new Date().toISOString(),
      rowCount: pf.parsedCount,
    }));
    const { error } = await supabase.from('merge_sessions').insert({
      user_id: userId,
      session_name: name,
      source_files: sourceFiles as unknown as import('@/types/supabase').Json,
      merged_result: session.mergedProducts as unknown as import('@/types/supabase').Json,
      notes: notes || null,
    });
    if (error) throw error;
  };

  const handleApplyToAll = () => {
    const num = parseFloat(bulkPrice);
    if (isNaN(num) || num <= 0) return;
    session.applyPriceToAll(num);
    setBulkPrice('');
  };

  const inputBase = {
    background: BG1,
    border: `1px solid ${BG2}`,
    color: T1,
    height: 40,
  } as const;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div
        className="items-center mb-6 sm:mb-8"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}
      >
        <div />
        <MergeKitLogo locale={locale} />
        <div className="flex justify-end">
          <StepIndicator currentStep={session.step} />
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════════════
            STEP 1 — Upload
        ══════════════════════════════════════════ */}
        {session.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <FileUploadZone onFilesAdded={session.addFiles} isLoading={session.isLoading} />

            {/* File chips */}
            {session.uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {session.uploadedFiles.map((uf) => (
                    <FileChip key={uf.id} file={uf} onRemove={session.removeFile} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Paste chips */}
            {session.pasteInputs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {session.pasteInputs.map((pi) => (
                  <div
                    key={pi.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: BG1, border: `1px solid ${BG2}`, maxWidth: 280 }}
                  >
                    <span className="truncate" style={{ color: T2 }}>
                      Tekst · {pi.parsed?.parsedCount ?? 0} redova
                    </span>
                    <button
                      onClick={() => session.removePaste(pi.id)}
                      className="flex-shrink-0 transition-colors"
                      style={{ color: T3 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = T2; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = T3; }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <PasteTextArea onPaste={session.addPaste} isDisabled={session.isLoading} />

            {/* Parse CTA — full width on mobile */}
            <div className="flex pt-2">
              <motion.button
                type="button"
                onClick={session.goNext}
                disabled={!hasInput || session.isLoading}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-none sm:ml-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: ACCENT_GRAD, color: '#ffffff' }}
              >
                {t('merge.upload.parse')}
                <ArrowRight size={15} strokeWidth={2} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — Parsed Preview
        ══════════════════════════════════════════ */}
        {session.step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <ParsedPreview
              parsedFiles={session.parsedFiles}
              onUpdateRow={session.updateParsedRow}
              onRemoveSource={session.removeSource}
            />

            <div className="flex items-center gap-3 pt-2">
              <motion.button
                type="button"
                onClick={session.goBack}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: T2, background: BG1, border: `1px solid ${BG2}` }}
              >
                <ArrowLeft size={15} strokeWidth={2} />
                {t('common.back')}
              </motion.button>

              <motion.button
                type="button"
                onClick={session.goNext}
                disabled={session.parsedFiles.length === 0}
                whileTap={{ scale: 0.98 }}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: ACCENT_GRAD, color: '#ffffff' }}
              >
                {t('merge.preview.mergeAll')}
                <ArrowRight size={15} strokeWidth={2} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — Merged Result
        ══════════════════════════════════════════ */}
        {session.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Toolbar — stacked on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">

              {/* Search — always full width on mobile */}
              <div className="relative w-full sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: T3 }}
                />
                <input
                  type="text"
                  value={session.filterConfig.searchTerm}
                  onChange={(e) => session.setFilterConfig({ searchTerm: e.target.value })}
                  placeholder={t('merge.result.searchPlaceholder')}
                  className="w-full pl-9 pr-8 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ ...inputBase, paddingLeft: 36, paddingRight: 28 }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.45)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = BG2; }}
                />
                {session.filterConfig.searchTerm && (
                  <button
                    onClick={() => session.setFilterConfig({ searchTerm: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    style={{ color: T3 }}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Bulk price row */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Popuni prazne..."
                  className="flex-1 sm:flex-none sm:w-36 px-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.45)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = BG2; }}
                />
                <button
                  type="button"
                  onClick={handleApplyToAll}
                  disabled={!bulkPrice}
                  className="flex-shrink-0 px-3 text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors"
                  style={{
                    background: 'rgba(245,158,11,0.1)',
                    color: '#fcd34d',
                    border: '1px solid rgba(245,158,11,0.2)',
                    height: 40,
                  }}
                >
                  {t('merge.result.applyPriceToAll')}
                </button>

                {session.canUndo && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 text-xs font-medium rounded-xl flex-shrink-0 transition-colors"
                    style={{ background: BG1, color: T2, border: `1px solid ${BG2}`, height: 40 }}
                    title={t('common.undoPrice')}
                  >
                    <Undo2 size={13} strokeWidth={2} />
                    <span className="hidden sm:inline">{t('common.undo')}</span>
                    <span className="opacity-60 text-[10px]">({session.undoStackSize})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <MergedTable
              products={session.filteredProducts}
              grandTotals={session.grandTotals}
              sortConfig={session.sortConfig}
              filterConfig={session.filterConfig}
              onSort={session.setSortConfig}
              onFilter={session.setFilterConfig}
              onUpdatePrice={session.updatePrice}
            />

            {/* Bottom actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: T3, background: BG1, border: `1px solid ${BG2}` }}
              >
                <RotateCcw size={14} strokeWidth={2} />
                {t('merge.result.startOver')}
              </button>
            </div>

            {/* Export bar */}
            <ExportBar
              products={session.filteredProducts}
              totals={session.grandTotals}
              companyName={companyName}
              onSave={() => setSaveModalOpen(true)}
            />

            {/* Confirm reset */}
            <AnimatePresence>
              {confirmReset && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <p className="text-sm flex-1" style={{ color: '#fca5a5' }}>
                    {t('merge.result.startOverConfirm')}
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 text-xs rounded-lg"
                      style={{ background: BG1, color: T2, border: `1px solid ${BG2}` }}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => { session.reset(); setConfirmReset(false); }}
                      className="px-3 py-1.5 text-xs rounded-lg font-semibold"
                      style={{ background: '#ef4444', color: 'white' }}
                    >
                      {t('merge.result.startOver')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unknown flavor modal */}
      {unknownQueue.length > 0 && unknownQueue[0] && (
        <UnknownFlavorModal
          name={unknownQueue[0]}
          canonicals={canonicals}
          remainingCount={unknownQueue.length}
          onLink={handleFlavorLink}
          onDismiss={handleFlavorDismiss}
          onClose={() => setUnknownQueue([])}
        />
      )}

      {/* Save modal */}
      <SaveSessionModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSave}
        productCount={session.mergedProducts.length}
        sourceCount={session.parsedFiles.length}
      />
    </div>
  );
}
