import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function NuevaFacturaSkeleton({ editing = false }: { editing?: boolean }) {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-6">
      <div className="card flex flex-col gap-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            {editing ? (
              <div className="rounded-xl border border-border/70 bg-surface-2/55 p-3 sm:p-4">
                <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 sm:gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-11 rounded-lg" />
                </div>
                <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 border-t border-border/70 pt-3 md:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4">
                  <Skeleton className="h-11 w-24 rounded-lg" />
                  <div className="space-y-1 text-right md:text-left">
                    <Skeleton className="ml-auto h-3 w-20 md:ml-0" />
                    <Skeleton className="ml-auto h-4 w-24 md:ml-0" />
                  </div>
                  <Skeleton className="h-11 w-28 rounded-lg" />
                  <div className="space-y-1 text-right">
                    <Skeleton className="ml-auto h-3 w-12" />
                    <Skeleton className="ml-auto h-4 w-20" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface-2/50 p-8">
                <Skeleton className="mx-auto h-4 w-56 max-w-full" />
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-surface-2/70 p-5">
            <Skeleton className="h-4 w-20" />
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-9 w-36" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
      </div>
    </PageLoading>
  )
}
