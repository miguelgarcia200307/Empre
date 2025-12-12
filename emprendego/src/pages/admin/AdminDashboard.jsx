import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { SkeletonStats } from '../../components/ui'
import {
  Users,
  Store,
  Package,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'

// Componente de Stats Card
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', link }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', icon: 'bg-rose-500', text: 'text-rose-600' },
  }

  const colorSet = colors[color] || colors.blue

  const content = (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
              <span className="text-slate-400">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${colorSet.icon} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }
  return content
}

// Componente de Alerta
const AlertItem = ({ title, description, type = 'warning', action, actionLink }) => {
  const types = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' },
    error: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
  }
  const typeSet = types[type] || types.warning

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${typeSet.bg} ${typeSet.border} border`}>
      <AlertTriangle className={`w-5 h-5 ${typeSet.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
      </div>
      {action && actionLink && (
        <Link
          to={actionLink}
          className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {action}
        </Link>
      )}
    </div>
  )
}

// Componente de Top Tienda
const TopStoreItem = ({ store, index }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
      {index + 1}
    </span>
    {store.logo_url ? (
      <img
        src={store.logo_url}
        alt={store.name}
        className="w-10 h-10 rounded-xl object-cover"
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = 'none'
        }}
      />
    ) : (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold">{store.name?.charAt(0)?.toUpperCase()}</span>
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 truncate">{store.name}</p>
      <p className="text-sm text-slate-500">{store.city || 'Sin ciudad'}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-slate-900">{store.total_views?.toLocaleString() || 0}</p>
      <p className="text-xs text-slate-500">visitas</p>
    </div>
    <a
      href={`/tienda/${store.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
    >
      <ExternalLink className="w-4 h-4" />
    </a>
  </div>
)

// Componente principal
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStores: 0,
    totalProducts: 0,
    totalVisits: 0,
    totalWhatsappClicks: 0,
    newTickets: 0,
    storesWithoutProducts: 0,
    inactiveStores: 0,
  })
  const [planDistribution, setPlanDistribution] = useState([])
  const [topStores, setTopStores] = useState([])
  const [recentTickets, setRecentTickets] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Obtener estadísticas generales (queries robustas sin RPC)
      const [
        usersRes,
        storesRes,
        productsRes,
        metricsRes,
        ticketsOpenRes,
        ticketsAbiertoRes,
        inactiveStoresRes,
        allStoresRes,
        productsWithStoreRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'emprendedor'),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('store_metrics').select('views, whatsapp_clicks'),
        // Buscar tickets con ambos posibles valores de status
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'abierto'),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', false),
        // Para calcular tiendas sin productos, obtenemos todas las tiendas activas
        supabase.from('stores').select('id').eq('is_active', true),
        // Y todos los productos con su store_id
        supabase.from('products').select('store_id').eq('is_active', true),
      ])

      // Calcular métricas totales
      const totalVisits = metricsRes.data?.reduce((sum, m) => sum + (m.views || 0), 0) || 0
      const totalClicks = metricsRes.data?.reduce((sum, m) => sum + (m.whatsapp_clicks || 0), 0) || 0

      // Calcular tiendas sin productos
      const storeIds = new Set(allStoresRes.data?.map(s => s.id) || [])
      const storesWithProducts = new Set(productsWithStoreRes.data?.map(p => p.store_id) || [])
      const storesWithoutProducts = [...storeIds].filter(id => !storesWithProducts.has(id)).length

      setStats({
        totalUsers: usersRes.count || 0,
        activeStores: storesRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalVisits,
        totalWhatsappClicks: totalClicks,
        newTickets: (ticketsOpenRes.count || 0) + (ticketsAbiertoRes.count || 0),
        storesWithoutProducts,
        inactiveStores: inactiveStoresRes.count || 0,
      })

      // Obtener distribución por planes
      const { data: storesWithPlans } = await supabase
        .from('stores')
        .select('plan')
        .eq('is_active', true)

      if (storesWithPlans) {
        const distribution = storesWithPlans.reduce((acc, store) => {
          const plan = store.plan || 'gratis'
          acc[plan] = (acc[plan] || 0) + 1
          return acc
        }, {})

        setPlanDistribution(
          Object.entries(distribution).map(([plan, count]) => ({
            plan,
            count,
          }))
        )
      }

      // Top tiendas (sin relaciones anidadas para evitar errores)
      const { data: topStoresData } = await supabase
        .from('stores')
        .select('id, name, slug, logo_url, city')
        .eq('is_active', true)
        .limit(10)

      if (topStoresData && topStoresData.length > 0) {
        // Obtener métricas por separado
        const storeIdsForMetrics = topStoresData.map(s => s.id)
        const { data: storeMetricsData } = await supabase
          .from('store_metrics')
          .select('store_id, views, whatsapp_clicks')
          .in('store_id', storeIdsForMetrics)

        const storesWithMetrics = topStoresData.map(store => {
          const metrics = storeMetricsData?.filter(m => m.store_id === store.id) || []
          return {
            ...store,
            total_views: metrics.reduce((sum, m) => sum + (m.views || 0), 0),
          }
        })
        storesWithMetrics.sort((a, b) => b.total_views - a.total_views)
        setTopStores(storesWithMetrics.slice(0, 5))
      }

      // Tickets recientes (sin relación anidada)
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select('id, subject, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5)

      if (ticketsData && ticketsData.length > 0) {
        // Obtener nombres de usuarios por separado
        const userIds = [...new Set(ticketsData.map(t => t.user_id).filter(Boolean))]
        let userNames = {}
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)
          
          userNames = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = p.full_name
            return acc
          }, {})
        }

        setRecentTickets(ticketsData.map(t => ({
          ...t,
          profiles: { full_name: userNames[t.user_id] || 'Usuario' }
        })))
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const planColors = {
    gratis: 'bg-slate-100 text-slate-700',
    basico: 'bg-blue-100 text-blue-700',
    emprendedor: 'bg-purple-100 text-purple-700',
    pro: 'bg-amber-100 text-amber-700',
  }

  const planNames = {
    gratis: 'Gratuito',
    basico: 'Básico',
    emprendedor: 'Emprendedor',
    pro: 'Pro',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Resumen general de la plataforma</p>
        </div>
        <SkeletonStats count={4} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-80 animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Emprendedores"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
          link="/admin/usuarios"
        />
        <StatCard
          title="Tiendas activas"
          value={stats.activeStores.toLocaleString()}
          icon={Store}
          color="emerald"
          link="/admin/tiendas"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Visitas totales"
          value={stats.totalVisits.toLocaleString()}
          icon={Eye}
          color="amber"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Clicks WhatsApp"
          value={stats.totalWhatsappClicks.toLocaleString()}
          icon={MessageCircle}
          color="emerald"
        />
        <StatCard
          title="Tickets abiertos"
          value={stats.newTickets.toLocaleString()}
          icon={MessageSquare}
          color="rose"
          link="/admin/soporte"
        />
        <StatCard
          title="Tasa conversión"
          value={stats.totalVisits > 0 ? `${((stats.totalWhatsappClicks / stats.totalVisits) * 100).toFixed(1)}%` : '0%'}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Alerts */}
      {(stats.storesWithoutProducts > 0 || stats.inactiveStores > 0 || stats.newTickets > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Alertas</h2>
          <div className="space-y-3">
            {stats.newTickets > 0 && (
              <AlertItem
                title={`${stats.newTickets} ticket${stats.newTickets > 1 ? 's' : ''} sin responder`}
                description="Hay tickets de soporte pendientes de atención"
                type="error"
                action="Ver tickets"
                actionLink="/admin/soporte"
              />
            )}
            {stats.storesWithoutProducts > 0 && (
              <AlertItem
                title={`${stats.storesWithoutProducts} tienda${stats.storesWithoutProducts > 1 ? 's' : ''} sin productos`}
                description="Tiendas activas que aún no han agregado productos"
                type="warning"
                action="Ver tiendas"
                actionLink="/admin/tiendas?filter=sin-productos"
              />
            )}
            {stats.inactiveStores > 0 && (
              <AlertItem
                title={`${stats.inactiveStores} tienda${stats.inactiveStores > 1 ? 's' : ''} inactiva${stats.inactiveStores > 1 ? 's' : ''}`}
                description="Tiendas desactivadas o en revisión"
                type="info"
                action="Revisar"
                actionLink="/admin/tiendas?filter=inactivas"
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Distribución por plan</h2>
            <Link
              to="/admin/planes"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver planes
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {planDistribution.length > 0 ? (
            <div className="space-y-4">
              {planDistribution.map((item) => {
                const total = planDistribution.reduce((sum, p) => sum + p.count, 0)
                const percentage = total > 0 ? (item.count / total) * 100 : 0

                return (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${planColors[item.plan] || 'bg-slate-100 text-slate-700'}`}>
                        {planNames[item.plan] || item.plan}
                      </span>
                      <span className="text-sm text-slate-600">
                        {item.count} tienda{item.count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.plan === 'pro' ? 'bg-amber-500' :
                          item.plan === 'emprendedor' ? 'bg-purple-500' :
                          item.plan === 'basico' ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No hay tiendas registradas</p>
            </div>
          )}
        </div>

        {/* Top Stores */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Top tiendas</h2>
            <Link
              to="/admin/tiendas"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topStores.length > 0 ? (
            <div className="space-y-1">
              {topStores.map((store, index) => (
                <TopStoreItem key={store.id} store={store} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No hay tiendas con métricas</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Tickets recientes</h2>
          <Link
            to="/admin/soporte"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Asunto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/soporte?ticket=${ticket.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {ticket.profiles?.full_name || 'Usuario'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-flex px-2 py-1 rounded-lg text-xs font-medium
                        ${ticket.status === 'abierto' ? 'bg-amber-100 text-amber-700' :
                          ticket.status === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                          ticket.status === 'resuelto' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }
                      `}>
                        {ticket.status === 'abierto' ? 'Abierto' :
                         ticket.status === 'en_proceso' ? 'En proceso' :
                         ticket.status === 'resuelto' ? 'Resuelto' : 'Cerrado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No hay tickets recientes</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
