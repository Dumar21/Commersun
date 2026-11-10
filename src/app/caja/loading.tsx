import Skeleton from '@/components/ui/Skeleton'

export default function CajaLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-9 w-56" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-44" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="space-y-4">
              {[1, 2].map((j) => (
                <div key={j} className="rounded-2xl border border-border bg-surface-2/90 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
