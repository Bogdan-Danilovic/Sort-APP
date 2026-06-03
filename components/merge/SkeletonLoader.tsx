'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Jedan shimmer blok */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Skeleton za desktop tabelu — N redova */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
      >
        {[140, 80, 60, 80, 72, 88].map((w, i) => (
          <Skeleton key={i} style={{ width: w, height: 10, borderRadius: 4 }} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="flex items-center gap-4 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-dim, rgba(255,255,255,0.04))' }}
        >
          <Skeleton style={{ flex: 2, height: 12 }} />
          <Skeleton style={{ width: 60, height: 12 }} />
          <Skeleton style={{ width: 48, height: 12 }} />
          <Skeleton style={{ width: 72, height: 12 }} />
          <Skeleton style={{ width: 64, height: 12 }} />
          <Skeleton style={{ width: 80, height: 12 }} />
        </motion.div>
      ))}
    </div>
  );
}

/** Skeleton za mobile kartice — N kartica */
export function CardsSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: cards }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
          className="merge-card"
        >
          {/* Title row */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton style={{ height: 13, width: '65%' }} />
              <Skeleton style={{ height: 10, width: '40%' }} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton style={{ height: 14, width: 72 }} />
              <Skeleton style={{ height: 10, width: 48 }} />
            </div>
          </div>

          {/* Price row */}
          <div
            className="flex items-center justify-between rounded-lg px-3"
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', height: 44 }}
          >
            <Skeleton style={{ height: 10, width: 60 }} />
            <Skeleton style={{ height: 10, width: 80 }} />
          </div>

          {/* Source chips */}
          <div className="flex gap-2">
            <Skeleton style={{ height: 20, width: 56, borderRadius: 9999 }} />
            <Skeleton style={{ height: 20, width: 64, borderRadius: 9999 }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Kombinovani — auto-switch između table i card skeletona */
export default function SkeletonLoader({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <TableSkeleton rows={rows} />
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <CardsSkeleton cards={Math.min(rows, 5)} />
      </div>
    </>
  );
}
