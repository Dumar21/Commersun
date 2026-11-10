import Skeleton from '@/components/ui/Skeleton'

export default function SetupLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10" aria-busy="true">
      <div className="card w-full max-w-md space-y-5 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
