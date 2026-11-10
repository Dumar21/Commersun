import Skeleton from '@/components/ui/Skeleton'

export default function VentasLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <div className="card overflow-hidden p-0 border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-white/[0.02] text-left">
                <th className="px-6 py-4"><Skeleton className="h-3 w-24" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-24" /></th>
                <th className="px-6 py-4"><Skeleton className="h-3 w-28" /></th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-lg" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
