import { Search } from 'lucide-react'
import { INDUSTRIES } from '../../data/templates'

/**
 * TemplateFilters - Barra de búsqueda y filtros por industria
 */
const TemplateFilters = ({
  searchQuery,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar plantillas..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            placeholder-gray-400"
        />
      </div>

      {/* Industry chips */}
      <div className="flex flex-wrap gap-2">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.id}
            type="button"
            onClick={() => onIndustryChange(industry.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-colors duration-200
              ${selectedIndustry === industry.id
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
              }
              border
            `}
          >
            <span>{industry.icon}</span>
            <span>{industry.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TemplateFilters
