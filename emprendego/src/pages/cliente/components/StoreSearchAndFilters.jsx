import { memo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { withAlpha } from './themeUtils'

/**
 * StoreSearchAndFilters - Premium search and category filter component
 * Features: Large search input, horizontal scroll chips on mobile, product counter
 */
const StoreSearchAndFilters = memo(function StoreSearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  productCount,
  primaryColor,
  theme,
}) {
  return (
    <div className="space-y-4">
      {/* Búsqueda premium */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-50/50 rounded-2xl group-focus-within:from-transparent group-focus-within:to-transparent transition-all duration-200" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors z-10" />
        <input
          type="text"
          placeholder="¿Qué estás buscando hoy?"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="relative w-full pl-12 pr-12 h-12 sm:h-14 bg-white border border-gray-200 rounded-2xl 
                     focus:outline-none focus:ring-2 focus:border-transparent 
                     shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200
                     text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
          style={{ '--tw-ring-color': withAlpha(primaryColor, 0.3) }}
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 z-10 hidden sm:block">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Filtro por categorías - Premium pills con scroll horizontal */}
      {categories.length > 0 && (
        <div className="relative">
          {/* Gradient fade edges for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[var(--eg-bg)] to-transparent z-10 pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--eg-bg)] to-transparent z-10 pointer-events-none sm:hidden" />
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth snap-x snap-mandatory sm:snap-none sm:flex-wrap">
            {/* Chip "Todos" */}
            <CategoryChip
              label="Todos"
              isSelected={selectedCategory === 'all'}
              onClick={() => onCategoryChange('all')}
              primaryColor={primaryColor}
            />
            
            {/* Category chips */}
            {categories.map(category => (
              <CategoryChip
                key={category.id}
                label={category.name}
                isSelected={selectedCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contador de resultados - Premium */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-500">
          {productCount === 0 ? (
            <span className="text-gray-400">Sin resultados</span>
          ) : productCount === 1 ? (
            <span>
              <span className="font-semibold text-gray-700">1</span> producto
            </span>
          ) : (
            <span>
              <span className="font-semibold text-gray-700">{productCount}</span> productos
            </span>
          )}
          {searchQuery && (
            <span className="text-gray-400 ml-1">
              para "<span className="text-gray-600">{searchQuery}</span>"
            </span>
          )}
        </p>
        
        {/* Sort dropdown - placeholder for future feature */}
        {/* <button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          Ordenar
        </button> */}
      </div>
    </div>
  )
})

/**
 * CategoryChip - Individual category filter chip
 */
const CategoryChip = memo(function CategoryChip({
  label,
  isSelected,
  onClick,
  primaryColor,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 snap-start px-4 py-2.5 rounded-full text-sm font-medium
        transition-all duration-200 whitespace-nowrap
        ${isSelected
          ? 'text-white shadow-lg scale-[1.02] ring-2 ring-white/50'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]'
        }
      `}
      style={isSelected ? { 
        backgroundColor: primaryColor,
        boxShadow: `0 4px 14px ${withAlpha(primaryColor, 0.4)}`
      } : {}}
    >
      {label}
    </button>
  )
})

export default StoreSearchAndFilters
