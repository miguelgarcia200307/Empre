import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Button, Drawer } from '../../components/ui'
import { Store } from 'lucide-react'

// Componentes del Marketplace
import {
  MarketplaceHeader,
  MarketplaceHero,
  MarketplaceFiltersBar,
  FeaturedStoresSection,
  StoresGrid,
  MarketplaceCTA,
  MarketplaceFooter,
  CategoryChips,
  FilterChips,
  MobileFiltersDrawer,
} from './components'

// ============================================
// CONSTANTES
// ============================================

const ITEMS_PER_PAGE = 12
const FAVORITES_KEY = 'emprendego_favorites'

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

  // Estados nuevos de UI
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Favoritos (localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Persistir favoritos
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  // Toggle favorito
  const handleToggleFavorite = useCallback((storeId) => {
    setFavorites(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    )
  }, [])

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
  }, [selectedCity, selectedCategory, sortBy, showFavoritesOnly])

  // ============================================
  // CARGA DE DATOS (SIN CAMBIOS EN LÓGICA)
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
        .select('id, name, slug, logo_url, banner_url, city, plan, total_views, is_active, marketplace_hidden, moderation_status, created_at')
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
            moderation_status,
            created_at
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
  // BÚSQUEDA Y FILTRADO (SIN CAMBIOS EN LÓGICA)
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

  // Combinar filtros + ordenamiento frontend
  const finalFilteredStores = useMemo(() => {
    let result = filteredStores

    // Filtro por categoría
    if (categoryFilteredStores !== null) {
      result = result.filter(store => categoryFilteredStores.has(store.id))
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      result = result.filter(store => favorites.includes(store.id))
    }

    // Ordenamiento frontend
    switch (sortBy) {
      case 'name-asc':
        result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'name-desc':
        result = [...result].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'views':
        result = [...result].sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
        break
      case 'plan':
        result = [...result].sort((a, b) => (planPriority[a.plan] || 4) - (planPriority[b.plan] || 4))
        break
      // 'relevance' mantiene el orden original
    }

    return result
  }, [filteredStores, categoryFilteredStores, sortBy, showFavoritesOnly, favorites])

  // Paginación
  const totalPages = Math.ceil(finalFilteredStores.length / ITEMS_PER_PAGE)
  const paginatedStores = finalFilteredStores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Verificar si hay filtros activos
  const hasActiveFilters = searchQuery || selectedCity || selectedCategory || (sortBy !== 'relevance') || showFavoritesOnly
  const activeFiltersCount = [searchQuery, selectedCity, selectedCategory, sortBy !== 'relevance' && sortBy, showFavoritesOnly].filter(Boolean).length

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCity('')
    setSelectedCategory('')
    setSortBy('relevance')
    setShowFavoritesOnly(false)
    setCurrentPage(1)
  }, [])

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <MarketplaceHeader 
        onMobileMenuOpen={() => setMobileMenuOpen(true)} 
      />

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menú"
        position="right"
        size="sm"
      >
        <nav className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="justify-start"
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/auth/login')
            }}
          >
            Ingresar
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/auth/registro')
            }}
          >
            Crear tienda
          </Button>
        </nav>
      </Drawer>

      {/* Hero */}
      <MarketplaceHero 
        storeCount={stores.length}
        isLoading={loading}
      />

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Chips de categorías rápidas */}
        {categories.length > 0 && !loading && (
          <div className="mb-6">
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        )}

        {/* Barra de filtros */}
        <div className="mb-6">
          <MarketplaceFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchLoading={searchLoading}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            cities={cities}
            categories={categories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showFavoritesOnly={showFavoritesOnly}
            onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
            favoritesCount={favorites.length}
            activeFiltersCount={activeFiltersCount}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            resultsCount={finalFilteredStores.length}
          />
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div className="mb-6">
            <FilterChips
              searchQuery={searchQuery}
              selectedCity={selectedCity}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
              showFavoritesOnly={showFavoritesOnly}
              onClearSearch={() => setSearchQuery('')}
              onClearCity={() => setSelectedCity('')}
              onClearCategory={() => setSelectedCategory('')}
              onClearSort={() => setSortBy('relevance')}
              onClearFavorites={() => setShowFavoritesOnly(false)}
              onClearAll={clearFilters}
            />
          </div>
        )}

        {/* Tiendas destacadas - Solo si no hay filtros activos */}
        {!hasActiveFilters && !loading && (
          <FeaturedStoresSection
            featuredStores={featuredStores}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Grid de tiendas */}
        <StoresGrid
          stores={paginatedStores}
          loading={loading}
          error={error}
          onRetry={fetchData}
          viewMode={viewMode}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={finalFilteredStores.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          showHeader={!hasActiveFilters && featuredStores.length > 0}
          title="Todas las tiendas"
          subtitle="Explora catálogos y compra por WhatsApp"
        />

        {/* CTA */}
        <MarketplaceCTA />
      </main>

      {/* Footer */}
      <MarketplaceFooter />

      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        cities={cities}
        categories={categories}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoritesCount={favorites.length}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}
