const variants = {
  default: 'bg-white border border-gray-100 shadow-sm',
  elevated: 'bg-white shadow-lg border border-gray-100',
  flat: 'bg-gray-50 border border-gray-200',
  outlined: 'bg-white border-2 border-gray-200',
}

const Card = ({
  variant = 'default',
  padding = 'default',
  className = '',
  hover = false,
  onClick,
  children,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  const hoverStyles = hover || onClick
    ? 'transition-all duration-200 hover:shadow-md hover:border-gray-200 cursor-pointer'
    : ''

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = ({ className = '', children }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

Card.Title = ({ className = '', children }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

Card.Description = ({ className = '', children }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
)

Card.Content = ({ className = '', children }) => (
  <div className={className}>{children}</div>
)

Card.Footer = ({ className = '', children }) => (
  <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>{children}</div>
)

export default Card
