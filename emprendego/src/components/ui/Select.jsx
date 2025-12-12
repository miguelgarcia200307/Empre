import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-xl border bg-white text-gray-900 
    transition-all duration-200 appearance-none cursor-pointer
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
      <div className="relative">
        <select
          ref={ref}
          className={`${baseStyles} ${stateStyles} pr-10 ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
