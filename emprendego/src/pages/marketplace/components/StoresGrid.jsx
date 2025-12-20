import { memo } from 'react'
import { Search, AlertCircle, Store as StoreIcon } from 'lucide-react'
import { Pagination, EmptyState } from '../../../components/ui'
import StoreCard from './StoreCard'
import StoreCardSkeleton from './StoreCardSkeleton'

/**
 * Grid de tiendas - Diseño premium
 * Soporta vista grid y list con skeletons, empty states y paginación
 */
function StoresGrid({
  stores = [],
  loading = false,
  error = null,
  onRetry,
  // Vista
  viewMode = 'grid',
  // Paginación
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  // Favoritos
  favorites = [],
  onToggleFavorite,
  // Filtros
  hasActiveFilters = false,
  onClearFilters,
  // Header
  showHeader = true,
  title = 'Todas las tiendas',
  subtitle,
}) {
  // Estado de carga
  if (loading) {
    return (
      <section id="stores-grid" aria-busy="true" aria-label="Cargando tiendas">
        {showHeader && (
          <div className="mb-6">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
        )}
        <div className={
          viewMode === 'list'
            ? 'space-y-3'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <StoreCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      </section>
    )
  }

  // Estado de error
  if (error) {
    return (
      <section id="stores-grid" className="py-12">
        <EmptyState
          icon={AlertCircle}
          title="Error al cargar"
          description={error}
          action={onRetry}
          actionLabel="Reintentar"
        />
      </section>
    )
  }

  // Estado vacío
  if (stores.length === 0) {
    return (
      <section id="stores-grid" className="py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No encontramos resultados
          </h3>
          <p className="text-slate-500 mb-6">
            {hasActiveFilters
              ? 'Prueba con otros términos de búsqueda o ajusta los filtros'
              : 'Aún no hay tiendas disponibles en el marketplace'
            }
          </p>
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>
    )
  }

  // Estado con resultados
  return (
    <section id="stores-grid" aria-label={title}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Grid/List */}
      <div className={
        viewMode === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
      }>
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            viewMode={viewMode}
            isFavorite={favorites.includes(store.id)}
            onToggleFavorite={() => onToggleFavorite?.(store.id)}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  )
}

export default memo(StoresGrid)
