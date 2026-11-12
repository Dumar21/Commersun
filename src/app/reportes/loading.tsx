import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function ReportesLoading() {
  return (
    <PageLoading className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="flex h-[calc(100dvh-15.5rem)] min-h-0 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-6 w-72 max-w-full" />
              <Skeleton className="mx-auto h-4 w-64 max-w-full" />
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="min-h-20 rounded-lg border border-border/80 bg-surface-2/40 px-4 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3">
          <div className="relative rounded-xl border border-border bg-surface-2/70 p-1.5">
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="mx-auto mt-2 h-3 w-40" />
        </div>
      </div>
    </PageLoading>
  )
}
