'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

interface UnknownFlavorModalProps {
  name: string;
  canonicals: string[];
  remainingCount: number;
  onLink: (name: string, canonical: string) => void;
  onDismiss: (name: string) => void;
  onClose: () => void;
}

const BG1 = '#0c0c12';
const BG2 = '#141420';
const T1  = '#fafafa';
const T2  = '#a1a1a1';
const T3  = '#525252';

export default function UnknownFlavorModal({
  name,
  canonicals,
  remainingCount,
  onLink,
  onDismiss,
  onClose,
}: UnknownFlavorModalProps) {
  const [selected, setSelected] = useState('');

  const handleLink = () => {
    if (!selected) return;
    onLink(name, selected);
    setSelected('');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-2xl p-5 space-y-4"
          style={{ background: '#18181f', border: '1px solid #2a2a38' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <p className="text-sm font-semibold" style={{ color: T1 }}>
                Nepoznat ukus
              </p>
              {remainingCount > 1 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: '#2a2a38', color: T3 }}
                >
                  {remainingCount} preostalih
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 transition-colors"
              style={{ color: T3 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T2; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T3; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Unknown name */}
          <div
            className="px-3 py-2 rounded-lg text-sm font-mono"
            style={{ background: BG1, border: `1px solid ${BG2}`, color: '#f59e0b' }}
          >
            &ldquo;{name}&rdquo;
          </div>

          <p className="text-xs" style={{ color: T2 }}>
            Ovaj naziv nismo prepoznali kao poznati ukus. Da li je ovo isti ukus kao:
          </p>

          {/* Canonical dropdown */}
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none transition-colors appearance-none"
            style={{
              background: BG1,
              border: `1px solid ${BG2}`,
              color: selected ? T1 : T3,
              height: 40,
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.45)'; }}
            onBlur={(e) => { e.target.style.borderColor = BG2; }}
          >
            <option value="">— Izaberi poznati ukus —</option>
            {canonicals.map((c) => (
              <option key={c} value={c} style={{ background: '#18181f', color: T1 }}>
                {c}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleLink}
              disabled={!selected}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
              style={{
                background: selected ? 'linear-gradient(135deg, #2563ef, #3a81f6)' : '#1e1e2a',
                color: '#ffffff',
              }}
            >
              Poveži
            </button>
            <button
              onClick={() => onDismiss(name)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: BG1, color: T2, border: `1px solid ${BG2}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a50'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = BG2; }}
            >
              Nije ukus
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
