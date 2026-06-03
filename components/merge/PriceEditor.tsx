'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Currency } from '@/types';

interface PriceEditorProps {
  productKey: string;
  value: number | undefined;
  suggestedValue?: number;
  currency?: Currency;
  onChange: (key: string, price: number | undefined) => void;
  onTabNext?: () => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

export default function PriceEditor({
  productKey,
  value,
  suggestedValue,
  currency = 'din',
  onChange,
  onTabNext,
  inputRef,
}: PriceEditorProps) {
  const [localValue, setLocalValue] = useState<string>(
    value?.toString() ?? suggestedValue?.toString() ?? ''
  );
  const ref = useRef<HTMLInputElement>(null);

  // Sync extern changes
  useEffect(() => {
    const ext = value?.toString() ?? '';
    if (ext !== localValue && document.activeElement !== ref.current) {
      setLocalValue(ext);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = useCallback(() => {
    const num = parseFloat(localValue);
    const parsed = isNaN(num) ? undefined : num;
    onChange(productKey, parsed);
  }, [localValue, onChange, productKey]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        commit();
        onTabNext?.();
      }
      if (e.key === 'Enter') {
        commit();
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === 'Escape') {
        setLocalValue(value?.toString() ?? '');
        (e.target as HTMLInputElement).blur();
      }
    },
    [commit, onTabNext, value]
  );

  const handleBlur = useCallback(() => {
    commit();
  }, [commit]);

  const setRef = useCallback(
    (el: HTMLInputElement | null) => {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      inputRef?.(el);
    },
    [inputRef]
  );

  const displayValue = localValue || suggestedValue?.toString() || '';
  const isManual = value !== undefined;
  const isSuggested = !isManual && suggestedValue !== undefined;

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        ref={setRef}
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
        placeholder={suggestedValue?.toString() ?? '—'}
        className="price-input"
        style={{
          color: isManual
            ? 'var(--text-1)'
            : isSuggested
            ? 'var(--text-3)'
            : 'var(--text-3)',
          fontStyle: isSuggested && !isManual ? 'italic' : 'normal',
        }}
        min={0}
        step={0.01}
        aria-label={`Cena za ${productKey}`}
      />
      {displayValue && (
        <span
          className="text-2xs flex-shrink-0"
          style={{ color: 'var(--text-3)' }}
        >
          {currency}
        </span>
      )}
    </div>
  );
}
