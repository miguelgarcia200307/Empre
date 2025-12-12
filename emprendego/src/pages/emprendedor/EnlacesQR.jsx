import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { copyToClipboard } from '../../lib/helpers'
import { QrPoster, POSTER_STYLES, QR_SIZES } from '../../components/emprendedor/qr'
import {
  Card,
  Button,
  Spinner,
} from '../../components/ui'
import {
  Copy,
  Download,
  Share2,
  ExternalLink,
  Link as LinkIcon,
  MessageCircle,
  Facebook,
  Twitter,
  Sparkles,
  Eye,
  Lock,
  Palette,
  Layout,
  Image,
  Link2,
  Users,
  Check,
} from 'lucide-react'

// ============================================
// ENLACES Y QR - Rediseño minimalista
// ============================================

const EnlacesQR = () => {
  const { store, loading: storeLoading, hasFeature } = useStore()
  const toast = useToast()
  const posterRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  
  // Verificar si tiene acceso al QR
  const hasQrAccess = hasFeature('qrCode')
  
  // Configuración del QR personalizado
  const [qrConfig, setQrConfig] = useState({
    qrSize: 256,
    qrColor: store?.primary_color || '#1f2937',
    bgColor: '#ffffff',
    brandColor: store?.primary_color || '#2563eb',
    showLogo: true,
    showUrl: true,
    showSocials: true,
    style: 'minimal',
  })

  const storeUrl = store?.slug 
    ? `${window.location.origin}/tienda/${store.slug}` 
    : ''

  // Handler con feedback visual
  const handleConfigChange = (key, value) => {
    setQrConfig(prev => ({ ...prev, [key]: value }))
    // Mostrar feedback sutil
    setFeedbackVisible(true)
    setTimeout(() => setFeedbackVisible(false), 1500)
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(storeUrl)
    if (success) {
      toast.success('¡Enlace copiado!')
    } else {
      toast.error('Error al copiar')
    }
  }

  const handleDownloadPoster = async () => {
    if (!hasQrAccess) {
      toast.error('Esta función requiere un plan superior')
      return
    }

    if (!posterRef.current) {
      toast.error('Error: No se encontró el poster')
      return
    }

    setDownloading(true)

    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      })

      const link = document.createElement('a')
      link.download = `qr-${store?.slug || 'tienda'}-emprendego.png`
      link.href = dataUrl
      link.click()

      toast.success('¡Poster descargado!')
    } catch (error) {
      console.error('Error al exportar poster:', error)
      toast.error('Error al generar imagen. Intenta con otro estilo.')
    } finally {
      setDownloading(false)
    }
  }

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`¡Mira mi catálogo! ${storeUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent('¡Conoce mi catálogo!')}`,
    },
  ]

  // Colores predefinidos para fondo
  const bgColors = [
    { value: '#ffffff', label: 'Blanco' },
    { value: '#f9fafb', label: 'Gris claro' },
    { value: '#fef3c7', label: 'Crema' },
    { value: '#dbeafe', label: 'Azul' },
    { value: '#f3e8ff', label: 'Lila' },
  ]

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enlaces y QR</h1>
        <p className="text-gray-500 mt-1">Comparte tu tienda con tus clientes</p>
      </div>

      {/* Store link card - compacta */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-xl bg-blue-50 shrink-0">
              <LinkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Tu enlace</p>
              <code className="text-sm text-gray-900 truncate block">{storeUrl}</code>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleCopyLink} icon={Copy}>
              Copiar
            </Button>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" icon={ExternalLink}>
                Abrir
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* ============================================
          QR PERSONALIZADO - LAYOUT 2 COLUMNAS
          ============================================ */}
      {hasQrAccess ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">
          {/* Columna izquierda: Configuración */}
          <section className="min-w-0 space-y-4">
            
            {/* Card A: Estilo del QR */}
            <Card className="!p-4 lg:!p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4 text-gray-400" />
                Estilo del QR
              </h3>
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {POSTER_STYLES.map((style) => {
                  const isSelected = qrConfig.style === style.id
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleConfigChange('style', style.id)}
                      className={`
                        relative p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all text-left
                        ${isSelected 
                          ? 'bg-blue-50 ring-2 ring-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className={`w-full h-8 lg:h-10 rounded-lg mb-1.5 lg:mb-2 ${style.preview}`} />
                      <p className={`text-xs lg:text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {style.name}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight hidden lg:block">{style.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Card B: Tamaño y colores */}
            <Card className="!p-4 lg:!p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                Tamaño y colores
              </h3>
              
              <div className="space-y-4">
                {/* Tamaño - Compacto */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Tamaño
                  </label>
                  <div className="flex gap-2">
                    {QR_SIZES.map((size) => {
                      const isSelected = qrConfig.qrSize === size.value
                      return (
                        <button
                          key={size.value}
                          onClick={() => handleConfigChange('qrSize', size.value)}
                          className={`
                            flex-1 py-2 px-3 rounded-lg text-center transition-all text-sm
                            ${isSelected
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {size.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Colores en grid 2 columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Color del QR */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Color del QR
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrConfig.qrColor}
                        onChange={(e) => handleConfigChange('qrColor', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={qrConfig.qrColor}
                        onChange={(e) => handleConfigChange('qrColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Color de marca */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                      Color de marca
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrConfig.brandColor}
                        onChange={(e) => handleConfigChange('brandColor', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                      />
                      <button
                        onClick={() => handleConfigChange('brandColor', store?.primary_color || '#2563eb')}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors truncate"
                      >
                        Usar mi color
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fondo - Swatches compactos */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    Color de fondo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrConfig.bgColor}
                      onChange={(e) => handleConfigChange('bgColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                    />
                    <div className="flex gap-1.5">
                      {bgColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleConfigChange('bgColor', color.value)}
                          className={`
                            w-8 h-8 rounded-lg transition-all
                            ${qrConfig.bgColor === color.value 
                              ? 'ring-2 ring-blue-500 ring-offset-1' 
                              : 'border border-gray-200 hover:scale-105'
                            }
                          `}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card C: Elementos visibles */}
            <Card className="!p-4 lg:!p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                Elementos visibles
              </h3>
              
              <div className="space-y-1">
                {/* Toggle: Logo */}
                <ToggleItem
                  icon={Image}
                  title="Logo de la tienda"
                  description="Muestra tu logo en el header"
                  checked={qrConfig.showLogo}
                  onChange={(checked) => handleConfigChange('showLogo', checked)}
                />

                {/* Divider sutil */}
                <div className="border-t border-gray-100 my-1" />

                {/* Toggle: URL */}
                <ToggleItem
                  icon={Link2}
                  title="URL de la tienda"
                  description="Muestra el enlace debajo del QR"
                  checked={qrConfig.showUrl}
                  onChange={(checked) => handleConfigChange('showUrl', checked)}
                />

                <div className="border-t border-gray-100 my-1" />

                {/* Toggle: Redes */}
                <ToggleItem
                  icon={Users}
                  title="Contacto y redes"
                  description="WhatsApp, Instagram, etc."
                  checked={qrConfig.showSocials}
                  onChange={(checked) => handleConfigChange('showSocials', checked)}
                />
              </div>
            </Card>
          </section>

          {/* Columna derecha: Vista previa - Sticky desde tablet */}
          <aside className="min-w-0 md:sticky md:top-4 lg:top-6">
            <Card className="!p-4 lg:!p-5">
                {/* Header del preview */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Vista previa</h3>
                    <p className="text-xs text-gray-500 hidden sm:block">Así se verá tu QR</p>
                  </div>
                  {/* Indicador de cambio aplicado */}
                  <div 
                    className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300
                      ${feedbackVisible 
                        ? 'bg-green-50 text-green-600 opacity-100' 
                        : 'opacity-0'
                      }
                    `}
                  >
                    <Check className="w-3 h-3" />
                    Aplicado
                  </div>
                </div>

                {/* Contenedor del preview - Responsivo */}
                <div className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 flex items-center justify-center min-h-[280px] md:min-h-[320px] lg:min-h-[360px]">
                  <div className="transform scale-[0.65] md:scale-[0.7] lg:scale-[0.8] origin-center">
                    <QrPoster
                      ref={posterRef}
                      store={store}
                      storeUrl={storeUrl}
                      config={qrConfig}
                    />
                  </div>
                </div>

                {/* Botón de descarga - Responsivo */}
                <Button
                  className="w-full mt-3 lg:mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleDownloadPoster}
                  loading={downloading}
                  icon={Download}
                >
                  <span className="md:hidden">Descargar</span>
                  <span className="hidden md:inline">Descargar Poster PNG</span>
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center hidden lg:block">
                  Alta resolución (3x) ideal para impresión
                </p>
              </Card>
          </aside>
        </div>
      ) : (
        /* Estado bloqueado - sin acceso */
        <Card className="relative overflow-hidden">
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Código QR Dinámico
            </h2>
            
            <p className="text-gray-600 max-w-md mx-auto mb-2">
              Genera códigos QR personalizados para compartir tu tienda en redes sociales, 
              tarjetas de presentación o en tu local.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Disponible desde el plan <span className="font-semibold text-amber-600">Básico</span>
            </p>
            
            <Link to="/panel/plan">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Mejorar mi plan
              </Button>
            </Link>
          </div>
          
          {/* Preview difuminado de fondo */}
          <div className="absolute inset-0 -z-10 opacity-5 blur-sm pointer-events-none">
            <div className="flex items-center justify-center h-full">
              <QRCodeSVG value={storeUrl} size={200} />
            </div>
          </div>
        </Card>
      )}

      {/* Compartir en redes - Compacto */}
      <Card className="!p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-50">
            <Share2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Compartir en redes</h2>
            <p className="text-sm text-gray-500">Difunde tu tienda en tus redes sociales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 p-3 rounded-xl text-white font-medium transition-colors ${link.color}`}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Tips - Más compactos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TipCard
          emoji="📱"
          title="WhatsApp Business"
          description="Agrega el enlace en tu estado y perfil"
        />
        <TipCard
          emoji="🖨️"
          title="Imprime el Poster"
          description={hasQrAccess ? 'Usa el QR en tu local o tarjetas' : 'Mejora tu plan para acceder'}
        />
        <TipCard
          emoji="📸"
          title="Instagram Bio"
          description="Agrega el enlace en tu biografía"
        />
      </div>
    </div>
  )
}

// ============================================
// COMPONENTES INTERNOS
// ============================================

/**
 * ToggleItem - Item de toggle minimalista y compacto
 */
function ToggleItem({ icon: Icon, title, description, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg lg:rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-gray-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 hidden lg:block">{description}</p>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-5 w-9 lg:h-6 lg:w-11 items-center rounded-full transition-colors
            ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-3.5 w-3.5 lg:h-4 lg:w-4 transform rounded-full bg-white shadow-sm transition-transform
              ${checked ? 'translate-x-4 lg:translate-x-6' : 'translate-x-0.5 lg:translate-x-1'}
            `}
          />
        </button>
      </div>
    </label>
  )
}

/**
 * TipCard - Card de tip compacta
 */
function TipCard({ emoji, title, description }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default EnlacesQR
