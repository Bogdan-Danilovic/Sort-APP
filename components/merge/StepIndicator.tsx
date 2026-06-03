'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const status =
          currentStep > step.n
            ? 'completed'
            : currentStep === step.n
            ? 'active'
            : 'pending';

        return (
          <div key={step.n} className="flex items-center">
            <div className={`step-item ${status}`}>
              <div className="step-dot">
                {status === 'completed' ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.n
                )}
              </div>
              <span>{t(step.labelKey)}</span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`step-connector ${currentStep > step.n ? 'completed' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
