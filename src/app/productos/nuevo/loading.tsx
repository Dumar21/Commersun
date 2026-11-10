import Skeleton from '@/components/ui/Skeleton'

export default function FormularioProductoLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="card space-y-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
