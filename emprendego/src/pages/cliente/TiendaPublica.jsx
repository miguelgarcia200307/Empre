import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { generateThemeFromStore } from '../../data/templates'
import { getRemainingTime } from '../../lib/subscription'
import { generateCartItemId } from '../../lib/variants'
import { Store, AlertCircle } from 'lucide-react'

// Premium Store Components
import {
  StoreHeader,
  StoreHero,
  StoreWelcome,
  StoreSearchAndFilters,
  ProductGrid,
  EmptyProductsState,
  ProductModal,
  CartDrawer,
  RecommendedSection,
  StoreFooter,
  FloatingCartButton,
  generateCSSVariables,
} from './components'

// ============================================
// CONSTANTS & HELPERS
// ============================================

// Límites del plan gratis (fallback)
const FREE_PLAN_LIMITS = { maxProducts: 10, maxCategories: 3 }

/**
 * Helper para aplicar límite a una query de Supabase solo si es válido.
 */
const applyLimit = (query, limit) => {
  if (limit === null || limit === undefined) return query
  const n = Number(limit)
  if (n === -1 || !Number.isFinite(n) || n <= 0) return query
  return query.limit(n)
}

// ============================================
// LOCAL ACTIVITY TRACKING (Para recomendaciones)
// ============================================

const STORAGE_KEY_PREFIX = 'eg_store_activity_'
const MAX_TRACKED_ITEMS = 30

const getStoreActivity = (storeId) => {
  if (!storeId) return null
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storeId}`)
    return data ? JSON.parse(data) : {
      viewedProducts: [],
      viewedCategories: [],
      addedToCart: [],
      searchTerms: [],
    }
  } catch {
    return { viewedProducts: [], viewedCategories: [], addedToCart: [], searchTerms: [] }
  }
}

const saveStoreActivity = (storeId, activity) => {
  if (!storeId) return
  try {
    const trimmed = {
      viewedProducts: activity.viewedProducts.slice(-MAX_TRACKED_ITEMS),
      viewedCategories: activity.viewedCategories.slice(-MAX_TRACKED_ITEMS),
      addedToCart: activity.addedToCart.slice(-MAX_TRACKED_ITEMS),
      searchTerms: activity.searchTerms.slice(-10),
    }
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${storeId}`, JSON.stringify(trimmed))
  } catch {
    // Storage lleno, ignorar
  }
}

const trackProductView = (storeId, productId, categoryId) => {
  const activity = getStoreActivity(storeId)
  if (!activity) return

  if (activity.viewedProducts[activity.viewedProducts.length - 1] !== productId) {
    activity.viewedProducts.push(productId)
  }
  
  if (categoryId && activity.viewedCategories[activity.viewedCategories.length - 1] !== categoryId) {
    activity.viewedCategories.push(categoryId)
  }
  
  saveStoreActivity(storeId, activity)
}

const trackAddToCart = (storeId, productId, categoryId = null) => {
  const activity = getStoreActivity(storeId)
  if (!activity) return
  
  if (!activity.addedToCart.includes(productId)) {
    activity.addedToCart.push(productId)
  }
  
  if (categoryId) {
    activity.cartCategories = activity.cartCategories || []
    activity.cartCategories.push(categoryId)
    if (activity.cartCategories.length > 10) {
      activity.cartCategories = activity.cartCategories.slice(-10)
    }
  }
  
  saveStoreActivity(storeId, activity)
}

// ============================================
// RECOMMENDATIONS ALGORITHM
// ============================================

