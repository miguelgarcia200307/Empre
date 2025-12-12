import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Instagram, Facebook, Phone, Globe } from 'lucide-react'

/**
 * QrPoster - Componente de vista previa del poster QR personalizado
 * 
 * Este componente renderiza el "poster" completo que se exportará como imagen.
 * Incluye: logo, nombre de tienda, QR, URL, redes sociales.
 * 
 * IMPORTANTE para CORS del logo:
 * - Si el logo viene de Supabase Storage, debería funcionar sin problemas.
 * - Si hay errores de CORS al exportar, usar crossOrigin="anonymous" en <img>
 * - Como fallback, mostramos un avatar con inicial si el logo falla.
 * 
 * Para agregar más estilos:
 * 1. Agregar nuevo objeto en POSTER_STYLES en QrCustomizer.jsx
 * 2. Agregar case en getStyleClasses() de este componente
 */

const QrPoster = forwardRef(({ 
  store, 
  storeUrl, 
  config 
}, ref) => {
  const {
    qrSize = 256,
    qrColor = '#1f2937',
    bgColor = '#ffffff',
    brandColor = '#2563eb',
    showLogo = true,
    showUrl = true,
    showSocials = true,
    style = 'minimal',
  } = config

  // Obtener clases según el estilo seleccionado
  const getStyleClasses = () => {
    switch (style) {
      case 'brand':
        return {
          container: 'rounded-3xl shadow-2xl',
          bg: `bg-gradient-to-br from-white via-white to-blue-50`,
          border: `border-4`,
          borderColor: brandColor,
          headerBg: `bg-gradient-to-r`,
          headerFrom: brandColor,
          headerTo: adjustColor(brandColor, 20),
          headerText: 'text-white',
          qrBg: 'bg-white',
          footerText: 'text-gray-600',
        }
      case 'poster':
        return {
          container: 'rounded-2xl shadow-2xl',
          bg: 'bg-white',
          border: 'border-2 border-gray-200',
          borderColor: 'transparent',
          headerBg: 'bg-gray-900',
          headerFrom: '#1f2937',
          headerTo: '#374151',
          headerText: 'text-white',
          qrBg: 'bg-white',
          footerText: 'text-gray-500',
          cta: true,
        }
      case 'minimal':
      default:
        return {
          container: 'rounded-2xl shadow-lg',
          bg: 'bg-white',
          border: 'border border-gray-200',
          borderColor: 'transparent',
          headerBg: 'bg-gray-50',
          headerFrom: '#f9fafb',
          headerTo: '#f3f4f6',
          headerText: 'text-gray-900',
          qrBg: 'bg-white',
          footerText: 'text-gray-500',
        }
    }
  }

  const styles = getStyleClasses()
  
  // Extraer redes sociales del store (si existen)
  const socialLinks = store?.social_links || {}
  const hasSocials = socialLinks.instagram || socialLinks.facebook || socialLinks.tiktok
  
  // Formatear URL para mostrar (más corta y legible)
  const displayUrl = storeUrl
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')

  // Nombre de la tienda
  const storeName = store?.name || store?.slug || 'Mi Tienda'
  
  // Inicial para fallback del logo
  const initial = storeName.charAt(0).toUpperCase()

  return (
    <div
      ref={ref}
      className={`
        inline-flex flex-col overflow-hidden
        ${styles.container} ${styles.bg} ${styles.border}
      `}
      style={{ 
        backgroundColor: bgColor,
        borderColor: styles.borderColor !== 'transparent' ? brandColor : undefined,
        // Ancho fijo para que la exportación sea consistente
        width: style === 'poster' ? '400px' : '340px',
      }}
    >
      {/* Header con logo y nombre */}
      <div 
        className={`px-6 py-5 ${styles.headerText}`}
        style={{ 
          background: style === 'brand' || style === 'poster'
            ? `linear-gradient(135deg, ${styles.headerFrom}, ${styles.headerTo})`
            : styles.headerBg === 'bg-gray-50' ? '#f9fafb' : styles.headerBg
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo o fallback */}
          {showLogo && (
            <div className="shrink-0">
              {store?.logo_url && store.logo_url.startsWith('http') ? (
                <img
                  src={store.logo_url}
                  alt={storeName}
                  crossOrigin="anonymous"
                  className="w-14 h-14 rounded-xl object-cover bg-white shadow-sm"
                  onError={(e) => {
                    // Fallback: ocultar imagen si falla CORS
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              {/* Fallback avatar - siempre renderizado pero oculto si hay logo */}
              <div 
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm ${
                  !store?.logo_url || !store.logo_url.startsWith('http') ? 'flex' : 'hidden'
                }`}
                style={{ 
                  backgroundColor: style === 'minimal' ? brandColor : 'white',
                  color: style === 'minimal' ? 'white' : brandColor,
                }}
              >
                {initial}
              </div>
            </div>
          )}
          
          {/* Nombre de la tienda */}
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-bold truncate ${styles.headerText}`}>
              {storeName}
            </h2>
            {store?.description && (
              <p className={`text-sm truncate opacity-80 ${styles.headerText}`}>
                {store.description.substring(0, 40)}
                {store.description.length > 40 ? '...' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center px-6 py-8" style={{ backgroundColor: bgColor }}>
        {/* CTA para estilo poster */}
        {styles.cta && (
          <p className="text-gray-900 font-semibold text-lg mb-4 text-center">
            Escanea para ver el catálogo
          </p>
        )}
        
        <div 
          className={`p-4 rounded-2xl ${styles.qrBg}`}
          style={{ 
            boxShadow: style !== 'minimal' ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
            border: style === 'minimal' ? '1px solid #e5e7eb' : 'none',
          }}
        >
          <QRCodeSVG
            value={storeUrl}
            size={qrSize}
            level="H"
            includeMargin={false}
            fgColor={qrColor}
            bgColor="transparent"
          />
        </div>

        {/* URL debajo del QR */}
        {showUrl && (
          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{displayUrl}</span>
          </div>
        )}
      </div>

      {/* Footer con redes sociales y contacto */}
      {showSocials && (hasSocials || store?.whatsapp) && (
        <div 
          className="px-6 py-4 border-t border-gray-100"
          style={{ backgroundColor: style === 'brand' ? adjustColor(brandColor, 95) : '#f9fafb' }}
        >
          <div className="flex items-center justify-center gap-4">
            {/* Instagram */}
            {socialLinks.instagram && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Instagram className="w-4 h-4" />
                <span className="text-sm">@{socialLinks.instagram.replace('@', '')}</span>
              </div>
            )}
            
            {/* Facebook */}
            {socialLinks.facebook && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Facebook className="w-4 h-4" />
                <span className="text-sm">{socialLinks.facebook}</span>
              </div>
            )}
            
            {/* WhatsApp / Teléfono */}
            {store?.whatsapp && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{store.whatsapp}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Powered by EmprendeGo (solo si el plan lo requiere) */}
      <div className="px-6 py-2 text-center" style={{ backgroundColor: bgColor }}>
        <span className="text-xs text-gray-400">
          Creado con EmprendeGo
        </span>
      </div>
    </div>
  )
})

// Función auxiliar para ajustar colores (lighten/darken)
function adjustColor(color, percent) {
  // Si percent > 50, lightening; si < 50, darkening
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}

QrPoster.displayName = 'QrPoster'

export default QrPoster
