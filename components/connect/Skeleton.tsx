// Shimmer placeholders shown while dashboard data loads — always paired
// light/dark like the real components they stand in for.
import { ReactNode } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/80 dark:bg-white/[0.07] ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
      </div>
    </div>
  );
}

export function PanelSkeleton({ lines = 4, header = true }: { lines?: number; header?: boolean }) {
  return (
    <div className="bg-white dark:bg-[#12151C] rounded-xl border border-gray-200 dark:border-white/[0.06] p-6 space-y-4">
      {header && <Skeleton className="h-5 w-40" />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-[#12151C] rounded-xl border border-gray-200 dark:border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/[0.06]">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-1/3' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full dashboard-shaped placeholder: stat row + two-column panels. */
export function DashboardSkeleton({ statCards = 4, children }: { statCards?: number; children?: ReactNode }) {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: statCards }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {children ?? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PanelSkeleton lines={3} />
            <TableSkeleton rows={5} />
          </div>
          <div className="space-y-6">
            <PanelSkeleton lines={3} />
            <PanelSkeleton lines={4} />
          </div>
        </div>
      )}
    </div>
  );
}
