import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, ChevronDown, Check, AlertCircle, X } from 'lucide-react'
import { CO_CITIES, searchCities, findOfficialCity, normalizeText } from '../../data/colombiaCities'

/**
 * CitySelect - Componente de autocompletado para ciudades de Colombia
 * 
 * @param {Object} props
 * @param {string} props.value - Ciudad seleccionada
 * @param {function} props.onChange - Callback cuando se selecciona una ciudad
 * @param {boolean} props.disabled - Deshabilitar el componente
 * @param {string} props.error - Mensaje de error externo
 * @param {string} props.placeholder - Placeholder del input
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.hint - Texto de ayuda
 */
const CitySelect = ({
  value = '',
  onChange,
  disabled = false,
  error: externalError,
  placeholder = 'Buscar ciudad...',
  label,
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Verificar si el valor actual es una ciudad oficial
  const officialCity = findOfficialCity(value)
  const isNonStandard = value && !officialCity

  // Ciudades filtradas según búsqueda
  const filteredCities = searchCities(searchTerm, 15)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll al elemento resaltado
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex]
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Reset highlight cuando cambia la búsqueda
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  const handleSelect = useCallback((city) => {
    onChange(city)
    setIsOpen(false)
    setSearchTerm('')
    setTouched(true)
    inputRef.current?.blur()
  }, [onChange])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    if (!isOpen) setIsOpen(true)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCities[highlightedIndex]) {
          handleSelect(filteredCities[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        break
      case 'Tab':
        setIsOpen(false)
        setSearchTerm('')
        break
      default:
        break
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
    setTouched(true)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  // Determinar mensaje de error
  const displayError = externalError || (touched && isNonStandard 
    ? 'Selecciona una ciudad de la lista' 
    : null)

  // Estilos base que coinciden con Input.jsx del proyecto
  const baseInputStyles = `
    w-full px-4 py-3 pl-12 pr-10 rounded-xl border bg-white text-gray-900 
    placeholder-gray-400 transition-all duration-200
    focus:outline-none focus:ring-4
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `
  
  const stateStyles = displayError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
    : isNonStandard
    ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/10'
    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'

  return (
    <div className="relative" ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (value || '')}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder={value || placeholder}
          className={`${baseInputStyles} ${stateStyles}`}
          autoComplete="off"
        />

        {/* Right icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Non-standard city warning */}
      {isNonStandard && !isOpen && (
        <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 font-medium">Ciudad no estandarizada: "{value}"</p>
            <p className="text-amber-600">Selecciona una ciudad de la lista para mantener los datos consistentes.</p>
          </div>
        </div>
      )}

      {/* Dropdown list */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          ref={listRef}
        >
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => {
              const isSelected = city === value || city === officialCity
              const isHighlighted = index === highlightedIndex
              
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-4 py-3 text-left flex items-center justify-between
                    transition-colors duration-100
                    ${isHighlighted ? 'bg-blue-50' : ''}
                    ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-900'}
                    hover:bg-blue-50
                    first:rounded-t-xl last:rounded-b-xl
                  `}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {highlightSearchTerm(city, searchTerm)}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              )
            })
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron ciudades</p>
              <p className="text-sm mt-1">Intenta con otro término</p>
            </div>
          )}
        </div>
      )}

      {/* Hint text */}
      {hint && !displayError && !isNonStandard && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}

      {/* Error message */}
      {displayError && (
        <p className="mt-1.5 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  )
}

/**
 * Resalta el término de búsqueda dentro del texto
 */
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text

  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedSearch = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  const index = normalizedText.indexOf(normalizedSearch)
  
  if (index === -1) return text

  // Encontrar la posición en el texto original
  const before = text.slice(0, index)
  const match = text.slice(index, index + searchTerm.length)
  const after = text.slice(index + searchTerm.length)

  return (
    <>
      {before}
      <span className="font-semibold text-blue-600">{match}</span>
      {after}
    </>
  )
}

export default CitySelect
