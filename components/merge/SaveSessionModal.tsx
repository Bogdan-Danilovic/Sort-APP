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
  const [name, setName]     = useState('');
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

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

  const inputStyle = {
    background: '#060609',
    border: '1px solid #141420',
    color: '#fafafa',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    transition: 'border-color 150ms ease',
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.15 }}
            onKeyDown={handleKeyDown}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full rounded-2xl"
            style={{
              maxWidth: 420,
              background: '#0c0c12',
              border: '1px solid #141420',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              padding: '24px',
              margin: '0 16px',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-semibold text-base" style={{ color: '#fafafa' }}>
                  {t('title')}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#525252' }}>
                  {productCount} proizvoda · {sourceCount} izvora
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                style={{ color: '#525252' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1a1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}
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
                  style={{ color: '#a1a1a1' }}
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
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = '#141420'; }}
                />
              </div>

              <div>
                <label
                  htmlFor="session-notes"
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: '#a1a1a1' }}
                >
                  {t('notesLabel')}
                </label>
                <textarea
                  id="session-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  rows={3}
                  className="resize-none focus:outline-none transition-colors"
                  style={{ ...inputStyle, padding: '10px 12px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
                  onBlur={(e)  => { e.target.style.borderColor = '#141420'; }}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-xl transition-colors"
                style={{ color: '#a1a1a1', background: '#141420' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a28'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#141420'; }}
              >
                {t('cancel')}
              </button>
              <motion.button
                type="button"
                onClick={handleSave}
                disabled={!name.trim() || saving}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 text-sm rounded-xl font-semibold flex items-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #2563ef, #3a81f6)', color: 'white' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2} />}
                {saving ? 'Čuvanje...' : t('save')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
