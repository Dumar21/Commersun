import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function CajaLoading() {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-56" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <section key={item} className="card space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>

            <article className="rounded-xl border border-border/80 bg-surface-2/65 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-3 w-48 max-w-full" />
                  </div>
                  <div className="border-t border-border/70 pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="space-y-2">
                      {[1, 2].map((line) => (
                        <div key={line} className="flex items-center justify-between gap-3 border-b border-border/40 py-2">
                          <Skeleton className="h-4 w-32 max-w-[45%]" />
                          <Skeleton className="h-5 w-14 rounded-md" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Skeleton className="h-11 w-full md:w-40" />
              </div>
            </article>
          </section>
        ))}
      </div>
    </PageLoading>
  )
}
