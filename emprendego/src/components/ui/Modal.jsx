import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] sm:max-w-[90vw]',
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showClose = true,
  children,
  footer,
  className = '',
  fullHeight = false, // Prop para modales con scroll interno (header/footer sticky)
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Clases base para el contenedor del modal
  const modalContainerClasses = fullHeight
    ? 'max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden'
    : 'max-h-[92vh] overflow-y-auto'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-scale-in
          ${modalContainerClasses}
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header - siempre sticky cuando fullHeight */}
        {(title || showClose) && (
          <div className={`
            flex items-start justify-between gap-4 px-4 sm:px-6 py-4
            ${fullHeight ? 'shrink-0 border-b border-gray-100 bg-white sticky top-0 z-10' : ''}
          `}>
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-2 -m-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={`
          px-4 sm:px-6 
          ${fullHeight ? 'flex-1 overflow-y-auto min-h-0 py-4' : 'py-4'}
          ${!title && !showClose ? 'pt-6' : ''}
        `}>
          {children}
        </div>
        
        {/* Footer - siempre sticky cuando fullHeight */}
        {footer && (
          <div className={`
            flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 
            px-4 sm:px-6 py-4
            ${fullHeight ? 'shrink-0 border-t border-gray-100 bg-white sticky bottom-0 z-10' : 'pt-2'}
          `}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para confirmaciones
Modal.Confirm = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading} className="w-full sm:w-auto">
          {confirmText}
        </Button>
      </>
    }
  />
)

export default Modal
