import Skeleton from '@/components/ui/Skeleton'

export default function UsuariosLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8" aria-busy="true">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-2xl border border-border bg-surface/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-10 w-52 max-w-2/5 rounded-xl" />
          </div>
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((fila) => (
              <div key={fila} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/60 p-6">
          <Skeleton className="h-10 w-48" />
          <div className="mt-6 space-y-5">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
