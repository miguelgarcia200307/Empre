import { memo } from 'react'
import { X } from 'lucide-react'
import { Select, Button, Drawer } from '../../../components/ui'

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'name-asc', label: 'A–Z' },
  { value: 'name-desc', label: 'Z–A' },
  { value: 'views', label: 'Más vistas' },
  { value: 'plan', label: 'Por plan' },
]

/**
 * Drawer de filtros para móvil
 * Bottom sheet style con todos los filtros
 */
function MobileFiltersDrawer({
  isOpen,
  onClose,
  // Filtros
  selectedCity,
  onCityChange,
  selectedCategory,
  onCategoryChange,
  cities = [],
  categories = [],
  // Ordenamiento
  sortBy,
  onSortChange,
  // Favoritos
  showFavoritesOnly,
  onFavoritesToggle,
  favoritesCount = 0,
  // Limpiar
  onClearFilters,
  hasActiveFilters,
}) {
  const handleApply = () => {
    onClose()
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros"
      description="Refina tu búsqueda"
      position="right"
      size="sm"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ciudad
            </label>
            <Select
              placeholder="Todas las ciudades"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              options={[
                { value: '', label: 'Todas las ciudades' },
                ...cities.map(city => ({ value: city, label: city }))
              ]}
              className="w-full"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoría
            </label>
            <Select
              placeholder="Todas las categorías"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              className="w-full"
            />
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ordenar por
            </label>
            <Select
              placeholder="Relevancia"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS}
              className="w-full"
            />
          </div>

          {/* Favoritos */}
          {favoritesCount > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Favoritos
              </label>
              <button
                onClick={onFavoritesToggle}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  showFavoritesOnly
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={showFavoritesOnly ? 'text-rose-500' : 'text-slate-400'}>♥</span>
                  Solo favoritos
                </span>
                <span className={`text-sm ${showFavoritesOnly ? 'text-rose-600' : 'text-slate-500'}`}>
                  ({favoritesCount})
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-6 mt-6 border-t border-slate-200 space-y-3">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="w-full text-slate-600"
              onClick={onClearFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApply}
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default memo(MobileFiltersDrawer)
