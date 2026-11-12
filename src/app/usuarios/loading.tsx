import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function UsuariosLoading() {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-64 max-w-full" />
      </div>

      <section className="overflow-hidden rounded-xl border border-border/80 bg-surface/75">
        <div className="grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg sm:max-w-xs" />
          </div>
          <div className="p-4 sm:p-5">
            <div className="divide-y divide-border/70">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex flex-col gap-4 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24 rounded-md" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
          <div className="border-b border-border/70 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="mx-auto h-3 w-48 max-w-full" />
          </div>
        </aside>
      </div>
    </PageLoading>
  )
}
