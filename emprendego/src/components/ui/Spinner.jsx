const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="none" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
    </div>
  )
}

// Spinner de página completa
Spinner.Page = ({ text = 'Cargando...' }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
    <Spinner size="lg" className="text-blue-600" />
    <p className="mt-4 text-gray-600">{text}</p>
  </div>
)

// Spinner inline
Spinner.Inline = ({ text, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Spinner size="sm" className="text-blue-600" />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
)

export default Spinner
