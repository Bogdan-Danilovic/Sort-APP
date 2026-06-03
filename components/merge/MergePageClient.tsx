'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatePresence as AP } from 'framer-motion';

import FileUploadZone from '@/components/merge/FileUploadZone';
import FileChip from '@/components/merge/FileChip';
import PasteTextArea from '@/components/merge/PasteTextArea';
import StepIndicator from '@/components/merge/StepIndicator';
import ParsedPreview from '@/components/merge/ParsedPreview';
import MergedTable from '@/components/merge/MergedTable';
import ExportBar from '@/components/merge/ExportBar';
import SaveSessionModal from '@/components/merge/SaveSessionModal';

import { useMergeSession } from '@/lib/hooks/useMergeSession';
import { createClient } from '@/lib/supabase';
import type { MergedProduct } from '@/types';

import {
  GitMerge,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Save,
  Undo2,
  Search,
  X,
} from 'lucide-react';

interface MergePageClientProps {
  locale: string;
  userId: string;
  companyName?: string;
}

export default function MergePageClient({
  locale,
  userId,
  companyName,
}: MergePageClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const session = useMergeSession();

  const hasInput =
    session.uploadedFiles.some((f) => !f.isLoading && !f.error) ||
    session.pasteInputs.length > 0;

  // ── Save session ────────────────────────────────────────

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

  // ── Apply price to all empty ────────────────────────────

  const [bulkPrice, setBulkPrice] = useState('');

  const handleApplyToAll = () => {
    const num = parseFloat(bulkPrice);
    if (isNaN(num) || num <= 0) return;
    const count = session.applyPriceToAll(num);
    setBulkPrice('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-semibold flex items-center gap-2.5"
            style={{ color: 'var(--text-1)' }}
          >
            <GitMerge size={20} style={{ color: 'var(--accent)' }} />
            {t('merge.title')}
          </h1>
        </div>
        <StepIndicator currentStep={session.step} />
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {/* ── Step 1: Upload ─────────────────────────────── */}
        {session.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <FileUploadZone
              onFilesAdded={session.addFiles}
              isLoading={session.isLoading}
            />

            {/* File chips */}
            {session.uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {session.uploadedFiles.map((uf) => (
                    <FileChip
                      key={uf.id}
                      file={uf}
                      onRemove={session.removeFile}
                    />
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
                    className="file-chip"
                    style={{ maxWidth: 280 }}
                  >
                    <span
                      className="truncate text-xs"
                      style={{ color: 'var(--text-2)' }}
                    >
                      Tekst · {pi.parsed?.parsedCount ?? 0} redova
                    </span>
                    <button
                      onClick={() => session.removePaste(pi.id)}
                      className="chip-remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <PasteTextArea
              onPaste={session.addPaste}
              isDisabled={session.isLoading}
            />

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={session.goNext}
                disabled={!hasInput || session.isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {t('merge.upload.parse')}
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Preview ────────────────────────────── */}
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

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={session.goBack}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: 'var(--text-2)',
                  background: 'var(--bg-3)',
                }}
              >
                <ArrowLeft size={15} strokeWidth={2} />
                {t('common.back')}
              </button>

              <button
                type="button"
                onClick={session.goNext}
                disabled={session.parsedFiles.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {t('merge.preview.mergeAll')}
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Result ─────────────────────────────── */}
        {session.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48 max-w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-3)' }}
                />
                <input
                  type="text"
                  value={session.filterConfig.searchTerm}
                  onChange={(e) =>
                    session.setFilterConfig({ searchTerm: e.target.value })
                  }
                  placeholder={t('merge.result.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                  }}
                />
                {session.filterConfig.searchTerm && (
                  <button
                    onClick={() => session.setFilterConfig({ searchTerm: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-3)' }}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Bulk price */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Popuni prazne..."
                  className="px-2.5 py-1.5 rounded-md text-sm w-36 focus:outline-none"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyToAll}
                  disabled={!bulkPrice}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#fcd34d',
                  }}
                >
                  {t('merge.result.applyPriceToAll')}
                </button>
              </div>

              {/* Undo */}
              {session.canUndo && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                  style={{
                    background: 'var(--bg-3)',
                    color: 'var(--text-2)',
                  }}
                  title={t('common.undoPrice')}
                >
                  <Undo2 size={12} strokeWidth={2} />
                  {t('common.undo')} ({session.undoStackSize})
                </button>
              )}

              <div className="flex-1" />
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
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: 'var(--text-3)', background: 'var(--bg-2)' }}
              >
                <RotateCcw size={14} strokeWidth={2} />
                {t('merge.result.startOver')}
              </button>
            </div>

            {/* Sticky export bar */}
            <ExportBar
              products={session.filteredProducts}
              totals={session.grandTotals}
              companyName={companyName}
              onSave={() => setSaveModalOpen(true)}
            />

            {/* Confirm reset */}
            {confirmReset && (
              <div
                className="p-4 rounded-lg flex items-center justify-between"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <p className="text-sm" style={{ color: '#fca5a5' }}>
                  {t('merge.result.startOverConfirm')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 text-xs rounded-md"
                    style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      session.reset();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-md font-medium"
                    style={{ background: '#ef4444', color: 'white' }}
                  >
                    {t('merge.result.startOver')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
