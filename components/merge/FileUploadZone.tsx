'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, FileSpreadsheet, ClipboardPaste, Download } from 'lucide-react';
import { downloadCSVTemplate, downloadXLSXTemplate } from '@/lib/templateUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = [
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ACCEPTED_EXTENSIONS = ['.csv', '.txt', '.xlsx', '.xls'];

const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const;

function filterFiles(raw: File[]) {
  return raw.filter((f) => {
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '');
    return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTENSIONS.includes(ext);
  });
}

export default function FileUploadZone({ onFilesAdded, isLoading = false }: FileUploadZoneProps) {
  const t = useTranslations('merge.upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPasteHint, setIsPasteHint] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  /* ── drag handlers ─────────────────────────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom
    ) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = filterFiles(Array.from(e.dataTransfer.files));
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  /* ── file input ────────────────────────────────────────── */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) onFilesAdded(files);
      e.target.value = '';
    },
    [onFilesAdded]
  );

  /* ── paste from clipboard ──────────────────────────────── */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isLoading) return;

      // Files pasted (e.g. from file manager)
      const items = e.clipboardData?.items ?? [];
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) pastedFiles.push(f);
        }
      }
      if (pastedFiles.length > 0) {
        const filtered = filterFiles(pastedFiles);
        if (filtered.length > 0) { onFilesAdded(filtered); return; }
      }

      // Text pasted — wrap as .txt File
      const text = e.clipboardData?.getData('text');
      if (text && text.trim().length > 0) {
        const blob = new Blob([text], { type: 'text/plain' });
        const file = new File([blob], 'paste.txt', { type: 'text/plain' });
        onFilesAdded([file]);
        setIsPasteHint(true);
        setTimeout(() => setIsPasteHint(false), 2000);
      }
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [isLoading, onFilesAdded]);

  const openPicker = () => {
    if (!isLoading) document.getElementById('mk-file-input')?.click();
  };

  return (
    <motion.div
      ref={zoneRef}
      className="upload-zone relative overflow-hidden"
      animate={{ scale: isDragOver ? 1.015 : 1 }}
      transition={SPRING}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openPicker}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openPicker(); }}
      aria-label={t('dropzone')}
      style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
    >
      <input
        id="mk-file-input"
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        disabled={isLoading}
      />

      {/* Animated SVG marching-ants border on drag-over */}
      <AnimatePresence>
        {isDragOver && (
          <motion.svg
            key="marching"
            className="absolute inset-0 w-full h-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ borderRadius: 12 }}
          >
            <motion.rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="11" ry="11"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              animate={{ strokeDashoffset: [0, -112] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isDragOver ? (
          <motion.div
            key="drag"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(58,129,246,0.15)',
                border: '1px solid rgba(58,129,246,0.3)',
                boxShadow: '0 0 20px rgba(58,129,246,0.3)',
              }}
            >
              <Upload size={24} style={{ color: '#3a81f6' }} />
            </motion.div>
            <p className="font-semibold tracking-wide" style={{ color: '#91c5ff' }}>
              {t('dropzoneActive')}
            </p>
          </motion.div>
        ) : isPasteHint ? (
          <motion.div
            key="pasted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <ClipboardPaste size={20} style={{ color: '#10b981' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: '#10b981' }}>Zalijepljeno!</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#111111', border: '1px solid #262626' }}
            >
              <Upload size={24} style={{ color: '#3a81f6' }} />
            </div>

            {/* Labels */}
            <div className="flex flex-col items-center gap-1.5">
              <p className="font-semibold text-sm" style={{ color: '#fafafa' }}>
                {t('dropzone')}
              </p>
              <p className="text-xs" style={{ color: '#a1a1a1' }}>
                {t('dropzoneHint')}
              </p>
            </div>

            {/* Format chips */}
            <div className="flex items-center gap-2 mt-1">
              {['.csv', '.txt', '.xlsx'].map((ext) => (
                <span
                  key={ext}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium"
                  style={{ background: '#1a1a1a', border: '1px solid #262626', color: '#a1a1a1' }}
                >
                  {ext === '.csv' || ext === '.xlsx'
                    ? <FileSpreadsheet size={10} />
                    : <FileText size={10} />
                  }
                  {ext}
                </span>
              ))}
            </div>

            {/* Browse button */}
            <button
              type="button"
              className="text-xs font-semibold px-4 py-2 mt-1 rounded-lg transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(58,129,246,0.1)',
                color: '#91c5ff',
                border: '1px solid rgba(58,129,246,0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(58,129,246,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(58,129,246,0.1)';
              }}
              onClick={(e) => { e.stopPropagation(); openPicker(); }}
            >
              {t('browse')}
            </button>

            {/* Paste hint */}
            <p className="text-[11px] flex items-center gap-1" style={{ color: '#525252' }}>
              <ClipboardPaste size={11} />
              Ctrl+V za lijepljenje teksta
            </p>

            {/* Template download */}
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#525252' }}>
              <Download size={10} />
              <span>Predložak:</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadCSVTemplate(); }}
                className="underline underline-offset-2 transition-colors cursor-pointer"
                onMouseEnter={(e) => { e.currentTarget.style.color = '#91c5ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
              >
                CSV
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadXLSXTemplate(); }}
                className="underline underline-offset-2 transition-colors cursor-pointer"
                onMouseEnter={(e) => { e.currentTarget.style.color = '#91c5ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
              >
                Excel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
