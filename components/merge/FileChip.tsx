'use client';

import { useTranslations } from 'next-intl';
import { FileText, FileSpreadsheet, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UploadedFile } from '@/types';

interface FileChipProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  return FileText;
}

function getFileIconColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return '#10b981';
  if (ext === 'xlsx' || ext === 'xls') return '#3b82f6';
  return 'var(--text-3)';
}

export default function FileChip({ file, onRemove }: FileChipProps) {
  const t = useTranslations('merge.upload');
  const Icon = getFileIcon(file.file.name);
  const iconColor = getFileIconColor(file.file.name);
  const rowCount = file.parsed?.parsedCount ?? 0;

  return (
    <motion.div
      className="file-chip"
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      {/* Icon */}
      {file.isLoading ? (
        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-3)' }} />
      ) : file.error ? (
        <AlertCircle size={14} style={{ color: '#ef4444' }} />
      ) : (
        <Icon size={14} style={{ color: iconColor }} />
      )}

      {/* Filename */}
      <span
        className="max-w-[160px] truncate font-medium"
        style={{ color: file.error ? '#fca5a5' : 'var(--text-1)' }}
        title={file.file.name}
      >
        {file.file.name}
      </span>

      {/* Row count */}
      {!file.isLoading && !file.error && (
        <span
          className="text-2xs font-mono px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--bg-3)',
            color: 'var(--text-3)',
          }}
        >
          {rowCount} {t('files.rows')}
        </span>
      )}

      {/* Error message */}
      {file.error && (
        <span className="text-2xs" style={{ color: '#fca5a5' }}>
          {file.error}
        </span>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(file.id)}
        className="chip-remove"
        aria-label={`${t('files.remove')} ${file.file.name}`}
        title={t('files.remove')}
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}
