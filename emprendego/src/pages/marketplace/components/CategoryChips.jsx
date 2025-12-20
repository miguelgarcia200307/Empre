import { memo, useRef, useEffect } from 'react'

/**
 * Chips de categorías rápidas
 * Fila horizontal scrolleable con snap
 */
function CategoryChips({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) {
  const scrollRef = useRef(null)

  // Mostrar máximo 12 categorías más populares
  const displayCategories = categories.slice(0, 12)

  if (displayCategories.length === 0) return null

  const handleSelect = (category) => {
    if (selectedCategory === category) {
      onSelectCategory('')
    } else {
      onSelectCategory(category)
      // Scroll al grid de tiendas
      document.getElementById('stores-grid')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory scroll-pl-4 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {/* Chip "Todas" */}
        <button
          onClick={() => onSelectCategory('')}
          className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          Todas
        </button>

        {displayCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleSelect(category)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gradiente de fade al final (indicador de scroll) */}
      <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden" />
    </div>
  )
}

export default memo(CategoryChips)
