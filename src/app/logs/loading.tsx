import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function LogsLoading() {
  return (
    <PageLoading className="mx-auto max-w-7xl space-y-5">
      <div className="space-y-2 border-b border-border/80 pb-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="rounded-xl border border-border/80 bg-surface/90 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
        <div className="border-b border-border/70 px-5 py-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3 p-4 lg:hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <div className="hidden space-y-4 p-5 lg:block">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </PageLoading>
  )
}
