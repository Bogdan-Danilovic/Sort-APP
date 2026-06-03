'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';

const FLAVOR_CANONICALS = [
  'kiwi watermelon',
  'guava kiwi strawberry',
  'raspberry coke',
  'peach grape',
  'fantasy cherry',
  'blackcurrant',
  'energy juice',
  'melon coconut',
  'strawberry lychee watermelon',
  'strawberry lychee',
  'apple cantaloupe',
  'pineapple grapefruit',
  'mango pineapple',
  'cool mint',
  'ice tangerine',
  'tobacco',
  'dragon strawberry',
  'mixed berries',
] as const;

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

const SS_KEY = 'flavorOverrides';

function saveOverride(rawName: string, canonical: string) {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SS_KEY) ?? '{}') as Record<string, string>;
    sessionStorage.setItem(SS_KEY, JSON.stringify({ ...existing, [rawName]: canonical }));
  } catch { /* storage unavailable */ }
}

interface Props {
  rawName: string;
  onConfirm: (canonical: string) => void;
  onSkip: () => void;
}

type Status = 'loading' | 'open' | 'done';

export default function FlavorMatchModal({ rawName, onConfirm, onSkip }: Props) {
  const [status, setStatus]         = useState<Status>('loading');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('low');
  const [selected, setSelected]     = useState('');
  const [question, setQuestion]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMatch() {
      try {
        const res  = await fetch('/api/flavor-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: rawName }),
        });
        const data = await res.json() as {
          match: string | null;
          confidence: 'high' | 'medium' | 'low';
          question: string | null;
        };

        if (cancelled) return;

        if (data.confidence === 'high' && data.match) {
          saveOverride(rawName, data.match);
          setStatus('done');
          onConfirm(data.match);
          return;
        }

        setSuggestion(data.match);
        setConfidence(data.confidence);
        setQuestion(data.question);
        setSelected(data.match ?? '');
        setStatus('open');
      } catch {
        if (!cancelled) {
          setSuggestion(null);
          setConfidence('low');
          setStatus('open');
        }
      }
    }

    fetchMatch();
    return () => { cancelled = true; };
  }, [rawName, onConfirm]);

  const handleConfirm = () => {
    if (!selected) return;
    saveOverride(rawName, selected);
    setStatus('done');
    onConfirm(selected);
  };

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background: '#18181f', border: '1px solid #2a2a38' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: '#3a81f6' }} />
          <span className="text-sm" style={{ color: '#a1a1a1' }}>Prepoznajem ukus…</span>
        </div>
      </div>
    );
  }

  if (status !== 'open') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onSkip(); }}
      >
        <motion.div
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
              <Sparkles size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span className="text-sm font-semibold" style={{ color: '#fafafa' }}>
                Nepoznat ukus
              </span>
            </div>
            <button onClick={onSkip} style={{ color: '#525252' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1a1'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#525252'; }}>
              <X size={15} />
            </button>
          </div>

          {/* Raw name */}
          <div className="px-3 py-2 rounded-lg font-mono text-sm" style={{ background: '#0c0c12', border: '1px solid #141420', color: '#f59e0b' }}>
            &ldquo;{rawName}&rdquo;
          </div>

          {/* AI question or default label */}
          <p className="text-xs" style={{ color: '#a1a1a1' }}>
            {question ?? 'Koji ukus odgovara ovom nazivu?'}
          </p>

          {/* Radio list */}
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {FLAVOR_CANONICALS.map((canonical) => {
              const isSuggested = canonical === suggestion && confidence === 'medium';
              return (
                <label
                  key={canonical}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: selected === canonical ? 'rgba(58,129,246,0.1)' : 'transparent',
                    border: `1px solid ${selected === canonical ? 'rgba(58,129,246,0.3)' : 'transparent'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="flavor"
                    value={canonical}
                    checked={selected === canonical}
                    onChange={() => setSelected(canonical)}
                    className="accent-blue-500 flex-shrink-0"
                  />
                  <span className="text-sm flex-1" style={{ color: selected === canonical ? '#fafafa' : '#a1a1a1' }}>
                    {toTitleCase(canonical)}
                  </span>
                  {isSuggested && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                      AI
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
              style={{ background: selected ? 'linear-gradient(135deg,#2563ef,#3a81f6)' : '#1e1e2a', color: '#fff' }}
            >
              Potvrdi
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: '#0c0c12', color: '#a1a1a1', border: '1px solid #141420' }}
            >
              Preskoči
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
