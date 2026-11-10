import Skeleton from '@/components/ui/Skeleton'

export default function ProductosLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-9 w-64" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-11 w-72 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      <div className="card space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="card overflow-hidden p-0 border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-white/[0.02]">
                <th className="px-6 py-4"><Skeleton className="h-3 w-24" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-20" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-20" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-16" /></th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
