import Skeleton from '@/components/ui/Skeleton'

export default function ReportesLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="flex h-[calc(100dvh-15rem)] min-h-[460px] flex-col justify-end gap-6 rounded-2xl border border-border/60 bg-surface/40 p-5">
        <div className="flex items-start gap-3">
          <Skeleton circle className="h-8 w-8 shrink-0" />
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
        </div>
        <div className="h-14 w-full rounded-[28px] border border-border/60 p-3">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
