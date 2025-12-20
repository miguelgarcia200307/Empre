import { memo } from 'react'
import { Search, X, SlidersHorizontal, LayoutGrid, List } from 'lucide-react'
import { Select } from '../../../components/ui'

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'name-asc', label: 'A–Z' },
  { value: 'name-desc', label: 'Z–A' },
  { value: 'views', label: 'Más vistas' },
  { value: 'plan', label: 'Por plan' },
]

/**
 * Barra de filtros del Marketplace - Diseño SaaS premium
 * Desktop: todos los filtros visibles
 * Mobile: solo búsqueda + botón "Filtros" que abre drawer
 */
function MarketplaceFiltersBar({
  // Búsqueda
  searchQuery,
  onSearchChange,
  searchLoading,
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
  // Vista
  viewMode = 'grid',
  onViewModeChange,
  // Favoritos
  showFavoritesOnly = false,
  onFavoritesToggle,
  favoritesCount = 0,
  // Contadores
  activeFiltersCount = 0,
  // Mobile
  onOpenMobileFilters,
  // Resultados
  resultsCount = 0,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Barra principal */}
      <div className="p-4 md:p-5">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
          {/* Input búsqueda - 5 cols */}
          <div className="col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tiendas, productos o categorías..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              aria-label="Buscar"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Select ciudad - 2 cols */}
          <div className="col-span-2">
            <Select
              placeholder="Ciudad"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              options={[
                { value: '', label: 'Todas las ciudades' },
                ...cities.map(city => ({ value: city, label: city }))
              ]}
              className="w-full"
            />
          </div>

          {/* Select categoría - 2 cols */}
          <div className="col-span-2">
            <Select
              placeholder="Categoría"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              className="w-full"
            />
          </div>

          {/* Select ordenar - 2 cols */}
          <div className="col-span-2">
            <Select
              placeholder="Ordenar"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS}
              className="w-full"
            />
          </div>

          {/* Toggle vista - 1 col */}
          <div className="col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              aria-label="Vista en cuadrícula"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              aria-label="Vista en lista"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden gap-3">
          {/* Input búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              aria-label="Buscar"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Botón Filtros */}
          <button
            onClick={onOpenMobileFilters}
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Toggle vista móvil */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
              aria-label="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Favoritos toggle - sutil, debajo de filtros */}
      {favoritesCount > 0 && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
          <button
            onClick={onFavoritesToggle}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              showFavoritesOnly
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className={showFavoritesOnly ? 'text-rose-500' : 'text-slate-400'}>♥</span>
            {showFavoritesOnly ? 'Mostrando favoritos' : `Ver favoritos (${favoritesCount})`}
          </button>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="px-4 md:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {resultsCount === 0 ? (
            'Sin resultados'
          ) : resultsCount === 1 ? (
            <span><strong className="text-slate-700">1</strong> tienda encontrada</span>
          ) : (
            <span><strong className="text-slate-700">{resultsCount}</strong> tiendas encontradas</span>
          )}
        </p>
      </div>
    </div>
  )
}

export default memo(MarketplaceFiltersBar)
