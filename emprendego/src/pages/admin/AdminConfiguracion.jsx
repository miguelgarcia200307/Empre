import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Modal,
  Toggle,
} from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import {
  Settings,
  Palette,
  FileText,
  Shield,
  Save,
  Upload,
  Trash2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
  Image,
  Type,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

const AdminConfiguracion = () => {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('branding')

  // Branding settings
  const [branding, setBranding] = useState({
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
    accent_color: '#10B981',
    app_name: 'EmprendeGo',
    tagline: 'Tu negocio en línea, fácil y rápido',
  })

  // Contact settings
  const [contact, setContact] = useState({
    support_email: 'soporte@emprendego.com',
    sales_email: 'ventas@emprendego.com',
    phone: '+57 300 123 4567',
    whatsapp: '+57 300 123 4567',
    address: 'Bogotá, Colombia',
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
  })

  // Legal texts
  const [legal, setLegal] = useState({
    terms_of_service: '',
    privacy_policy: '',
    refund_policy: '',
    cookie_policy: '',
  })

  // SEO settings
  const [seo, setSeo] = useState({
    meta_title: 'EmprendeGo - Crea tu tienda en línea gratis',
    meta_description: 'Crea tu tienda en línea en minutos. Vende por WhatsApp, comparte tu catálogo y haz crecer tu negocio.',
    og_image_url: '',
    keywords: 'tienda online, vender por whatsapp, emprendimiento, colombia',
  })

  // Features flags
  const [features, setFeatures] = useState({
    marketplace_enabled: true,
    support_tickets_enabled: true,
    analytics_enabled: true,
    referral_program_enabled: false,
    maintenance_mode: false,
    registration_enabled: true,
  })

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value_json')

      if (error) throw error

      const settingsMap = {}
      data?.forEach(item => {
        settingsMap[item.key] = item.value_json
      })

      if (settingsMap.branding) setBranding({ ...branding, ...settingsMap.branding })
      if (settingsMap.contact) setContact({ ...contact, ...settingsMap.contact })
      if (settingsMap.legal) setLegal({ ...legal, ...settingsMap.legal })
      if (settingsMap.seo) setSeo({ ...seo, ...settingsMap.seo })
      if (settingsMap.features) setFeatures({ ...features, ...settingsMap.features })
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (key, value) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value_json: value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

      if (error) throw error

      toast.success('Configuración guardada')
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file, settingKey, fieldKey) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${settingKey}_${fieldKey}_${Date.now()}.${fileExt}`
      const filePath = `settings/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      toast.error('Error al subir imagen')
      return null
    }
  }

  const renderBrandingTab = () => (
    <div className="space-y-6">
      {/* Logo uploads */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Logo principal */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-2">Logo principal</p>
          <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center mb-3 overflow-hidden">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <Image className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <Input
            type="url"
            placeholder="URL del logo"
            value={branding.logo_url}
            onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
            size="sm"
          />
        </div>

        {/* Logo dark */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-2">Logo (modo oscuro)</p>
          <div className="aspect-video bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center mb-3 overflow-hidden">
            {branding.logo_dark_url ? (
              <img src={branding.logo_dark_url} alt="Logo Dark" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <Image className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <Input
            type="url"
            placeholder="URL del logo oscuro"
            value={branding.logo_dark_url}
            onChange={(e) => setBranding({ ...branding, logo_dark_url: e.target.value })}
            size="sm"
          />
        </div>

        {/* Favicon */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <p className="text-sm font-medium text-slate-700 mb-2">Favicon</p>
          <div className="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center mb-3 mx-auto overflow-hidden">
            {branding.favicon_url ? (
              <img src={branding.favicon_url} alt="Favicon" className="max-h-full max-w-full object-contain" />
            ) : (
              <Image className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <Input
            type="url"
            placeholder="URL del favicon"
            value={branding.favicon_url}
            onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })}
            size="sm"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700 mb-4">Colores de marca</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Color primario</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                className="flex-1"
                size="sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Color secundario</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.secondary_color}
                onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={branding.secondary_color}
                onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                className="flex-1"
                size="sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Color acento</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                className="flex-1"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* App name & tagline */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nombre de la aplicación"
          value={branding.app_name}
          onChange={(e) => setBranding({ ...branding, app_name: e.target.value })}
          leftIcon={<Type className="w-4 h-4" />}
        />
        <Input
          label="Eslogan"
          value={branding.tagline}
          onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
          leftIcon={<Type className="w-4 h-4" />}
        />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => handleSave('branding', branding)} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar branding
        </Button>
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="space-y-6">
      {/* Contact info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Email de soporte"
          type="email"
          value={contact.support_email}
          onChange={(e) => setContact({ ...contact, support_email: e.target.value })}
          leftIcon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Email de ventas"
          type="email"
          value={contact.sales_email}
          onChange={(e) => setContact({ ...contact, sales_email: e.target.value })}
          leftIcon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Teléfono"
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          leftIcon={<Phone className="w-4 h-4" />}
        />
        <Input
          label="WhatsApp"
          value={contact.whatsapp}
          onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
          leftIcon={<MessageCircle className="w-4 h-4" />}
        />
        <Input
          label="Dirección"
          value={contact.address}
          onChange={(e) => setContact({ ...contact, address: e.target.value })}
          leftIcon={<MapPin className="w-4 h-4" />}
          className="md:col-span-2"
        />
      </div>

      {/* Social media */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700 mb-4">Redes sociales</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Instagram"
            placeholder="@usuario"
            value={contact.instagram}
            onChange={(e) => setContact({ ...contact, instagram: e.target.value })}
            leftIcon={<Instagram className="w-4 h-4" />}
          />
          <Input
            label="Facebook"
            placeholder="URL o @página"
            value={contact.facebook}
            onChange={(e) => setContact({ ...contact, facebook: e.target.value })}
            leftIcon={<Facebook className="w-4 h-4" />}
          />
          <Input
            label="Twitter / X"
            placeholder="@usuario"
            value={contact.twitter}
            onChange={(e) => setContact({ ...contact, twitter: e.target.value })}
            leftIcon={<Globe className="w-4 h-4" />}
          />
          <Input
            label="LinkedIn"
            placeholder="URL del perfil"
            value={contact.linkedin}
            onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
            leftIcon={<Globe className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => handleSave('contact', contact)} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar contacto
        </Button>
      </div>
    </div>
  )

  const renderLegalTab = () => (
    <div className="space-y-6">
      {/* Terms of service */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Términos de servicio
        </label>
        <textarea
          value={legal.terms_of_service}
          onChange={(e) => setLegal({ ...legal, terms_of_service: e.target.value })}
          rows={8}
          placeholder="Ingresa los términos de servicio en formato texto o HTML..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
        />
      </div>

      {/* Privacy policy */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Política de privacidad
        </label>
        <textarea
          value={legal.privacy_policy}
          onChange={(e) => setLegal({ ...legal, privacy_policy: e.target.value })}
          rows={8}
          placeholder="Ingresa la política de privacidad en formato texto o HTML..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
        />
      </div>

      {/* Refund policy */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Política de reembolsos
        </label>
        <textarea
          value={legal.refund_policy}
          onChange={(e) => setLegal({ ...legal, refund_policy: e.target.value })}
          rows={6}
          placeholder="Ingresa la política de reembolsos..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
        />
      </div>

      {/* Cookie policy */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Política de cookies
        </label>
        <textarea
          value={legal.cookie_policy}
          onChange={(e) => setLegal({ ...legal, cookie_policy: e.target.value })}
          rows={6}
          placeholder="Ingresa la política de cookies..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
        />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => handleSave('legal', legal)} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar textos legales
        </Button>
      </div>
    </div>
  )

  const renderSeoTab = () => (
    <div className="space-y-6">
      <Input
        label="Meta título"
        value={seo.meta_title}
        onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
        helper="Se muestra en la pestaña del navegador y resultados de Google"
        maxLength={60}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Meta descripción
        </label>
        <textarea
          value={seo.meta_description}
          onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
          rows={3}
          maxLength={160}
          placeholder="Descripción corta para motores de búsqueda..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">{seo.meta_description.length}/160 caracteres</p>
      </div>

      <Input
        label="Palabras clave"
        value={seo.keywords}
        onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
        helper="Separadas por comas"
      />

      <Input
        label="Imagen OG (Open Graph)"
        type="url"
        value={seo.og_image_url}
        onChange={(e) => setSeo({ ...seo, og_image_url: e.target.value })}
        helper="Imagen que se muestra al compartir en redes sociales (1200x630px recomendado)"
        leftIcon={<Image className="w-4 h-4" />}
      />

      {/* Preview */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700 mb-3">Vista previa en Google</p>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
            {seo.meta_title || 'Título de la página'}
          </p>
          <p className="text-green-700 text-sm">emprendego.com</p>
          <p className="text-slate-600 text-sm mt-1 line-clamp-2">
            {seo.meta_description || 'Descripción de la página...'}
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={() => handleSave('seo', seo)} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar SEO
        </Button>
      </div>
    </div>
  )

  const renderFeaturesTab = () => (
    <div className="space-y-4">
      {/* Warning for maintenance mode */}
      {features.maintenance_mode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Modo mantenimiento activo</p>
            <p className="text-sm text-amber-700">Los usuarios no podrán acceder a la plataforma mientras esté activo.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Marketplace */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Marketplace público</p>
            <p className="text-sm text-slate-500">Mostrar el directorio de tiendas</p>
          </div>
          <Toggle
            checked={features.marketplace_enabled}
            onChange={(checked) => setFeatures({ ...features, marketplace_enabled: checked })}
          />
        </div>

        {/* Support tickets */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Tickets de soporte</p>
            <p className="text-sm text-slate-500">Permitir crear tickets desde el panel</p>
          </div>
          <Toggle
            checked={features.support_tickets_enabled}
            onChange={(checked) => setFeatures({ ...features, support_tickets_enabled: checked })}
          />
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Analytics</p>
            <p className="text-sm text-slate-500">Mostrar estadísticas a los usuarios</p>
          </div>
          <Toggle
            checked={features.analytics_enabled}
            onChange={(checked) => setFeatures({ ...features, analytics_enabled: checked })}
          />
        </div>

        {/* Referral program */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Programa de referidos</p>
            <p className="text-sm text-slate-500">Habilitar sistema de referidos</p>
          </div>
          <Toggle
            checked={features.referral_program_enabled}
            onChange={(checked) => setFeatures({ ...features, referral_program_enabled: checked })}
          />
        </div>

        {/* Registration */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Registro abierto</p>
            <p className="text-sm text-slate-500">Permitir nuevos registros</p>
          </div>
          <Toggle
            checked={features.registration_enabled}
            onChange={(checked) => setFeatures({ ...features, registration_enabled: checked })}
          />
        </div>

        {/* Maintenance mode */}
        <div className="flex items-center justify-between p-4 bg-white border border-amber-300 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Modo mantenimiento</p>
            <p className="text-sm text-amber-600">⚠️ Bloquea acceso a usuarios</p>
          </div>
          <Toggle
            checked={features.maintenance_mode}
            onChange={(checked) => setFeatures({ ...features, maintenance_mode: checked })}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4">
        <Button onClick={() => handleSave('features', features)} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar funcionalidades
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'contact', label: 'Contacto', icon: Mail },
    { id: 'legal', label: 'Textos legales', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'features', label: 'Funcionalidades', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1">Administra la configuración general de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'branding' && renderBrandingTab()}
          {activeTab === 'contact' && renderContactTab()}
          {activeTab === 'legal' && renderLegalTab()}
          {activeTab === 'seo' && renderSeoTab()}
          {activeTab === 'features' && renderFeaturesTab()}
        </div>
      </div>
    </div>
  )
}

export default AdminConfiguracion
