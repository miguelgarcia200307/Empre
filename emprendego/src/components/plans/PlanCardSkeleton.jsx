import { Skeleton } from '../ui'

/**
 * Skeleton loader para tarjetas de plan
 * Usado durante la carga de planes desde Supabase
 */
const PlanCardSkeleton = ({ variant = 'public' }) => {
  const isPublic = variant === 'public'

  if (isPublic) {
    // Skeleton para Landing
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <Skeleton variant="text" className="w-20 h-6 mb-2" />
        <Skeleton variant="title" className="w-32 h-10 mb-4" />
        <Skeleton variant="text" className="w-full mb-6" />
        <div className="space-y-3 mb-6">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} variant="text" className="w-full" />
          ))}
        </div>
        <Skeleton variant="button" className="w-full" />
      </div>
    )
  }

  // Skeleton para Panel Emprendedor
  return (
    <div className="rounded-2xl border-2 border-gray-200 p-6 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="w-24 h-5 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <Skeleton className="w-28 h-8 mb-6" />
      <div className="space-y-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-full h-4" />
        ))}
      </div>
      <Skeleton className="w-full h-10 rounded-lg" />
    </div>
  )
}

export default PlanCardSkeleton
