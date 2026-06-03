'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, FileText, FileSpreadsheet } from 'lucide-react';
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

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls')
    return FileSpreadsheet;
  return FileText;
}

export default function FileUploadZone({
  onFilesAdded,
  isLoading = false,
}: FileUploadZoneProps) {
  const t = useTranslations('merge.upload');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Provjeri da li smo zaista izašli iz zone
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter((f) => {
        const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '');
        return (
          ACCEPTED_TYPES.includes(f.type) ||
          ACCEPTED_EXTENSIONS.includes(ext)
        );
      });

      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFilesAdded(files);
      }
      // Reset input
      e.target.value = '';
    },
    [onFilesAdded]
  );

  return (
    <div
      className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          document.getElementById('file-input')?.click();
        }
      }}
      aria-label={t('dropzone')}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        disabled={isLoading}
      />

      <AnimatePresence mode="wait">
        {isDragOver ? (
          <motion.div
            key="drag"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              <Upload size={24} className="text-indigo-400" />
            </motion.div>
            <p className="font-semibold text-indigo-400 tracking-wide">
              {t('dropzoneActive')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-2)] border border-[var(--border)] shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Upload size={20} className="text-[var(--text-3)] group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="font-semibold text-[var(--text-1)]">
                {t('dropzone')}
              </p>
              <p className="text-xs text-[var(--text-3)]">
                {t('dropzoneHint')}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold px-4 py-2 mt-1 rounded-lg transition-all duration-300 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:shadow-glow-sm"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-input')?.click();
              }}
            >
              {t('browse')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
