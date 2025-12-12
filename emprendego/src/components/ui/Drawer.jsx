import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Drawer = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md', // sm, md, lg, xl, full
  position = 'right', // left, right
}) => {
  const drawerRef = useRef(null)

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }

  const positionClasses = {
    left: {
      container: 'left-0',
      transform: isOpen ? 'translate-x-0' : '-translate-x-full',
    },
    right: {
      container: 'right-0',
      transform: isOpen ? 'translate-x-0' : 'translate-x-full',
    },
  }

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`
          absolute top-0 h-full w-full ${sizeClasses[size]}
          ${positionClasses[position].container}
          transform ${positionClasses[position].transform}
          transition-transform duration-300 ease-out
        `}
      >
        <div className="h-full bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {description && (
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Drawer