const generateRecommendations = (storeId, products, context = {}) => {
  const {
    currentProductId = null,
    searchQuery = '',
    selectedCategory = 'all',
    categories = [],
  } = context

  const activity = getStoreActivity(storeId)
  if (!activity || products.length === 0) return []

  const viewedCategoryFreq = {}
  activity.viewedCategories.forEach(catId => {
    viewedCategoryFreq[catId] = (viewedCategoryFreq[catId] || 0) + 1
  })
  
  const cartCategoryFreq = {}
  ;(activity.cartCategories || []).forEach(catId => {
    cartCategoryFreq[catId] = (cartCategoryFreq[catId] || 0) + 1
  })

  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean)

  const scored = products.map(product => {
    let score = 0

    if (searchTerms.length > 0) {
      const productName = (product.name || '').toLowerCase()
      const productDesc = (product.description || '').toLowerCase()
      
      searchTerms.forEach(term => {
        if (productName.includes(term)) {
          score += 30
        } else if (productDesc.includes(term)) {
          score += 15
        }
      })
    }

    if (selectedCategory !== 'all' && product.category_id === selectedCategory) {
      score += 50
    }

    if (product.category_id && viewedCategoryFreq[product.category_id]) {
      score += viewedCategoryFreq[product.category_id] * 3
    }
    
    if (product.category_id && cartCategoryFreq[product.category_id]) {
      score += cartCategoryFreq[product.category_id] * 8
    }

    if (product.is_featured) score += 10
    if (product.compare_price && product.compare_price > product.price) score += 5
    if (product.total_sales > 0) score += Math.min(product.total_sales, 20)

    const recentViewed = activity.viewedProducts.slice(-5)
    if (recentViewed.includes(product.id)) score -= 5
    if (activity.addedToCart.includes(product.id)) score -= 30
    if (product.id === currentProductId) score = -1000
    if (product.track_inventory && product.stock_quantity === 0) score = -1000
    if (product.is_active === false) score = -1000

    return { ...product, _score: score }
  })

  const candidates = scored
    .filter(p => p._score > -100)
    .sort((a, b) => b._score - a._score)

  const final = []
  const categoryCount = {}
  
  for (const product of candidates) {
    if (final.length >= 4) break
    
    const catId = product.category_id || 'uncategorized'
    const currentCount = categoryCount[catId] || 0
    
    if (currentCount < 2) {
      final.push(product)
      categoryCount[catId] = currentCount + 1
    }
  }

  if (final.length < 3) {
    const usedIds = new Set(final.map(p => p.id))
    const fallbacks = products
      .filter(p => !usedIds.has(p.id) && p._score > -100)
      .filter(p => p.is_featured || !p.compare_price)
      .slice(0, 4 - final.length)
    final.push(...fallbacks)
  }

  return final.slice(0, 4)
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TiendaPublica({ 
  isPreview = false, 
  previewStore = null,
  previewProducts = [],
  previewCategories = [] 
}) {
  const { slug } = useParams()
  
  // Main states
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(!isPreview)
  const [error, setError] = useState(null)
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  // Preview mode: use provided data
  useEffect(() => {
    if (isPreview && previewStore) {
      setStore(previewStore)
      setProducts(previewProducts || [])
      setCategories(previewCategories || [])
      setLoading(false)
    }
  }, [isPreview, previewStore, previewProducts, previewCategories])

  // Fetch store data (only in non-preview mode)
  useEffect(() => {
    if (isPreview) return

    const fetchStoreData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (storeError || !storeData) {
          setError('not_found')
          return
        }

        setStore(storeData)

        // Get effective plan limits
        let effectiveLimits = FREE_PLAN_LIMITS
        const subscriptionStatus = getRemainingTime(storeData.subscription_end_at)
        const isSubscriptionExpired = subscriptionStatus.hasSubscription && subscriptionStatus.isExpired
        
        if (!isSubscriptionExpired && storeData.plan) {
          const { data: planData } = await supabase
            .from('plans')
            .select('max_products, max_categories')
            .eq('slug', storeData.plan)
            .single()
          
          if (planData) {
            effectiveLimits = {
              maxProducts: planData.max_products ?? FREE_PLAN_LIMITS.maxProducts,
              maxCategories: planData.max_categories ?? FREE_PLAN_LIMITS.maxCategories,
            }
          }
        }

        // Fetch categories
        let categoriesQuery = supabase
          .from('categories')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        categoriesQuery = applyLimit(categoriesQuery, effectiveLimits.maxCategories)
        const { data: categoriesData } = await categoriesQuery
        setCategories(categoriesData || [])

        // Fetch products
        let productsQuery = supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        productsQuery = applyLimit(productsQuery, effectiveLimits.maxProducts)
        const { data: productsData } = await productsQuery
        setProducts(productsData || [])

        // Increment views
        await supabase
          .from('stores')
          .update({ total_views: (storeData.total_views || 0) + 1 })
          .eq('id', storeData.id)

      } catch (err) {
        console.error('Error loading store:', err)
        setError('error')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchStoreData()
  }, [slug, isPreview])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        product.category_id === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  // Generate recommendations (paid plans only)
  const recommendations = useMemo(() => {
    if (!store?.id || store?.plan === 'gratis' || isPreview) return []
    return generateRecommendations(store.id, products, {
      currentProductId: selectedProduct?.id,
      searchQuery,
      selectedCategory,
      categories,
    })
  }, [store?.id, store?.plan, products, selectedProduct?.id, isPreview, searchQuery, selectedCategory, categories])

  // Product view handler (with tracking)
  const handleViewProduct = useCallback((product) => {
    if (!isPreview && store?.id) {
      trackProductView(store.id, product.id, product.category_id)
    }
    setSelectedProduct(product)
    setImageIndex(0)
  }, [isPreview, store?.id])

  // Cart functions
  const addToCart = useCallback((product, variant = null) => {
    if (!isPreview && store?.id) {
      trackAddToCart(store.id, product.id, product.category_id)
    }
    
    const cartItemId = generateCartItemId(product.id, variant?.id)
    const itemPrice = variant?.price ?? product.price
    const itemImage = variant?.image_url ?? product.main_image_url
    
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId)
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        cartItemId,
        id: product.id,
        product_id: product.id,
        variant_id: variant?.id || null,
        name: product.name,
        variant_title: variant?.title || null,
        selected_options: variant?.options || null,
        price: itemPrice,
        main_image_url: itemImage,
        quantity: 1,
        track_inventory: product.track_inventory,
        stock_quantity: variant?.stock_quantity ?? product.stock_quantity,
      }]
    })
  }, [isPreview, store?.id])

  const updateQuantity = useCallback((cartItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    })
  }, [])

  const removeFromCart = useCallback((cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId))
  }, [])

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cart])

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  // Format price
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: store?.currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }, [store?.currency])

  // WhatsApp checkout
  const sendWhatsAppOrder = useCallback(() => {
    if (isPreview) return
    if (!store?.whatsapp || cart.length === 0) return

    const phone = store.whatsapp.replace(/\D/g, '')
    
    const lines = [
      '\u{1F6D2} *Nuevo Pedido - ' + store.name + '*',
      '',
      '\u{1F4E6} *Productos:*',
      ...cart.map((item, index) => {
        const variantInfo = item.variant_title ? ` (${item.variant_title})` : ''
        return `${index + 1}. ${item.name}${variantInfo} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
      }),
      '',
      '\u{1F4B0} *Total: ' + formatPrice(cartTotal) + '*',
      '',
      '\u{00A1}Gracias por tu pedido! \u{1F64F}'
    ]
    
    const message = lines.join('\n')
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }, [isPreview, store, cart, formatPrice, cartTotal])

  // Theme from store
  const theme = useMemo(() => {
    if (!store) return null
    return generateThemeFromStore(store)
  }, [store])

  const primaryColor = store?.primary_color || theme?.primary || '#2563eb'
  const secondaryColor = store?.secondary_color || theme?.secondary || '#7c3aed'

  // CSS variables for theme
  const cssVariables = useMemo(() => {
    return generateCSSVariables(theme)
  }, [theme])

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-[3px] rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderTopColor: 'transparent',
              borderRightColor: primaryColor,
              borderBottomColor: primaryColor,
              borderLeftColor: primaryColor,
            }}
          />
          <p className="text-gray-500 text-sm">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // ERROR STATES
  // ============================================
  if (error === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Tienda no encontrada</h1>
          <p className="text-gray-500 mb-6">
            La tienda que buscas no existe o ha sido desactivada.
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h1>
          <p className="text-gray-500 mb-6">
            Hubo un problema al cargar la tienda. Intenta nuevamente.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Guard: if no store, show loading
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme?.background || '#f9fafb',
        fontFamily: theme?.fontFamily || 'Inter, system-ui, sans-serif',
        ...cssVariables
      }}
    >
      {/* Header */}
      <StoreHeader
        store={store}
        theme={theme}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        isPreview={isPreview}
      />

      {/* Hero / Banner */}
      <StoreHero
        store={store}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Message */}
        <div className="mb-6 sm:mb-8">
          <StoreWelcome
            message={store.welcome_message}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>

        {/* Search & Filters */}
        <StoreSearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          productCount={filteredProducts.length}
          primaryColor={primaryColor}
          theme={theme}
        />

        {/* Products */}
        <div className="mt-6">
          {filteredProducts.length === 0 ? (
            <EmptyProductsState
              searchQuery={searchQuery}
              primaryColor={primaryColor}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : (
            <ProductGrid
              products={filteredProducts}
              primaryColor={primaryColor}
              theme={theme}
              formatPrice={formatPrice}
              onView={handleViewProduct}
              onAddToCart={addToCart}
            />
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && store?.plan !== 'gratis' && (
          <RecommendedSection
            products={recommendations}
            primaryColor={primaryColor}
            theme={theme}
            formatPrice={formatPrice}
            onView={handleViewProduct}
            onAddToCart={addToCart}
          />
        )}

        {/* Footer */}
        <StoreFooter
          store={store}
          theme={theme}
          primaryColor={primaryColor}
        />
      </main>

      {/* Floating Cart Button */}
      {!isCartOpen && (
        <FloatingCartButton
          cartCount={cartCount}
          cartTotal={cartTotal}
          primaryColor={primaryColor}
          theme={theme}
          formatPrice={formatPrice}
          onClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          theme={theme}
          formatPrice={formatPrice}
          imageIndex={imageIndex}
          setImageIndex={setImageIndex}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          store={store}
          theme={theme}
          primaryColor={primaryColor}
          formatPrice={formatPrice}
          cartTotal={cartTotal}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={sendWhatsAppOrder}
          isPreview={isPreview}
        />
      )}

      {/* Extra bottom padding when floating cart is visible */}
      {cart.length > 0 && !isCartOpen && (
        <div className="h-24 sm:h-20" />
      )}
    </div>
  )
}
