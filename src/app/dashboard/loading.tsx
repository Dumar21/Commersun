import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-xl border border-border/70 bg-surface/65 p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-1 h-3 w-28" />
              <div className="mt-2 flex min-h-7 items-end justify-between gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-8 w-18" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface/65 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-6 w-8 shrink-0" />
        </div>

        <section className="rounded-xl border border-border/70 bg-surface/65 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="ml-auto h-3 w-14" />
              <Skeleton className="ml-auto h-4 w-12" />
            </div>
          </div>
          <div className="relative mt-6 h-48 rounded-lg" aria-hidden="true">
            {[25, 50, 75].map((position) => (
              <span
                key={position}
                className="absolute inset-x-0 border-t border-dashed border-border/60"
                style={{ top: `${position}%` }}
              />
            ))}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path
                d="M0 80 C14 64 18 73 30 55 S48 40 58 58 S77 25 100 18"
                fill="none"
                stroke="var(--color-surface-2)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="mt-2 flex justify-between">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-3 w-8" />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-border/70 bg-surface/65">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="divide-y divide-border/50 px-3 sm:px-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 px-2.5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="ml-auto h-3 w-20" />
                  <Skeleton className="ml-auto h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border/70 bg-surface/65">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="space-y-4 p-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLoading>
  )
}
