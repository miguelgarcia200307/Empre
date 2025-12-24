import { memo } from 'react'
import { 
  Store, 
  MapPin, 
  Clock, 
  Phone, 
  Instagram, 
  Facebook, 
  CreditCard, 
  Truck, 
  Rocket,
  Globe,
  Mail
} from 'lucide-react'
import { getCardClasses, withAlpha } from './themeUtils'

/**
 * StoreFooter - Premium store footer component
 * Features: Contact info, social links, payment methods, delivery info in card layout
 */
const StoreFooter = memo(function StoreFooter({
  store,
  theme,
  primaryColor,
}) {
  const hasContactInfo = store.address || store.business_hours || store.whatsapp
  const hasSocialLinks = store.social_links && Object.keys(store.social_links).length > 0
  const hasPaymentMethods = store.payment_methods && store.payment_methods.length > 0
  const hasDeliveryInfo = store.delivery_info
  
  // Si no hay info adicional, no renderizar
  if (!hasContactInfo && !hasSocialLinks && !hasPaymentMethods && !hasDeliveryInfo) {
    return <PoweredByFooter store={store} primaryColor={primaryColor} />
  }

  // Parsear business_hours si es JSONB
  const businessHoursText = typeof store.business_hours === 'object' 
    ? store.business_hours?.text 
    : store.business_hours

  const cardClasses = getCardClasses(theme?.cardsStyle)

  return (
    <footer className="mt-10 sm:mt-12 pt-8">
      <div className={`overflow-hidden ${cardClasses}`}>
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: withAlpha(primaryColor, 0.12) }}
            >
              <Store className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Información de la tienda
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Contacta y conoce más sobre {store.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Contact Block */}
            {(store.whatsapp || store.address || store.city) && (
              <div className="bg-gray-50/80 rounded-xl border border-gray-100/80 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                    Contacto
                  </span>
                </div>
                
                <div className="space-y-3">
                  {/* Location */}
                  {(store.address || store.city) && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-gray-100 shrink-0 shadow-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {[store.address, store.city].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Business Hours */}
                  {businessHoursText && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-gray-100 shrink-0 shadow-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Horario</p>
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                          {businessHoursText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp CTA */}
                  {store.whatsapp && (
                    <div className="pt-2">
                      <a 
                        href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md hover:shadow-lg"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <Phone className="w-4 h-4" />
                        Escribir por WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links Block */}
            {hasSocialLinks && (
              <div className="bg-gray-50/80 rounded-xl border border-gray-100/80 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                    Síguenos
                  </span>
                </div>
                
                <div className="space-y-2">
                  {store.social_links.instagram && (
                    <SocialLink
                      icon={Instagram}
                      iconBg="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
                      label="Instagram"
                      value={`@${store.social_links.instagram.replace('@', '')}`}
                      href={`https://instagram.com/${store.social_links.instagram.replace('@', '')}`}
                    />
                  )}
                  
                  {store.social_links.facebook && (
                    <SocialLink
                      icon={Facebook}
                      iconBg="bg-blue-600"
                      label="Facebook"
                      value="Ver página"
                      href={store.social_links.facebook.startsWith('http') 
                        ? store.social_links.facebook 
                        : `https://facebook.com/${store.social_links.facebook}`}
                    />
                  )}

                  {store.social_links.tiktok && (
                    <SocialLink
                      icon={() => (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      )}
                      iconBg="bg-black"
                      label="TikTok"
                      value={`@${store.social_links.tiktok.replace('@', '')}`}
                      href={`https://tiktok.com/@${store.social_links.tiktok.replace('@', '')}`}
                    />
                  )}

                  {store.social_links.website && (
                    <SocialLink
                      icon={Globe}
                      iconBg="bg-gray-700"
                      label="Website"
                      value="Visitar sitio"
                      href={store.social_links.website.startsWith('http') 
                        ? store.social_links.website 
                        : `https://${store.social_links.website}`}
                    />
                  )}

                  {store.social_links.email && (
                    <SocialLink
                      icon={Mail}
                      iconBg="bg-red-500"
                      label="Email"
                      value={store.social_links.email}
                      href={`mailto:${store.social_links.email}`}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Payment & Delivery Block */}
            {(hasPaymentMethods || hasDeliveryInfo) && (
              <div className="bg-gray-50/80 rounded-xl border border-gray-100/80 p-4">
                {hasPaymentMethods && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        Métodos de pago
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {store.payment_methods.map((method, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 shadow-sm"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasDeliveryInfo && (
                  <div className={hasPaymentMethods ? 'pt-4 border-t border-gray-200' : ''}>
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                        Envíos
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {store.delivery_info}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Powered by EmprendeGo */}
        <PoweredByFooter store={store} primaryColor={primaryColor} inline />
      </div>
    </footer>
  )
})

/**
 * SocialLink - Social media link component
 */
const SocialLink = memo(function SocialLink({ icon: Icon, iconBg, label, value, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all group shadow-sm"
    >
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {typeof Icon === 'function' && Icon.prototype ? (
          <Icon className="w-4 h-4 text-white" />
        ) : (
          <Icon />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
          {value}
        </p>
      </div>
    </a>
  )
})

/**
 * PoweredByFooter - EmprendeGo branding footer
 */
const PoweredByFooter = memo(function PoweredByFooter({ store, primaryColor, inline = false }) {
  // Don't show for PRO plan
  if (store.plan === 'pro') return null

  const content = (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      {/* Logo + Text */}
      <div className="flex items-center gap-2 text-gray-500">
        <div 
          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
        >
          E
        </div>
        <span className="text-xs sm:text-sm">
          Creado con{' '}
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold hover:underline transition-colors"
            style={{ color: primaryColor }}
          >
            EmprendeGo
          </a>
        </span>
      </div>
      
      {/* Divider */}
      <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
      
      {/* CTA */}
      <a
        href="/vende-con-nosotros"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs font-medium text-gray-600 hover:text-gray-900 transition-all shadow-sm"
      >
        <Rocket className="w-3.5 h-3.5" />
        Crea tu tienda gratis
      </a>
    </div>
  )

  if (inline) {
    return (
      <div className="px-5 sm:px-6 py-5 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
        {content}
      </div>
    )
  }

  return (
    <div className="mt-10 sm:mt-12 py-6">
      {content}
    </div>
  )
})

export default StoreFooter
