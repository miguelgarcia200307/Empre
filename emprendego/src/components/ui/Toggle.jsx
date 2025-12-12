const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: {
      track: 'w-8 h-5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex flex-shrink-0 ${track} rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-500/20
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block ${thumb} rounded-full bg-white shadow-sm
            transform transition-transform duration-200 ease-in-out
            ${checked ? translate : 'translate-x-0.5'}
            mt-0.5
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-gray-900">{label}</span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 mt-0.5">{description}</span>
          )}
        </div>
      )}
    </label>
  )
}

export default Toggle
