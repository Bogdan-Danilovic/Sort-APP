'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const t = useTranslations('merge.steps');

  const steps = [
    { n: 1, labelKey: 'upload' },
    { n: 2, labelKey: 'preview' },
    { n: 3, labelKey: 'result' },
  ] as const;

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done    = currentStep > step.n;
        const active  = currentStep === step.n;
        const pending = currentStep < step.n;

        return (
          <div key={step.n} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: done
                    ? '#3a81f6'
                    : active
                    ? 'transparent'
                    : '#1a1a1a',
                  borderColor: done || active ? '#3a81f6' : '#333333',
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  border: '2px solid',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <Check size={12} strokeWidth={2.5} style={{ color: '#ffffff' }} />
                ) : (
                  <span
                    className="text-xs font-bold"
                    style={{ color: active ? '#3a81f6' : '#525252' }}
                  >
                    {step.n}
                  </span>
                )}
              </motion.div>

              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{
                  color: done || active ? '#91c5ff' : '#525252',
                  letterSpacing: '0.02em',
                }}
              >
                {t(step.labelKey)}
              </span>
            </div>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div
                className="relative mx-1.5"
                style={{ width: 32, height: 2, marginBottom: 16 }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: '#1a1a1a' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    background: '#3a81f6',
                    transformOrigin: 'left',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
