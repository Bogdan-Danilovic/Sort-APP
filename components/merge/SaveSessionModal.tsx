'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, notes: string) => Promise<void>;
  productCount: number;
  sourceCount: number;
}

export default function SaveSessionModal({
  isOpen,
  onClose,
  onSave,
  productCount,
  sourceCount,
}: SaveSessionModalProps) {
  const t = useTranslations('merge.save');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim(), notes.trim());
      setName('');
      setNotes('');
      onClose();
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            onKeyDown={handleKeyDown}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl p-6"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2
                  className="font-semibold text-base"
                  style={{ color: 'var(--text-1)' }}
                >
                  {t('title')}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {productCount} proizvoda · {sourceCount} izvora
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-3)' }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="session-name"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-2)' }}
                >
                  {t('nameLabel')} *
                </label>
                <input
                  id="session-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  autoFocus
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-1)',
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
              </div>

              <div>
                <label
                  htmlFor="session-notes"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-2)' }}
                >
                  {t('notesLabel')}
                </label>
                <textarea
                  id="session-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-colors resize-none"
                  style={{
                    background: 'var(--bg-1)',
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
              </div>

              {error && (
                <p className="text-xs" style={{ color: '#fca5a5' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-md transition-colors"
                style={{
                  color: 'var(--text-2)',
                  background: 'var(--bg-3)',
                }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="px-4 py-2 text-sm rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-40"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} strokeWidth={2} />
                )}
                {saving ? 'Čuvanje...' : t('save')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
