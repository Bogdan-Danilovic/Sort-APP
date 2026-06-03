'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface MergeKitLogoProps {
  locale: string;
  iconOnly?: boolean;
}

export default function MergeKitLogo({ locale, iconOnly = false }: MergeKitLogoProps) {
  return (
    <Link href={`/${locale}/dashboard`} aria-label="MergeKit — Kontrolna tabla" style={{ textDecoration: 'none' }}>
      <motion.div
        className="flex items-center gap-2.5"
        whileHover={{ scale: 1.03, filter: 'drop-shadow(0 0 10px rgba(58,129,246,0.4))' }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ cursor: 'pointer' }}
      >
        {/* SVG: two streams merging into one — outline/stroke only */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <path d="M3 7 L14 14"  stroke="#3a81f6" strokeWidth="2"   strokeLinecap="round" />
          <path d="M3 21 L14 14" stroke="#3a81f6" strokeWidth="2"   strokeLinecap="round" strokeOpacity="0.55" />
          <path d="M14 14 L25 14" stroke="#3a81f6" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="3"  cy="7"  r="2"   fill="#1a4eda" />
          <circle cx="3"  cy="21" r="2"   fill="#1a4eda" fillOpacity="0.55" />
          <circle cx="14" cy="14" r="2.5" fill="#3a81f6" />
        </svg>

        {!iconOnly && (
          <span
            className="font-mono font-bold text-sm tracking-tight whitespace-nowrap"
            style={{ color: '#fafafa' }}
          >
            MergeKit
          </span>
        )}
      </motion.div>
    </Link>
  );
}
