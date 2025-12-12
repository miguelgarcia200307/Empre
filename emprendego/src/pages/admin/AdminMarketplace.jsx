import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Modal,
  EmptyState,
  Toggle,
} from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import {
  ShoppingBag,
  Store,
  Star,
  Search,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Eye,
  MessageCircle,
  Package,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Settings,
  Filter,
  Globe,
  Calendar,
} from 'lucide-react'

const AdminMarketplace = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [featuredStores, setFeaturedStores] = useState([])
  const [allStores, setAllStores] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    title: 'Marketplace EmprendeGo',
    description: 'Descubre las mejores tiendas de emprendedores',
    priorityByPlan: true,
    showFeaturedFirst: true,
  })
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Obtener tiendas destacadas
      const { data: featured, error: featuredError } = await supabase
        .from('marketplace_featured')
        .select(`
          *,
          stores (
            id,
            name,
            slug,
            logo_url,
            city,
            plan,
            is_active,
            total_views
          )
        `)
        .order('sort_order', { ascending: true })

      if (featuredError) throw featuredError

      // Obtener métricas para las tiendas destacadas
      if (featured?.length > 0) {
        const storeIds = featured.map(f => f.stores?.id).filter(Boolean)
        const { data: metrics } = await supabase
          .from('store_metrics')
          .select('store_id, views, whatsapp_clicks')
          .in('store_id', storeIds)

        const enrichedFeatured = featured.map(f => ({
          ...f,
          stores: {
            ...f.stores,
            total_views: metrics?.filter(m => m.store_id === f.stores?.id).reduce((sum, m) => sum + (m.views || 0), 0) || 0,
            total_clicks: metrics?.filter(m => m.store_id === f.stores?.id).reduce((sum, m) => sum + (m.whatsapp_clicks || 0), 0) || 0,
          }
        }))

        setFeaturedStores(enrichedFeatured)
      } else {
        setFeaturedStores([])
      }

      // Obtener configuración del marketplace
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value_json')
        .eq('key', 'marketplace')
        .single()

      if (settingsData?.value_json) {
        setSettings(settingsData.value_json)
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
      toast.error('Error al cargar datos del marketplace')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllStores = async () => {
    try {
      let query = supabase
        .from('stores')
        .select('id, name, slug, logo_url, city, plan, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      // Filtrar tiendas que ya están destacadas
      const featuredIds = featuredStores.map(f => f.store_id)
      setAllStores((data || []).filter(s => !featuredIds.includes(s.id)))
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (addModalOpen) {
      fetchAllStores()
    }
  }, [addModalOpen, searchQuery])

  const handleAddFeatured = async (store) => {
    try {
      const maxOrder = featuredStores.length > 0 
        ? Math.max(...featuredStores.map(f => f.sort_order)) + 1 
        : 0

      const { error } = await supabase
        .from('marketplace_featured')
        .insert([{
          store_id: store.id,
          sort_order: maxOrder,
        }])

      if (error) throw error

      toast.success(`${store.name} agregada a destacados`)
      setAddModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error adding featured:', error)
      if (error.code === '23505') {
        toast.error('Esta tienda ya está en destacados')
      } else {
        toast.error('Error al agregar tienda')
      }
    }
  }

  const handleRemoveFeatured = async (featured) => {
    try {
      const { error } = await supabase
        .from('marketplace_featured')
        .delete()
        .eq('id', featured.id)

      if (error) throw error

      toast.success('Tienda removida de destacados')
      fetchData()
    } catch (error) {
      toast.error('Error al remover tienda')
    }
  }

  const handleMoveOrder = async (featured, direction) => {
    const currentIndex = featuredStores.findIndex(f => f.id === featured.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= featuredStores.length) return

    const other = featuredStores[newIndex]

    try {
      await Promise.all([
        supabase.from('marketplace_featured').update({ sort_order: other.sort_order }).eq('id', featured.id),
        supabase.from('marketplace_featured').update({ sort_order: featured.sort_order }).eq('id', other.id),
      ])

      toast.success('Orden actualizado')
      fetchData()
    } catch (error) {
      toast.error('Error al cambiar orden')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'marketplace',
          value_json: settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

      if (error) throw error

      toast.success('Configuración guardada')
      setSettingsModalOpen(false)
    } catch (error) {
      toast.error('Error al guardar configuración')
    }
  }

  const handleToggleStoreVisibility = async (store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ marketplace_hidden: !store.marketplace_hidden })
        .eq('id', store.id)

      if (error) throw error

      toast.success(`Tienda ${store.marketplace_hidden ? 'visible' : 'oculta'} en marketplace`)
      fetchData()
    } catch (error) {
      toast.error('Error al cambiar visibilidad')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
          <p className="text-slate-500 mt-1">Gestiona las tiendas destacadas y configuración</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSettingsModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar destacada
          </Button>
        </div>
      </div>

      {/* Settings Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Configuración actual</h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            settings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {settings.enabled ? 'Marketplace activo' : 'Marketplace desactivado'}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <Globe className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Título</p>
            <p className="font-medium text-slate-900 truncate">{settings.title}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <Filter className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Prioridad por plan</p>
            <p className="font-medium text-slate-900">{settings.priorityByPlan ? 'Sí' : 'No'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <Star className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Destacados primero</p>
            <p className="font-medium text-slate-900">{settings.showFeaturedFirst ? 'Sí' : 'No'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <Store className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Tiendas destacadas</p>
            <p className="font-medium text-slate-900">{featuredStores.length}</p>
          </div>
        </div>
      </div>

      {/* Featured Stores */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Tiendas destacadas</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Estas tiendas aparecen primero en el marketplace (arrastra para reordenar)
          </p>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
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
        ) : featuredStores.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No hay tiendas destacadas"
            description="Agrega tiendas destacadas para mostrarlas primero en el marketplace"
            action={
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar tienda
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {featuredStores.map((featured, index) => {
              const store = featured.stores
              if (!store) return null

              return (
                <div
                  key={featured.id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveOrder(featured, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(featured, 'down')}
                      disabled={index === featuredStores.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Position number */}
                  <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>

                  {/* Store info */}
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {store.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{store.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>/{store.slug}</span>
                      <span>•</span>
                      <span>{store.city || 'Sin ciudad'}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      {store.total_views?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      {store.total_clicks?.toLocaleString() || 0}
                    </div>
                  </div>

                  {/* Plan badge */}
                  <span className={`hidden md:inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[store.plan || 'gratis']}`}>
                    {planNames[store.plan || 'gratis']}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <a
                      href={`/tienda/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ver tienda"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleRemoveFeatured(featured)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remover de destacados"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Cómo funciona el orden del marketplace</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Destacados:</strong> Las tiendas marcadas como destacadas aparecen primero (en el orden que configures aquí)</li>
          <li>• <strong>Prioridad por plan:</strong> Si está activado, las tiendas se ordenan Pro → Emprendedor → Básico → Gratuito</li>
          <li>• <strong>Visibilidad:</strong> Puedes ocultar tiendas específicas del marketplace sin desactivarlas completamente</li>
        </ul>
      </div>

      {/* Add Featured Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setSearchQuery('')
        }}
        title="Agregar tienda destacada"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stores list */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {allStores.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {searchQuery ? 'No se encontraron tiendas' : 'Todas las tiendas ya están destacadas o cargando...'}
              </div>
            ) : (
              allStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleAddFeatured(store)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {store.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{store.name}</p>
                    <p className="text-sm text-slate-500">/{store.slug} • {store.city || 'Sin ciudad'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${planColors[store.plan || 'gratis']}`}>
                    {planNames[store.plan || 'gratis']}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Configuración del Marketplace"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Marketplace activo</p>
              <p className="text-sm text-slate-500">Mostrar el marketplace público</p>
            </div>
            <Toggle
              checked={settings.enabled}
              onChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          <Input
            label="Título del marketplace"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
          />

          <Input
            label="Descripción"
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Prioridad por plan</p>
              <p className="text-sm text-slate-500">Ordenar tiendas según su plan (Pro primero)</p>
            </div>
            <Toggle
              checked={settings.priorityByPlan}
              onChange={(checked) => setSettings({ ...settings, priorityByPlan: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900">Destacados primero</p>
              <p className="text-sm text-slate-500">Mostrar tiendas destacadas al inicio</p>
            </div>
            <Toggle
              checked={settings.showFeaturedFirst}
              onChange={(checked) => setSettings({ ...settings, showFeaturedFirst: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost" onClick={() => setSettingsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings}>
              Guardar configuración
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminMarketplace
