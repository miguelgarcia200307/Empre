import { memo } from 'react'
import { Skeleton } from '../../../components/ui'

/**
 * Skeleton de card de tienda
 * Replica exactamente el layout real para evitar layout shift
 */
function StoreCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="flex items-center gap-4 p-4">
          {/* Logo skeleton */}
          <div className="w-14 h-14 rounded-xl bg-slate-200" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-1/3 bg-slate-100 rounded" />
          </div>

          {/* Badge + arrow */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="w-5 h-5 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  // Grid view skeleton
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      {/* Banner skeleton */}
      <div className="h-28 md:h-32 bg-slate-200 relative">
        {/* Logo skeleton */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-xl border-4 border-white bg-slate-300" />
        </div>
      </div>

      {/* Info skeleton */}
      <div className="pt-10 px-4 pb-4 space-y-3">
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-1/2 bg-slate-100 rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export default memo(StoreCardSkeleton)
