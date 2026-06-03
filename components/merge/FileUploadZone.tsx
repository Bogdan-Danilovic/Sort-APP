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
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.2)' }}
            >
              <Upload size={22} style={{ color: 'var(--accent)' }} />
            </motion.div>
            <p className="font-medium" style={{ color: '#818cf8' }}>
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
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-3)' }}
            >
              <Upload size={20} style={{ color: 'var(--text-3)' }} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="font-medium" style={{ color: 'var(--text-1)' }}>
                {t('dropzone')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {t('dropzoneHint')}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
              }}
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
