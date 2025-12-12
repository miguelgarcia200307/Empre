import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Select,
  Badge,
  EmptyState,
  Drawer,
  Pagination,
  Modal,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import {
  Search,
  Filter,
  Store,
  Eye,
  ExternalLink,
  Package,
  MapPin,
  CreditCard,
  MessageCircle,
  Calendar,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  RefreshCw,
  User,
  ShieldAlert,
} from 'lucide-react'

const AdminTiendas = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState([])
  const [totalStores, setTotalStores] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    plan: '',
    city: '',
    status: '',
    moderation: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moderationModal, setModerationModal] = useState({ open: false, store: null, action: null })
  const [moderationReason, setModerationReason] = useState('')
  const itemsPerPage = 10

  const fetchStores = async () => {
    setLoading(true)
    try {
      // Query de stores (sin join directo a profiles por falta de FK detectada)
      let query = supabase
        .from('stores')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Aplicar búsqueda
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
      }

      // Aplicar filtros
      if (filters.plan) {
        query = query.eq('plan', filters.plan)
      }
      if (filters.status === 'activo') {
        query = query.eq('is_active', true)
      } else if (filters.status === 'inactivo') {
        query = query.eq('is_active', false)
      }
      if (filters.moderation) {
        query = query.eq('moderation_status', filters.moderation)
      }

      // Paginación
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data: storesData, error: storesError, count } = await query

      if (storesError) throw storesError

      // Filtrar por ciudad en el cliente
      let filteredData = storesData || []
      if (filters.city) {
        filteredData = filteredData.filter(s => 
          s.city?.toLowerCase().includes(filters.city.toLowerCase())
        )
      }

      // Obtener profiles para los owners (query separada)
      const ownerIds = [...new Set(filteredData.map(s => s.owner_id).filter(Boolean))]
      let profilesMap = {}
      
      if (ownerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', ownerIds)

        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError)
        } else {
          profilesData?.forEach(profile => {
            profilesMap[profile.id] = profile
          })
        }
      }

      // Obtener conteo de productos para cada tienda
      const storeIds = filteredData.map(s => s.id)
      let productsCountMap = {}
      
      if (storeIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('store_id')
          .in('store_id', storeIds)
          .eq('is_active', true)

        if (!productsError && productsData) {
          productsData.forEach(p => {
            productsCountMap[p.store_id] = (productsCountMap[p.store_id] || 0) + 1
          })
        }
      }

      // Obtener métricas para cada tienda
      if (storeIds.length > 0) {
        const { data: metrics } = await supabase
          .from('store_metrics')
          .select('store_id, views, whatsapp_clicks')
          .in('store_id', storeIds)

        // Combinar toda la data
        filteredData = filteredData.map(store => ({
          ...store,
          profiles: profilesMap[store.owner_id] || null,
          product_count: productsCountMap[store.id] || 0,
          total_views: metrics?.filter(m => m.store_id === store.id).reduce((sum, m) => sum + (m.views || 0), 0) || 0,
          total_clicks: metrics?.filter(m => m.store_id === store.id).reduce((sum, m) => sum + (m.whatsapp_clicks || 0), 0) || 0,
        }))
      }

      setStores(filteredData)
      setTotalStores(count || 0)
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Error al cargar tiendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [currentPage, searchQuery])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchStores()
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({ plan: '', city: '', status: '', moderation: '' })
    setCurrentPage(1)
    fetchStores()
    setShowFilters(false)
  }

  const handleViewStore = (store) => {
    setSelectedStore(store)
    setDrawerOpen(true)
  }

  // Cambiar estado de la tienda
  const handleToggleStatus = async (store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !store.is_active })
        .eq('id', store.id)

      if (error) throw error

      toast.success(`Tienda ${store.is_active ? 'desactivada' : 'activada'} correctamente`)
      fetchStores()
      setDrawerOpen(false)
    } catch (error) {
      toast.error('Error al cambiar estado')
    }
  }

  // Cambiar plan de tienda
  const handleChangePlan = async (store, newPlan) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ 
          plan: newPlan,
          plan_changed_at: new Date().toISOString()
        })
        .eq('id', store.id)

      if (error) {
        console.error('Error al cambiar plan:', error)
        throw error
      }

      toast.success(`Plan cambiado a ${planNames[newPlan]}`)
      fetchStores()
      if (selectedStore?.id === store.id) {
        setSelectedStore({ ...selectedStore, plan: newPlan })
      }
    } catch (error) {
      console.error('Error completo:', error)
      toast.error(`Error al cambiar plan: ${error.message || 'Error desconocido'}`)
    }
  }

  // Moderación de tienda
  const handleModeration = async () => {
    if (!moderationModal.store || !moderationModal.action) return

    try {
      const updates = {
        moderation_status: moderationModal.action,
        moderation_reason: moderationReason || null,
      }

      // Si es rechazo o revisión, desactivar tienda
      if (moderationModal.action === 'rejected' || moderationModal.action === 'review') {
        updates.marketplace_hidden = true
      } else if (moderationModal.action === 'approved') {
        updates.marketplace_hidden = false
      }

      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', moderationModal.store.id)

      if (error) throw error

      const messages = {
        approved: 'Tienda aprobada correctamente',
        rejected: 'Tienda rechazada',
        review: 'Tienda marcada para revisión',
        pending: 'Tienda puesta en pendiente',
      }

      toast.success(messages[moderationModal.action])
      setModerationModal({ open: false, store: null, action: null })
      setModerationReason('')
      fetchStores()
      setDrawerOpen(false)
    } catch (error) {
      toast.error('Error al moderar tienda')
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

  const moderationColors = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    rejected: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
    review: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
  }

  const moderationNames = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    review: 'En revisión',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tiendas</h1>
          <p className="text-slate-500 mt-1">
            {totalStores} tienda{totalStores !== 1 ? 's' : ''} registrada{totalStores !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
            ${showFilters || Object.values(filters).some(f => f) 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {Object.values(filters).filter(f => f).length > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {Object.values(filters).filter(f => f).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Plan"
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              options={[
                { value: '', label: 'Todos los planes' },
                { value: 'gratis', label: 'Gratuito' },
                { value: 'basico', label: 'Básico' },
                { value: 'emprendedor', label: 'Emprendedor' },
                { value: 'pro', label: 'Pro' },
              ]}
            />
            <Input
              label="Ciudad"
              placeholder="Ej: Bogotá"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <Select
              label="Estado"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'Todos' },
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
              ]}
            />
            <Select
              label="Moderación"
              value={filters.moderation}
              onChange={(e) => setFilters({ ...filters, moderation: e.target.value })}
              options={[
                { value: '', label: 'Todos' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'approved', label: 'Aprobada' },
                { value: 'rejected', label: 'Rechazada' },
                { value: 'review', label: 'En revisión' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Limpiar
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No hay tiendas"
            description={searchQuery ? 'No se encontraron tiendas con ese criterio' : 'Aún no hay tiendas registradas'}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Tienda</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Propietario</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Ciudad</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Plan</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Productos</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Visitas</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Estado</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {store.logo_url ? (
                            <img
                              src={store.logo_url}
                              alt={store.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {store.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{store.name}</p>
                            <p className="text-sm text-slate-500">/{store.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-700">{store.profiles?.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-slate-500">{store.profiles?.email}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {store.city || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[store.plan || 'gratis']}`}>
                          {planNames[store.plan || 'gratis']}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-700">{store.product_count}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-700">{store.total_views?.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          store.is_active 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {store.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewStore(store)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/tienda/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Ver tienda"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {stores.map((store) => (
                <div key={store.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {store.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{store.name}</p>
                      <p className="text-sm text-slate-500">/{store.slug}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${planColors[store.plan || 'gratis']}`}>
                          {planNames[store.plan || 'gratis']}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          store.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {store.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {store.product_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {store.total_views?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewStore(store)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-200 px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalStores / itemsPerPage)}
                totalItems={totalStores}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Store Detail Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Detalle de tienda"
        size="lg"
      >
        {selectedStore && (
          <div className="space-y-6">
            {/* Store Header */}
            <div className="flex items-center gap-4">
              {selectedStore.logo_url ? (
                <img
                  src={selectedStore.logo_url}
                  alt={selectedStore.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedStore.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{selectedStore.name}</h3>
                <p className="text-slate-500">/{selectedStore.slug}</p>
              </div>
              <a
                href={`/tienda/${selectedStore.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <Package className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900">{selectedStore.product_count}</p>
                <p className="text-xs text-slate-500">Productos</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <Eye className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900">{selectedStore.total_views?.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Visitas</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <MessageCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900">{selectedStore.total_clicks?.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Clicks WA</p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Propietario</h4>
              <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{selectedStore.profiles?.full_name || 'Sin nombre'}</p>
                  <p className="text-sm text-slate-500">{selectedStore.profiles?.email}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Detalles</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{selectedStore.city || 'Ciudad no especificada'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">Plan {planNames[selectedStore.plan || 'gratis']}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">
                    Creada el {new Date(selectedStore.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Moderation */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Estado y Moderación</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedStore.is_active 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {selectedStore.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {selectedStore.is_active ? 'Tienda activa' : 'Tienda inactiva'}
                </span>
                
                {selectedStore.moderation_status && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    moderationColors[selectedStore.moderation_status]?.bg
                  } ${moderationColors[selectedStore.moderation_status]?.text}`}>
                    {(() => {
                      const Icon = moderationColors[selectedStore.moderation_status]?.icon
                      return Icon ? <Icon className="w-4 h-4" /> : null
                    })()}
                    {moderationNames[selectedStore.moderation_status]}
                  </span>
                )}
              </div>
              
              {selectedStore.moderation_reason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Motivo:</strong> {selectedStore.moderation_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Change Plan */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Cambiar Plan</h4>
              <div className="flex flex-wrap gap-2">
                {['gratis', 'basico', 'emprendedor', 'pro'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => handleChangePlan(selectedStore, plan)}
                    disabled={selectedStore.plan === plan}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${selectedStore.plan === plan
                        ? `${planColors[plan]} ring-2 ring-offset-2 ring-blue-500`
                        : `${planColors[plan]} opacity-60 hover:opacity-100`
                      }
                    `}
                  >
                    {planNames[plan]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                * Al cambiar el plan manualmente, el usuario tendrá acceso inmediato a las nuevas funciones.
                La integración de pagos está pendiente.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Acciones</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedStore.is_active ? 'danger' : 'primary'}
                  onClick={() => handleToggleStatus(selectedStore)}
                >
                  {selectedStore.is_active ? (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Desactivar tienda
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Activar tienda
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setModerationModal({ 
                    open: true, 
                    store: selectedStore, 
                    action: 'review' 
                  })}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Marcar para revisión
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Moderation Modal */}
      <Modal
        isOpen={moderationModal.open}
        onClose={() => {
          setModerationModal({ open: false, store: null, action: null })
          setModerationReason('')
        }}
        title="Moderar tienda"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Estás a punto de {
              moderationModal.action === 'approved' ? 'aprobar' :
              moderationModal.action === 'rejected' ? 'rechazar' :
              moderationModal.action === 'review' ? 'marcar para revisión' :
              'moderar'
            } la tienda <strong>{moderationModal.store?.name}</strong>.
          </p>

          {(moderationModal.action === 'rejected' || moderationModal.action === 'review') && (
            <Textarea
              label="Motivo (opcional)"
              placeholder="Explica el motivo de esta acción..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              rows={3}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setModerationModal({ open: false, store: null, action: null })
                setModerationReason('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={moderationModal.action === 'rejected' ? 'danger' : 'primary'}
              onClick={handleModeration}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminTiendas
