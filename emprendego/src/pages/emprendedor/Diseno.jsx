import { useState, useEffect, useMemo, useCallback } from 'react'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { colorPalettes } from '../../lib/helpers'
import { supabase } from '../../lib/supabaseClient'
import {
  Card,
  Button,
  Input,
  ImageUpload,
  Spinner,
} from '../../components/ui'
import FeatureGate from '../../components/FeatureGate'
import StorePreview from '../../components/StorePreview'
import { TemplateCard, TemplatePreviewModal, TemplateFilters } from '../../components/templates'
import {
  TEMPLATES,
  getTemplatesByIndustry,
  searchTemplates,
  canUseTemplate,
  getTemplateById,
} from '../../data/templates'
import {
  Palette,
  Eye,
  Save,
  LayoutTemplate,
  Sparkles,
  RefreshCw,
  MessageSquareText,
} from 'lucide-react'

// ============================================
// DISEÑO DE LA TIENDA
// ============================================

const Diseno = () => {
  const { store, updateStore, loading: storeLoading, plan } = useStore()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [activeTab, setActiveTab] = useState('plantillas')
  
  // Productos y categorías para preview
  const [previewProducts, setPreviewProducts] = useState([])
  const [previewCategories, setPreviewCategories] = useState([])
  
  // ===========================================
  // PREVIEW STORE - FUENTE ÚNICA DE VERDAD
  // ===========================================
  // Este estado representa cómo se vería la tienda si se guardara ahora.
  // TODA acción de diseño debe modificar este estado.
  const [previewStore, setPreviewStore] = useState(null)

  // Estado de plantillas
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Sincronizar previewStore cuando store se carga desde el backend
  useEffect(() => {
    if (store) {
      setPreviewStore({
        ...store,
        // Asegurarse de que los campos de diseño tengan valores por defecto
        logo_url: store.logo_url || null,
        banner_url: store.banner_url || null,
        primary_color: store.primary_color || '#2563eb',
        secondary_color: store.secondary_color || '#7c3aed',
        accent_color: store.accent_color || '#f59e0b',
        font_family: store.font_family || 'Inter, system-ui, sans-serif',
        template_id: store.template_id || null,
        template_overrides: store.template_overrides || {},
        welcome_message: store.welcome_message ?? '¡Hola! 👋 Gracias por visitarnos',
      })
    }
  }, [store])

  // Cargar productos y categorías para el preview
  useEffect(() => {
    const loadPreviewData = async () => {
      if (!store?.id) return

      try {
        // Cargar categorías
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        setPreviewCategories(cats || [])

        // Cargar productos (limitado a 6 para preview)
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(6)
        
        setPreviewProducts(prods || [])
      } catch (err) {
        console.error('Error loading preview data:', err)
      }
    }

    loadPreviewData()
  }, [store?.id])

  // ===========================================
  // FUNCIONES PARA ACTUALIZAR PREVIEW STORE
  // ===========================================
  
  // Actualizar cualquier campo del previewStore
  const updatePreviewStore = useCallback((updates) => {
    setPreviewStore(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  // Filtrar plantillas según búsqueda e industria
  const filteredTemplates = useMemo(() => {
    let templates = selectedIndustry === 'all' 
      ? TEMPLATES 
      : getTemplatesByIndustry(selectedIndustry)
    
    if (searchQuery) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    return templates
  }, [selectedIndustry, searchQuery])

  // Plantilla actualmente seleccionada (basada en previewStore)
  const currentTemplate = useMemo(() => {
    return previewStore?.template_id ? getTemplateById(previewStore.template_id) : null
  }, [previewStore?.template_id])

  // Función para subir imagen a Supabase Storage
  const uploadImage = async (file, folder) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${store.id}/${folder}_${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  }

  const handleSave = async () => {
    if (!previewStore) return
    
    setSaving(true)
    try {
      // Enviar previewStore al backend (solo campos de diseño)
      const payload = {
        logo_url: previewStore.logo_url,
        banner_url: previewStore.banner_url,
        primary_color: previewStore.primary_color,
        secondary_color: previewStore.secondary_color,
        accent_color: previewStore.accent_color,
        font_family: previewStore.font_family,
        template_id: previewStore.template_id,
        template_overrides: previewStore.template_overrides,
        welcome_message: previewStore.welcome_message?.trim() || null,
      }
      
      const { error } = await updateStore(payload)
      if (error) throw error
      toast.success('Diseño actualizado correctamente')
    } catch (error) {
      console.error('Error updating design:', error)
      toast.error('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (file) => {
    if (!file) return
    
    setUploadingLogo(true)
    try {
      const url = await uploadImage(file, 'logo')
      // Actualizar previewStore (fuente única de verdad)
      updatePreviewStore({ logo_url: url })
      toast.success('Logo subido correctamente')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBannerChange = async (file) => {
    if (!file) return
    
    setUploadingBanner(true)
    try {
      const url = await uploadImage(file, 'banner')
      // Actualizar previewStore (fuente única de verdad)
      updatePreviewStore({ banner_url: url })
      toast.success('Banner subido correctamente')
    } catch (error) {
      console.error('Error uploading banner:', error)
      toast.error('Error al subir el banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  // Remover logo
  const handleLogoRemove = () => {
    updatePreviewStore({ logo_url: null })
  }

  // Remover banner
  const handleBannerRemove = () => {
    updatePreviewStore({ banner_url: null })
  }

  // Aplicar plantilla desde el modal - ACTUALIZA INMEDIATAMENTE EL PREVIEW
  const handleApplyTemplate = (data) => {
    updatePreviewStore({
      template_id: data.templateId,
      primary_color: data.colors.primary,
      secondary_color: data.colors.secondary,
      accent_color: data.colors.accent,
      font_family: data.fontFamily,
      template_overrides: data.overrides,
    })
    toast.success(`Plantilla "${getTemplateById(data.templateId)?.name}" aplicada`)
  }

  // Cambiar colores manualmente - ACTUALIZA INMEDIATAMENTE EL PREVIEW
  const handleColorChange = (colorKey, value) => {
    updatePreviewStore({ 
      [colorKey]: value,
      // Si se cambian colores manualmente, quitar plantilla activa
      template_id: null,
      template_overrides: {}
    })
  }

  // Aplicar paleta predefinida - ACTUALIZA INMEDIATAMENTE EL PREVIEW
  const handlePaletteApply = (palette) => {
    updatePreviewStore({
      primary_color: palette.primary,
      secondary_color: palette.secondary,
      template_id: null,
      template_overrides: {}
    })
  }

  // Quitar plantilla activa
  const handleRemoveTemplate = () => {
    updatePreviewStore({ 
      template_id: null, 
      template_overrides: {} 
    })
    toast.info('Plantilla removida')
  }

  // Verificar si una plantilla está bloqueada
  const isTemplateLocked = (template, index) => {
    const result = canUseTemplate(template, plan, index)
    return !result.allowed
  }

  const getTemplateLockReason = (template, index) => {
    const result = canUseTemplate(template, plan, index)
    return result.reason || null
  }

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diseño de la tienda</h1>
          <p className="text-gray-600 mt-1">
            Personaliza cómo se ve tu catálogo
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Eye}>
            Vista previa
          </Button>
          <Button onClick={handleSave} loading={saving} icon={Save}>
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Template indicator */}
      {currentTemplate && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${currentTemplate.palette.primary}, ${currentTemplate.palette.secondary})` }}
          >
            <LayoutTemplate className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Plantilla: {currentTemplate.name}</p>
            <p className="text-sm text-gray-500">{currentTemplate.description}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRemoveTemplate}
          >
            Quitar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Settings */}
        <div className="space-y-6">
          {/* Tabs: Plantillas / Colores */}
          <Card>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('plantillas')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'plantillas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                Plantillas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('colores')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'colores'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Palette className="w-4 h-4" />
                Colores
              </button>
            </div>

            {activeTab === 'plantillas' && (
                <FeatureGate feature="templates" showCard={false}>
                  <div className="space-y-4">
                    {/* Info banner */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-sm">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Elige una plantilla en segundos</p>
                        <p className="text-blue-600 mt-0.5">
                          Diseños profesionales listos para tu industria. Personaliza colores después de elegir.
                        </p>
                      </div>
                    </div>

                    {/* Plan limit indicator */}
                    {plan?.templates !== -1 && plan?.features?.templates && (
                      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <span>Plantillas en tu plan:</span>
                        <span className="font-medium">
                          {plan?.templates || 0} disponibles
                        </span>
                      </div>
                    )}

                    {/* Filters */}
                    <TemplateFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedIndustry={selectedIndustry}
                      onIndustryChange={setSelectedIndustry}
                    />

                    {/* Templates grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {filteredTemplates.map((template, index) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={previewStore?.template_id === template.id}
                          isLocked={isTemplateLocked(template, index)}
                          lockReason={getTemplateLockReason(template, index)}
                          onClick={() => {
                            if (!isTemplateLocked(template, index)) {
                              setSelectedTemplate(template)
                              setShowPreviewModal(true)
                            } else {
                              toast.info('Mejora tu plan para acceder a esta plantilla')
                            }
                          }}
                        />
                      ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <LayoutTemplate className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No se encontraron plantillas</p>
                        <p className="text-sm">Intenta con otra búsqueda o categoría</p>
                      </div>
                    )}
                  </div>
                </FeatureGate>
              )}

              {activeTab === 'colores' && (
                <div className="space-y-6">
                  {/* Palettes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Paletas predefinidas
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {colorPalettes.map((palette) => {
                        const isSelected = previewStore?.primary_color === palette.primary && 
                                          previewStore?.secondary_color === palette.secondary
                        return (
                          <button
                            key={palette.id}
                            type="button"
                            onClick={() => handlePaletteApply(palette)}
                            className={`
                              p-3 rounded-xl border-2 text-left transition-all
                              ${isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="flex gap-1.5 mb-2">
                              <div
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: palette.primary }}
                              />
                              <div
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: palette.secondary }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {palette.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color principal
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={previewStore?.primary_color || '#2563eb'}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <Input
                          value={previewStore?.primary_color || '#2563eb'}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color secundario
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={previewStore?.secondary_color || '#7c3aed'}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <Input
                          value={previewStore?.secondary_color || '#7c3aed'}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accent color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color de acento
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={previewStore?.accent_color || '#f59e0b'}
                        onChange={(e) => updatePreviewStore({ accent_color: e.target.value })}
                        className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={previewStore?.accent_color || '#f59e0b'}
                        onChange={(e) => updatePreviewStore({ accent_color: e.target.value })}
                        className="font-mono text-sm max-w-[140px]"
                      />
                      <span className="text-xs text-gray-500">Para badges y destacados</span>
                    </div>
                  </div>
                </div>
              )}
          </Card>

          {/* Logo */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Logo</h2>
            <ImageUpload
              value={previewStore?.logo_url}
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              aspectRatio="1:1"
              className="max-w-[200px]"
              placeholder="Sube tu logo"
              loading={uploadingLogo}
            />
            <p className="mt-3 text-sm text-gray-500">
              Recomendado: imagen cuadrada, mínimo 200x200px
            </p>
          </Card>

          {/* Banner */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Banner (opcional)</h2>
            <ImageUpload
              value={previewStore?.banner_url}
              onChange={handleBannerChange}
              onRemove={handleBannerRemove}
              aspectRatio="16:9"
              placeholder="Sube una imagen de portada"
              loading={uploadingBanner}
            />
            <p className="mt-3 text-sm text-gray-500">
              Recomendado: 1200x400px para mejor visualización
            </p>
          </Card>

          {/* Mensaje de bienvenida - Solo planes de pago */}
          <FeatureGate feature="welcomeMessage">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Mensaje de bienvenida</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full">
                  Premium
                </span>
              </div>
              <div className="space-y-3">
                <textarea
                  value={previewStore?.welcome_message || ''}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 120)
                    updatePreviewStore({ welcome_message: value })
                  }}
                  placeholder="¡Hola! 👋 Gracias por visitarnos"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Se mostrará arriba del buscador en tu tienda
                  </span>
                  <span className={`font-medium ${
                    (previewStore?.welcome_message?.length || 0) > 100 
                      ? 'text-amber-600' 
                      : 'text-gray-400'
                  }`}>
                    {previewStore?.welcome_message?.length || 0}/120
                  </span>
                </div>
              </div>
            </Card>
          </FeatureGate>
        </div>

        {/* Right column - Preview usando TiendaPublica real */}
        <div>
          <Card className="sticky top-24">
            {/* StorePreview: Renderiza TiendaPublica con previewStore */}
            <StorePreview
              previewStore={previewStore}
              products={previewProducts}
              categories={previewCategories}
              showDeviceToggle={true}
            />
          </Card>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setSelectedTemplate(null)
        }}
        onApply={handleApplyTemplate}
        currentStoreData={previewStore}
      />
    </div>
  )
}

export default Diseno
