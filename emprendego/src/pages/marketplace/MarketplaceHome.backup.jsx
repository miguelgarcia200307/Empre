import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import BrandLogo from '../../components/BrandLogo'
import {
  Button,
  Select,
  Card,
  EmptyState,
  Pagination,
  Skeleton,
} from '../../components/ui'
import {
  Store,
  Search,
  X,
  MapPin,
  Star,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'

// ============================================
// CONSTANTES Y HELPERS
// ============================================

const ITEMS_PER_PAGE = 12

// Mapeo de colores por plan (similar a AdminMarketplace.jsx)
const planColors = {
  gratis: 'bg-slate-100 text-slate-700',
  basico: 'bg-blue-100 text-blue-700',
  emprendedor: 'bg-purple-100 text-purple-700',
  pro: 'bg-amber-100 text-amber-700',
}

const planLabels = {
  gratis: 'Gratis',
  basico: 'Básico',
  emprendedor: 'Emprendedor',
  pro: 'Pro',
}

// Prioridad de planes para ordenamiento
const planPriority = {
  pro: 1,
  emprendedor: 2,
  basico: 3,
  gratis: 4,
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MarketplaceHome() {
  const navigate = useNavigate()

  // Estados principales
  const [stores, setStores] = useState([])
  const [featuredStores, setFeaturedStores] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true)

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCity, selectedCategory])

  // ============================================
  // CARGA DE DATOS
  // ============================================

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Verificar configuración del marketplace
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value_json')
        .eq('key', 'marketplace')
        .single()

      if (settingsData?.value_json?.enabled === false) {
        setMarketplaceEnabled(false)
        setLoading(false)
        return
      }

      // 2. Obtener tiendas activas y visibles
      let storesQuery = supabase
        .from('stores')
        .select('id, name, slug, logo_url, banner_url, city, plan, total_views, is_active, marketplace_hidden, moderation_status')
        .eq('is_active', true)

      const { data: storesData, error: storesError } = await storesQuery

      if (storesError) throw storesError

      // Filtrar tiendas visibles (marketplace_hidden = false o null, moderation_status = approved o null)
      const visibleStores = (storesData || []).filter(store => {
        const isNotHidden = store.marketplace_hidden !== true
        const isApproved = !store.moderation_status || store.moderation_status === 'approved'
        return isNotHidden && isApproved
      })

      // Ordenar por plan (pro primero) y luego por total_views
      visibleStores.sort((a, b) => {
        const priorityDiff = (planPriority[a.plan] || 4) - (planPriority[b.plan] || 4)
        if (priorityDiff !== 0) return priorityDiff
        return (b.total_views || 0) - (a.total_views || 0)
      })

      setStores(visibleStores)

      // 3. Obtener ciudades únicas para filtro
      const uniqueCities = [...new Set(visibleStores.map(s => s.city).filter(Boolean))].sort()
      setCities(uniqueCities)

      // 4. Obtener categorías de las tiendas visibles
      if (visibleStores.length > 0) {
        const storeIds = visibleStores.map(s => s.id)
        
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('name, store_id')
          .eq('is_active', true)
          .in('store_id', storeIds)

        // Crear set único de nombres de categorías
        const uniqueCategories = [...new Set((categoriesData || []).map(c => c.name))].sort()
        setCategories(uniqueCategories)
      }

      // 5. Obtener tiendas destacadas
      const { data: featuredData } = await supabase
        .from('marketplace_featured')
        .select(`
          *,
          stores (
            id,
            name,
            slug,
            logo_url,
            banner_url,
            city,
            plan,
            total_views,
            is_active,
            marketplace_hidden,
            moderation_status
          )
        `)
        .order('sort_order', { ascending: true })

      // Filtrar destacadas que cumplan los criterios de visibilidad
      const visibleFeatured = (featuredData || []).filter(f => {
        const store = f.stores
        if (!store) return false
        const isActive = store.is_active === true
        const isNotHidden = store.marketplace_hidden !== true
        const isApproved = !store.moderation_status || store.moderation_status === 'approved'
        return isActive && isNotHidden && isApproved
      })

      setFeaturedStores(visibleFeatured)

    } catch (err) {
      console.error('Error fetching marketplace data:', err)
      setError('No se pudo cargar el marketplace. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ============================================
  // BÚSQUEDA Y FILTRADO
  // ============================================

  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Búsqueda por productos y categorías
  useEffect(() => {
    const searchProductsAndCategories = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults(null)
        return
      }

      setSearchLoading(true)
      const searchTerm = debouncedSearch.toLowerCase()
      const matchingStoreIds = new Set()

      try {
        // Tiendas que coinciden por nombre o slug
        stores.forEach(store => {
          if (
            store.name?.toLowerCase().includes(searchTerm) ||
            store.slug?.toLowerCase().includes(searchTerm)
          ) {
            matchingStoreIds.add(store.id)
          }
        })

        // Buscar en productos
        const { data: productsData } = await supabase
          .from('products')
          .select('store_id')
          .eq('is_active', true)
          .or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)

        productsData?.forEach(p => matchingStoreIds.add(p.store_id))

        // Buscar en categorías
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('store_id')
          .eq('is_active', true)
          .ilike('name', `%${debouncedSearch}%`)

        categoriesData?.forEach(c => matchingStoreIds.add(c.store_id))

        setSearchResults(matchingStoreIds)
      } catch (err) {
        console.error('Error searching:', err)
      } finally {
        setSearchLoading(false)
      }
    }

    searchProductsAndCategories()
  }, [debouncedSearch, stores])

  // Filtrar tiendas
  const filteredStores = useMemo(() => {
    let result = [...stores]

    // Filtro por búsqueda
    if (searchResults !== null) {
      result = result.filter(store => searchResults.has(store.id))
    }

    // Filtro por ciudad
    if (selectedCity) {
      result = result.filter(store => store.city === selectedCity)
    }

    // Filtro por categoría (necesita buscar en categorías de la tienda)
    // Este filtro se aplica solo si hay una categoría seleccionada
    // Se manejará de forma asíncrona

    return result
  }, [stores, searchResults, selectedCity])

  // Filtro por categoría asíncrono
  const [categoryFilteredStores, setCategoryFilteredStores] = useState(null)

  useEffect(() => {
    const filterByCategory = async () => {
      if (!selectedCategory) {
        setCategoryFilteredStores(null)
        return
      }

      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('store_id')
          .eq('is_active', true)
          .eq('name', selectedCategory)

        const storeIdsWithCategory = new Set(categoriesData?.map(c => c.store_id) || [])
        setCategoryFilteredStores(storeIdsWithCategory)
      } catch (err) {
        console.error('Error filtering by category:', err)
        setCategoryFilteredStores(null)
      }
    }

    filterByCategory()
  }, [selectedCategory])

  // Combinar filtros
  const finalFilteredStores = useMemo(() => {
    let result = filteredStores

    if (categoryFilteredStores !== null) {
      result = result.filter(store => categoryFilteredStores.has(store.id))
    }

    return result
  }, [filteredStores, categoryFilteredStores])

  // Paginación
  const totalPages = Math.ceil(finalFilteredStores.length / ITEMS_PER_PAGE)
  const paginatedStores = finalFilteredStores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Verificar si hay filtros activos
  const hasActiveFilters = searchQuery || selectedCity || selectedCategory

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity('')
    setSelectedCategory('')
    setCurrentPage(1)
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  // Marketplace deshabilitado
  if (!loading && !marketplaceEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Marketplace no disponible
          </h1>
          <p className="text-slate-500 mb-6">
            El marketplace está temporalmente deshabilitado. Por favor, vuelve más tarde.
          </p>
          <Button onClick={() => navigate('/auth/login')}>
            Ingresar a mi cuenta
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============================================ */}
      {/* HEADER SIMPLE */}
      {/* ============================================ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Volver */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Volver</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <BrandLogo size="md" linkToHome />
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth/login')}
              >
                Ingresar
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/auth/registro')}
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Marketplace
          </h1>
          <p className="text-slate-600">
            Explora {stores.length} tiendas activas y encuentra lo que buscas
          </p>
        </div>

        {/* ============================================ */}
        {/* BUSCADOR Y FILTROS */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Input búsqueda */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Busca un producto, categoría o tienda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Select ciudad */}
            <Select
              placeholder="Todas las ciudades"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { value: '', label: 'Todas las ciudades' },
                ...cities.map(city => ({ value: city, label: city }))
              ]}
            />

            {/* Select categoría */}
            <Select
              placeholder="Todas las categorías"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
          </div>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                {finalFilteredStores.length} resultado{finalFilteredStores.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* TIENDAS DESTACADAS */}
        {/* ============================================ */}
        {!loading && featuredStores.length > 0 && !hasActiveFilters && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tiendas destacadas</h2>
                <p className="text-sm text-slate-600">Las mejores seleccionadas para ti</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredStores.map((featured) => (
                <StoreCard 
                  key={featured.id} 
                  store={featured.stores} 
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* GRID DE TIENDAS */}
        {/* ============================================ */}
        <div>
          {!hasActiveFilters && featuredStores.length > 0 && (
            <h2 className="text-xl font-bold text-slate-900 mb-6">Todas las tiendas</h2>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <StoreCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={AlertCircle}
              title="Error al cargar"
              description={error}
              action={fetchData}
              actionLabel="Reintentar"
            />
          ) : paginatedStores.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No encontramos resultados"
              description={
                hasActiveFilters
                  ? "Prueba con otros términos de búsqueda o ajusta los filtros"
                  : "Aún no hay tiendas disponibles"
              }
              action={hasActiveFilters ? clearFilters : undefined}
              actionLabel={hasActiveFilters ? "Limpiar filtros" : undefined}
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedStores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={finalFilteredStores.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ============================================ */}
      {/* FOOTER SIMPLE */}
      {/* ============================================ */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BrandLogo size="sm" />
              <span className="text-sm text-slate-500">
                © {new Date().getFullYear()} EmprendeGo
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link to="/" className="hover:text-slate-900 transition-colors">
                Inicio
              </Link>
              <Link to="/auth/registro" className="hover:text-slate-900 transition-colors">
                Crear tienda
              </Link>
              <Link to="/auth/login" className="hover:text-slate-900 transition-colors">
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

// Card de tienda
function StoreCard({ store, featured = false }) {
  const navigate = useNavigate()

  if (!store) return null

  return (
    <Card
      hover
      onClick={() => navigate(`/tienda/${store.slug}`)}
      className={`overflow-hidden ${featured ? 'ring-2 ring-amber-400' : ''}`}
      padding="none"
    >
      {/* Banner / Cover */}
      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
        {store.banner_url ? (
          <img 
            src={store.banner_url} 
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
        )}
        
        {/* Badge destacado */}
        {featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Destacada
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-8 left-4">
          {store.logo_url ? (
            <img 
              src={store.logo_url} 
              alt={store.name}
              className="w-16 h-16 rounded-xl border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">
                {store.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-10 px-4 pb-4">
        <h3 className="font-semibold text-slate-900 mb-1 truncate">{store.name}</h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          {store.city && (
            <>
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{store.city}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${planColors[store.plan] || planColors.gratis}`}>
            {planLabels[store.plan] || 'Gratis'}
          </span>
          <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
            Ver tienda
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Card>
  )
}

// Skeleton de card de tienda
function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="pt-10 px-4 pb-4 relative">
        <div className="absolute -top-8 left-4">
          <Skeleton variant="avatar" width={64} height={64} className="rounded-xl" />
        </div>
        <Skeleton variant="title" className="w-2/3 mb-2" />
        <Skeleton variant="text" className="w-1/2 mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-5" />
        </div>
      </div>
    </div>
  )
}
