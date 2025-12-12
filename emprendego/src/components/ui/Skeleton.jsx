const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'rounded-full',
    card: 'rounded-xl',
    button: 'h-10 rounded-lg',
    image: 'rounded-lg',
  }

  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeletons
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" className="w-1/2" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </div>
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-5/6" />
  </div>
)

const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    {/* Header */}
    <div className="grid gap-4 p-4 bg-slate-50 border-b border-slate-200" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-4" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4 p-4 border-b border-slate-100 last:border-0"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
)

const SkeletonStats = ({ count = 4 }) => (
  <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${count}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-24" />
          <Skeleton variant="avatar" width={40} height={40} />
        </div>
        <Skeleton variant="title" className="w-20 h-8" />
        <Skeleton variant="text" className="w-32" />
      </div>
    ))}
  </div>
)

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonStats }
export default Skeleton
