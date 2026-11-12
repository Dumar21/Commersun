import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function FormularioProductoLoading() {
  return (
    <PageLoading className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="card space-y-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((field) => (
                <div key={field} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-36 max-w-[50%]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-11 min-w-0 flex-1 rounded-lg" />
                <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="aspect-[3/2] w-full rounded-xl lg:aspect-square" />
          </div>
        </div>

        <div className="border-t border-border/60 pt-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </PageLoading>
  )
}
