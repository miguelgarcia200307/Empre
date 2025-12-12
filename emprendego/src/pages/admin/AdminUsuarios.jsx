import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Select,
  Badge,
  EmptyState,
  Drawer,
  Pagination,
} from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import {
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  Store,
  Eye,
  MessageCircle,
  Download,
  MoreVertical,
  ExternalLink,
  User,
  MapPin,
  CreditCard,
  Activity,
  X,
} from 'lucide-react'

const AdminUsuarios = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    plan: '',
    city: '',
    status: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const itemsPerPage = 10

  // Obtener usuarios
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Query de profiles (sin join directo a stores por falta de FK)
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          avatar_url,
          role,
          created_at
        `, { count: 'exact' })
        .eq('role', 'emprendedor')
        .order('created_at', { ascending: false })

      // Aplicar búsqueda
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      // Paginación
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data: profilesData, error: profilesError, count } = await query

      if (profilesError) throw profilesError

      // Obtener stores para estos usuarios (query separada)
      const userIds = (profilesData || []).map(p => p.id)
      let storesMap = {}
      
      if (userIds.length > 0) {
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select(`
            id,
            owner_id,
            name,
            slug,
            city,
            plan,
            is_active,
            logo_url,
            total_views,
            created_at
          `)
          .in('owner_id', userIds)

        if (storesError) {
          console.warn('Error fetching stores:', storesError)
        } else {
          // Agrupar stores por owner_id
          storesData?.forEach(store => {
            if (!storesMap[store.owner_id]) {
              storesMap[store.owner_id] = []
            }
            storesMap[store.owner_id].push(store)
          })
        }
      }

      // Combinar profiles con sus stores
      let combinedData = (profilesData || []).map(profile => ({
        ...profile,
        stores: storesMap[profile.id] || []
      }))

      // Filtrar por plan/city/status del lado cliente si hay filtros de store
      let filteredData = combinedData
      
      if (filters.plan) {
        filteredData = filteredData.filter(u => 
          u.stores?.some(s => s.plan === filters.plan)
        )
      }
      
      if (filters.city) {
        filteredData = filteredData.filter(u => 
          u.stores?.some(s => s.city?.toLowerCase().includes(filters.city.toLowerCase()))
        )
      }
      
      if (filters.status) {
        const isActive = filters.status === 'activo'
        filteredData = filteredData.filter(u => 
          u.stores?.some(s => s.is_active === isActive)
        )
      }

      setUsers(filteredData)
      setTotalUsers(count || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  // Aplicar filtros
  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchUsers()
    setShowFilters(false)
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({ plan: '', city: '', status: '' })
    setCurrentPage(1)
    fetchUsers()
    setShowFilters(false)
  }

  // Ver detalle de usuario
  const handleViewUser = async (user) => {
    // Obtener métricas de sus tiendas
    if (user.stores?.length > 0) {
      const storeIds = user.stores.map(s => s.id)
      const { data: metrics } = await supabase
        .from('store_metrics')
        .select('store_id, views, whatsapp_clicks')
        .in('store_id', storeIds)

      // Agregar métricas a las tiendas
      user.stores = user.stores.map(store => ({
        ...store,
        metrics: metrics?.filter(m => m.store_id === store.id) || [],
        total_views: metrics?.filter(m => m.store_id === store.id).reduce((sum, m) => sum + (m.views || 0), 0) || 0,
        total_clicks: metrics?.filter(m => m.store_id === store.id).reduce((sum, m) => sum + (m.whatsapp_clicks || 0), 0) || 0,
      }))
    }

    setSelectedUser(user)
    setDrawerOpen(true)
  }

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Tienda', 'Ciudad', 'Plan', 'Estado', 'Fecha registro']
    const rows = users.map(user => {
      const store = user.stores?.[0]
      return [
        user.full_name || '',
        user.email || '',
        user.phone || '',
        store?.name || '',
        store?.city || '',
        store?.plan || 'gratis',
        store?.is_active ? 'Activo' : 'Inactivo',
        new Date(user.created_at).toLocaleDateString('es-CO'),
      ]
    })

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `usuarios_emprendego_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV exportado correctamente')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 mt-1">
            {totalUsers} emprendedor{totalUsers !== 1 ? 'es' : ''} registrado{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
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
          <div className="grid gap-4 sm:grid-cols-3">
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
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay usuarios"
            description={searchQuery ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'Aún no hay emprendedores registrados'}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Usuario</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Tienda</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Ciudad</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Plan</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Estado</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Registro</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const store = user.stores?.[0]
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{user.full_name || 'Sin nombre'}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {store ? (
                            <div className="flex items-center gap-2">
                              {store.logo_url ? (
                                <img src={store.logo_url} alt="" className="w-6 h-6 rounded-lg object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center">
                                  <Store className="w-3 h-3 text-slate-500" />
                                </div>
                              )}
                              <span className="text-slate-700">{store.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin tienda</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {store?.city || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[store?.plan || 'gratis']}`}>
                            {planNames[store?.plan || 'gratis']}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {store ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              store.is_active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {store.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                          {new Date(user.created_at).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {store && (
                              <a
                                href={`/tienda/${store.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Ver tienda"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {users.map((user) => {
                const store = user.stores?.[0]
                return (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{user.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        {store && (
                          <div className="flex items-center gap-2 mt-2">
                            <Store className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{store.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${planColors[store?.plan || 'gratis']}`}>
                              {planNames[store?.plan || 'gratis']}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-200 px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalUsers / itemsPerPage)}
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* User Detail Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Detalle de usuario"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center gap-4">
              {selectedUser.avatar_url ? (
                <img
                  src={selectedUser.avatar_url}
                  alt={selectedUser.full_name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedUser.full_name || 'Sin nombre'}
                </h3>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contacto</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">{selectedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">
                    Registrado el {new Date(selectedUser.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stores */}
            {selectedUser.stores?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Tienda{selectedUser.stores.length > 1 ? 's' : ''}
                </h4>
                {selectedUser.stores.map((store) => (
                  <div key={store.id} className="p-4 bg-slate-50 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{store.name}</p>
                        <p className="text-sm text-slate-500">/{store.slug}</p>
                      </div>
                      <a
                        href={`/tienda/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-100"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          Ciudad
                        </div>
                        <p className="font-medium text-slate-900">{store.city || 'No especificada'}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <CreditCard className="w-4 h-4" />
                          Plan
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-sm font-medium ${planColors[store.plan || 'gratis']}`}>
                          {planNames[store.plan || 'gratis']}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <Eye className="w-4 h-4" />
                          Visitas
                        </div>
                        <p className="font-medium text-slate-900">{store.total_views?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <MessageCircle className="w-4 h-4" />
                          Clicks WA
                        </div>
                        <p className="font-medium text-slate-900">{store.total_clicks?.toLocaleString() || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        store.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {store.is_active ? 'Tienda activa' : 'Tienda inactiva'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDrawerOpen(false)}>
                Cerrar
              </Button>
              {selectedUser.stores?.[0] && (
                <Button
                  className="flex-1"
                  onClick={() => window.open(`/tienda/${selectedUser.stores[0].slug}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver tienda
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AdminUsuarios
