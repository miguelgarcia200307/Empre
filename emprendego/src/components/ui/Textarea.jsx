import { forwardRef } from 'react'

const Textarea = forwardRef(({
  label,
  error,
  hint,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl border bg-white text-gray-900 
    placeholder-gray-400 transition-all duration-200 resize-none
    focus:outline-none focus:ring-4
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `
  
  const stateStyles = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
