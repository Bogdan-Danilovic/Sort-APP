'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasteTextAreaProps {
  onPaste: (content: string) => void;
  isDisabled?: boolean;
}

export default function PasteTextArea({ onPaste, isDisabled }: PasteTextAreaProps) {
  const t = useTranslations('merge.upload');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPaste(trimmed);
    setValue('');
    setOpen(false);
  }, [value, onPaste]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter za submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: 'var(--text-3)' }}
        disabled={isDisabled}
      >
        {open ? (
          <ChevronDown size={13} strokeWidth={2} />
        ) : (
          <ChevronRight size={13} strokeWidth={2} />
        )}
        {t('paste')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              <textarea
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t('pasteHint')}
                rows={5}
                className="w-full rounded-lg px-3 py-2.5 text-sm resize-y font-mono focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  caretColor: 'var(--accent)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                }}
                disabled={isDisabled}
              />
              <div className="flex items-center justify-between">
                <p className="text-2xs" style={{ color: 'var(--text-3)' }}>
                  Ctrl+Enter za dodavanje
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!value.trim() || isDisabled}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                  }}
                >
                  Dodaj tekst
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
