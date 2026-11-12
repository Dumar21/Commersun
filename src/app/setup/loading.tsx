import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

export default function SetupLoading() {
  return (
    <PageLoading className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="card w-full max-w-md space-y-5">
        <Skeleton className="h-8 w-64 max-w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        {[1, 2].map((field) => (
          <div key={field} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </PageLoading>
  )
}
