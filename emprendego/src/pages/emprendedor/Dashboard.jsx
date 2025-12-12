import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice, formatRelativeTime } from '../../lib/helpers'
import { Card, Button, Badge, Spinner } from '../../components/ui'
import {
  Package,
  Eye,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Plus,
  QrCode,
  ExternalLink,
  Clock,
} from 'lucide-react'

const Dashboard = () => {
  const { store, loading: storeLoading, plan, hasFeature } = useStore()
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    productos: 0,
    visitas: 0,
    pedidos: 0,
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (store?.id) {
      fetchDashboardData()
    } else if (!storeLoading) {
      setLoading(false)
    }
  }, [store?.id, storeLoading])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Obtener conteo de productos
      const { count: productosCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)

      // Obtener productos recientes
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, main_image_url, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Obtener métricas (si existen)
      const { data: metrics } = await supabase
        .from('store_metrics')
        .select('views, orders_count')
        .eq('store_id', store.id)
        .maybeSingle()

      setStats({
        productos: productosCount || 0,
        visitas: metrics?.views || 0,
        pedidos: metrics?.orders_count || 0,
      })
      setRecentProducts(products || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Si está cargando
  if (loading || storeLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  // Solo redirigir al onboarding si el profile indica que NO se ha completado
  // Esto evita redirecciones incorrectas cuando la tienda tarda en cargar
  if (!store && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  // Si no hay tienda pero ya completó onboarding, mostrar mensaje para crear tienda
  if (!store && profile?.onboarding_completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No se encontró tu tienda</h2>
        <p className="text-gray-600 mb-4">Parece que hubo un problema cargando tu tienda. Intenta recargar la página.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Recargar página
        </button>
      </div>
    )
  }

  const storeUrl = store?.slug ? `${window.location.origin}/tienda/${store.slug}` : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Así va tu tienda <span className="font-medium">{store?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/panel/enlaces">
            <Button variant="outline" icon={QrCode} size="sm">
              Ver QR
            </Button>
          </Link>
          <Link to="/panel/productos">
            <Button icon={Plus} size="sm">
              Nuevo producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick link to store */}
      {storeUrl && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm">Tu tienda está disponible en:</p>
              <p className="font-mono text-lg mt-1 break-all">{storeUrl}</p>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors shrink-0"
            >
              Ver tienda
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productos}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Visitas</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.visitas}
                {!hasFeature('analytics') && (
                  <Badge variant="amber" size="sm" className="ml-2">PRO</Badge>
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos WhatsApp</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pedidos}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Productos recientes</h2>
            <Link
              to="/panel/productos"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50"
                >
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(product.created_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aún no tienes productos</p>
              <Link to="/panel/productos">
                <Button size="sm" icon={Plus}>
                  Agregar producto
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick actions / Tips */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            <Link
              to="/panel/productos"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Agregar productos</p>
                <p className="text-sm text-gray-500">Sube fotos y precios</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/panel/diseno"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Personalizar tienda</p>
                <p className="text-sm text-gray-500">Colores, logo y más</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/panel/enlaces"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-green-100">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Compartir tienda</p>
                <p className="text-sm text-gray-500">QR y enlace directo</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Upgrade CTA for free plan */}
      {plan.id === 'gratis' && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                🚀 Lleva tu negocio al siguiente nivel
              </h3>
              <p className="text-gray-600 mt-1">
                Con el Plan Pro tendrás productos ilimitados, estadísticas, IA para descripciones y más.
              </p>
            </div>
            <Link to="/panel/plan">
              <Button variant="primary">
                Ver planes
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
