import Skeleton from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton circle className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Ultimas Facturas Skeleton */}
        <div className="card p-0 overflow-hidden">
          <div className="border-b border-border/60 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton circle className="h-9 w-9" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <Skeleton circle className="h-10 w-10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solicitudes Skeleton */}
        <div className="card p-0 overflow-hidden">
          <div className="border-b border-border/60 px-6 py-5 flex items-center gap-3">
            <Skeleton circle className="h-9 w-9" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
