import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function ProductosLoading() {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-64 max-w-full" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-11 w-full rounded-lg sm:w-72" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
        </div>
      </div>

      <section className="card flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="max-h-64 space-y-2 overflow-hidden">
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-surface-2/60 text-left">
                <th className="px-5 py-3.5"><Skeleton className="h-3 w-20" /></th>
                <th className="px-5 py-3.5"><Skeleton className="h-3 w-20" /></th>
                <th className="px-5 py-3.5"><Skeleton className="h-3 w-20" /></th>
                <th className="px-5 py-3.5"><Skeleton className="h-3 w-20" /></th>
                <th className="px-5 py-3.5"><Skeleton className="h-3 w-16" /></th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/35">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="ml-auto h-11 w-16 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLoading>
  )
}
