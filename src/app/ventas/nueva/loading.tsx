import Skeleton from '@/components/ui/Skeleton'

export default function NuevaFacturaLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/80 p-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface-2/80 p-5 space-y-4">
            <Skeleton className="h-3 w-20" />
            <div className="rounded-xl border border-border bg-background/60 p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
