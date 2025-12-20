import { memo } from 'react'
import { X, Search, MapPin, Tag, ArrowUpDown } from 'lucide-react'

/**
 * Chips de filtros activos
 * Muestra los filtros aplicados con opción de eliminar
 */
function FilterChips({
  searchQuery,
  selectedCity,
  selectedCategory,
  sortBy,
  onClearSearch,
  onClearCity,
  onClearCategory,
  onClearSort,
  onClearAll,
  showFavoritesOnly,
  onClearFavorites,
}) {
  const hasAnyFilter = searchQuery || selectedCity || selectedCategory || (sortBy && sortBy !== 'relevance') || showFavoritesOnly

  if (!hasAnyFilter) return null

  const getSortLabel = (value) => {
    const labels = {
      'relevance': 'Relevancia',
      'name-asc': 'A–Z',
      'name-desc': 'Z–A',
      'views': 'Más vistas',
      'plan': 'Por plan',
    }
    return labels[value] || value
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Búsqueda */}
      {searchQuery && (
        <Chip
          icon={<Search className="w-3.5 h-3.5" />}
          label={searchQuery}
          onRemove={onClearSearch}
          variant="blue"
        />
      )}

      {/* Ciudad */}
      {selectedCity && (
        <Chip
          icon={<MapPin className="w-3.5 h-3.5" />}
          label={selectedCity}
          onRemove={onClearCity}
          variant="purple"
        />
      )}

      {/* Categoría */}
      {selectedCategory && (
        <Chip
          icon={<Tag className="w-3.5 h-3.5" />}
          label={selectedCategory}
          onRemove={onClearCategory}
          variant="amber"
        />
      )}

      {/* Ordenamiento (solo si no es relevancia) */}
      {sortBy && sortBy !== 'relevance' && (
        <Chip
          icon={<ArrowUpDown className="w-3.5 h-3.5" />}
          label={getSortLabel(sortBy)}
          onRemove={onClearSort}
          variant="slate"
        />
      )}

      {/* Favoritos */}
      {showFavoritesOnly && (
        <Chip
          icon={<span className="text-rose-500">♥</span>}
          label="Favoritos"
          onRemove={onClearFavorites}
          variant="rose"
        />
      )}

      {/* Limpiar todo */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Limpiar todo
      </button>
    </div>
  )
}

/**
 * Componente Chip individual
 */
function Chip({ icon, label, onRemove, variant = 'slate' }) {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full text-sm font-medium transition-colors ${variants[variant]}`}
    >
      {icon}
      <span className="max-w-[150px] truncate">{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
        aria-label={`Eliminar filtro ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}

export default memo(FilterChips)
