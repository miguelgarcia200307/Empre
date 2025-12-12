import { useRef, useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  accept = 'image/*',
  maxSize = 5, // MB
  aspectRatio,
  className = '',
  placeholder = 'Arrastra una imagen o haz clic',
  loading = false,
}) => {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [localPreview, setLocalPreview] = useState(null)

  // Limpiar preview local cuando se obtiene URL real o se elimina
  useEffect(() => {
    if (value && typeof value === 'string' && value.startsWith('http')) {
      setLocalPreview(null)
    }
  }, [value])

  const handleFile = (file) => {
    setError(null)
    
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo es muy grande (máx. ${maxSize}MB)`)
      return
    }
    
    // Crear preview local temporal
    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)
    
    onChange(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setLocalPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  // Mostrar: URL de Supabase (http) O preview local temporal
  const preview = (value && typeof value === 'string' && value.startsWith('http')) 
    ? value 
    : localPreview

  const aspectStyles = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
  }

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer
          transition-all duration-200
          ${aspectRatio ? aspectStyles[aspectRatio] : 'min-h-[200px]'}
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
          ${preview ? 'border-solid border-gray-200' : ''}
          ${loading ? 'pointer-events-none opacity-70' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
        
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-50">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Subiendo imagen...</p>
          </div>
        ) : preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = ''; e.target.onerror = null }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              {isDragging ? (
                <Upload className="w-6 h-6 text-blue-500" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 text-center">{placeholder}</p>
            <p className="text-xs text-gray-400 mt-1">Máx. {maxSize}MB</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default ImageUpload
