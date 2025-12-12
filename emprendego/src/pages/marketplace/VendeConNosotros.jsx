import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Badge, Accordion, Drawer, Skeleton, EmptyState } from '../../components/ui'
import { usePlans } from '../../hooks/usePlans'
import BrandLogo from '../../components/BrandLogo'
import {
  Store,
  Rocket,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Palette,
  Globe,
  Zap,
  Menu,
  X,
  QrCode,
  Sparkles,
  TrendingUp,
  DollarSign,
  Camera,
  Layers,
  Target,
  Users,
  Clock,
  Shield,
  ChevronRight,
  Star,
  Image,
  FileText,
  PieChart,
  Smartphone,
  Share2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// ============================================
// VENDE CON NOSOTROS - Landing Page Profesional
// ============================================

// Hook para animaciones al scroll (IntersectionObserver)
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return [ref, isVisible]
}

// Componente para secciones animadas
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const [ref, isVisible] = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Colores por plan
const planColors = {
  gratis: 'border-slate-200 bg-white',
  basico: 'border-blue-200 bg-blue-50/30',
  emprendedor: 'border-purple-200 bg-purple-50/30',
  pro: 'border-amber-200 bg-amber-50/30',
}

export default function VendeConNosotros() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans()

  // Scroll suave a sección
  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // ============================================
  // DATOS ESTÁTICOS
  // ============================================

  const painPoints = [
    'Catálogo regado en fotos de WhatsApp',
    'Clientes preguntan precios todo el tiempo',
    'Sin imagen profesional ni marca',
    'Dependencia total de redes sociales',
    'No sabes si ganas o pierdes dinero',
  ]

  const solutions = [
    'Catálogo organizado con fotos y precios',
    'Link único que compartes en segundos',
    'Pedidos llegan directo a tu WhatsApp',
    'Tu marca luce profesional desde día 1',
    'Control de finanzas integrado',
  ]

  const steps = [
    {
      icon: Users,
      title: 'Regístrate gratis',
      description: 'Crea tu cuenta en 30 segundos. Sin tarjeta, sin compromisos.',
    },
    {
      icon: Camera,
      title: 'Sube tus productos',
      description: 'Agrega fotos, precios, categorías. Simple como subir a Instagram.',
    },
    {
      icon: Share2,
      title: 'Comparte tu link o QR',
      description: 'Tu tienda tiene su propio enlace y código QR para compartir.',
    },
    {
      icon: MessageCircle,
      title: 'Recibe pedidos por WhatsApp',
      description: 'Tus clientes arman su carrito y te escriben con el pedido listo.',
    },
  ]

  const modules = [
    {
      icon: ShoppingBag,
      title: 'Tienda + Catálogo',
      description: 'Productos, categorías, fotos de alta calidad. Todo organizado.',
      badge: null,
    },
    {
      icon: MessageCircle,
      title: 'Pedidos por WhatsApp',
      description: 'Carrito que genera un mensaje listo para enviar a tu número.',
      badge: null,
    },
    {
      icon: QrCode,
      title: 'QR dinámico',
      description: 'Código QR personalizable para imprimir o compartir digital.',
      badge: null,
    },
    {
      icon: Palette,
      title: 'Personalización total',
      description: 'Logo, banner, colores, plantillas. Tu tienda, tu estilo.',
      badge: 'Pro',
    },
    {
      icon: Sparkles,
      title: 'IA para publicaciones',
      description: 'Genera títulos, descripciones y mejora tus productos con IA.',
      badge: 'Pro',
    },
    {
      icon: PieChart,
      title: 'Finanzas',
      description: 'Control de ingresos, gastos y ganancia estimada. Tu mini Excel.',
      badge: 'Premium',
    },
    {
      icon: Globe,
      title: 'Marketplace',
      description: 'Aparece en nuestro directorio por ciudad y categoría.',
      badge: null,
    },
    {
      icon: BarChart3,
      title: 'Estadísticas',
      description: 'Mide visitas, productos más vistos y rendimiento.',
      badge: null,
    },
  ]

  const faqItems = [
    {
      title: '¿Puedo empezar gratis?',
      content: '¡Sí! El plan gratuito está disponible para siempre. Puedes crear tu tienda, subir productos (según los límites del plan) y recibir pedidos por WhatsApp sin pagar nada. Solo necesitas una cuenta para comenzar.',
    },
    {
      title: '¿Necesito una pasarela de pagos?',
      content: 'No. EmprendeGo no procesa pagos. Tus clientes te contactan por WhatsApp y tú coordinas el pago como prefieras: transferencia, efectivo, Nequi, etc. Tienes control total.',
    },
    {
      title: '¿Cómo llegan los pedidos?',
      content: 'Cuando un cliente agrega productos a su carrito y da click en "Pedir por WhatsApp", se genera un mensaje con el detalle del pedido que llega directo a tu WhatsApp. Tú confirmas y coordinas.',
    },
    {
      title: '¿Puedo personalizar mi tienda?',
      content: 'Sí. Puedes subir tu logo, banner, elegir colores y (en planes superiores) acceder a plantillas premium. Tu tienda refleja tu marca desde el primer día.',
    },
    {
      title: '¿Qué incluye la IA?',
      content: 'La IA te ayuda a generar títulos atractivos, descripciones de productos y a mejorar tus publicaciones con un solo click. Disponible en planes Pro y superiores.',
    },
    {
      title: '¿Qué incluye el módulo de Finanzas?',
      content: 'Puedes registrar ingresos y gastos, ver tu ganancia estimada, y llevar un control básico de tu negocio. Es como tener un mini Excel integrado. Disponible en planes Premium.',
    },
    {
      title: '¿Aparezco en el Marketplace?',
      content: 'Sí. Todas las tiendas activas aparecen en nuestro Marketplace, donde los compradores pueden buscar por ciudad, categoría o producto. Es visibilidad extra para tu negocio.',
    },
    {
      title: '¿Puedo cambiar de plan después?',
      content: 'Claro. Puedes empezar gratis y actualizar cuando tu negocio crezca. No hay penalizaciones ni contratos largos.',
    },
  ]

  const comparisonBefore = [
    'Fotos sueltas en galería',
    'Clientes preguntan precios mil veces',
    'Sin carrito ni organización',
    'Dependes solo de Instagram',
    'No sabes si ganas o pierdes',
  ]

  const comparisonAfter = [
    'Catálogo profesional con fotos y precios',
    'Un link compartible con todo tu negocio',
    'Carrito que genera pedido automático',
    'Presencia en Marketplace + redes',
    'Control de finanzas integrado',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* HEADER STICKY */}
      {/* ============================================ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <BrandLogo size="md" linkToHome />

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Inicio
              </Link>
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cómo funciona
              </button>
              <button
                onClick={() => scrollToSection('planes')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Planes
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                FAQ
              </button>
            </nav>

            {/* Botones Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth/login')}
              >
                Ingresar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/auth/registro')}
              >
                Crear tienda gratis
              </Button>
            </div>

            {/* Menú Móvil Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -mr-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Menú Móvil */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menú"
        position="right"
        size="sm"
      >
        <nav className="flex flex-col gap-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium"
          >
            Inicio
          </Link>
          <button
            onClick={() => scrollToSection('como-funciona')}
            className="px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollToSection('planes')}
            className="px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
          >
            Planes
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
          >
            FAQ
          </button>
          <hr className="my-2 border-slate-200" />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/auth/login')
            }}
          >
            Ingresar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setMobileMenuOpen(false)
              navigate('/auth/registro')
            }}
          >
            Crear tienda gratis
          </Button>
        </nav>
      </Drawer>

      {/* ============================================ */}
      {/* HERO - SECCIÓN A/B */}
      {/* ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Texto Hero */}
            <div className="text-center lg:text-left">
              {/* Badge destacado */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6 animate-pulse">
                <Zap className="w-4 h-4" />
                Empieza GRATIS hoy
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Vende por WhatsApp con una tienda que{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  se ve profesional
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Crea tu vitrina en minutos, comparte tu link o QR, y recibe pedidos por WhatsApp.
                Sin comisiones, sin complicaciones.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="xl"
                  variant="primary"
                  icon={Rocket}
                  onClick={() => navigate('/auth/registro')}
                  className="w-full sm:w-auto group"
                >
                  Crear mi tienda gratis
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('como-funciona')}
                  className="w-full sm:w-auto"
                >
                  Ver cómo funciona
                </Button>
              </div>

              {/* Social proof mini */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-8 pt-8 border-t border-slate-200">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">+100 emprendedores</p>
                  <p className="text-xs text-slate-500">ya venden con EmprendeGo</p>
                </div>
              </div>
            </div>

            {/* Mockup Visual */}
            <div className="relative">
              <AnimatedSection delay={200}>
                <div className="relative">
                  {/* Tarjeta principal - Mini tienda */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                    {/* Banner mockup */}
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                      <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                          <Store className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-12 px-6 pb-6">
                      <h3 className="text-lg font-bold text-slate-900">Mi Tienda Online</h3>
                      <p className="text-sm text-slate-500 mb-4">emprendego.shop/mi-tienda</p>

                      {/* Mini productos */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { name: 'Producto A', price: '$25.000' },
                          { name: 'Producto B', price: '$18.500' },
                        ].map((product, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                          >
                            <div className="w-full h-16 bg-slate-200 rounded-lg mb-2 flex items-center justify-center">
                              <Image className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-xs font-medium text-slate-700 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-blue-600">{product.price}</p>
                          </div>
                        ))}
                      </div>

                      {/* Botón WhatsApp */}
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        Pedir por WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Tarjetas flotantes */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100 animate-bounce-slow hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Visitas hoy</p>
                        <p className="text-lg font-bold text-slate-900">+47</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-100 hidden sm:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Código QR</p>
                        <p className="text-sm font-semibold text-slate-900">Compartir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN C - PROBLEMA Y OPORTUNIDAD */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <Badge variant="purple" size="lg" className="mb-4">
                ¿Te suena familiar?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Sabemos lo difícil que es vender sin herramientas
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Dolores */}
            <AnimatedSection delay={100}>
              <div className="bg-red-50/50 rounded-3xl p-8 border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Lo que pasa hoy</h3>
                </div>
                <ul className="space-y-4">
                  {painPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Soluciones */}
            <AnimatedSection delay={200}>
              <div className="bg-green-50/50 rounded-3xl p-8 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Lo que hace EmprendeGo</h3>
                </div>
                <ul className="space-y-4">
                  {solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-slate-700">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN D - CÓMO FUNCIONA */}
      {/* ============================================ */}
      <section id="como-funciona" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16">
              <Badge variant="blue" size="lg" className="mb-4">
                Simple y rápido
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Tu tienda lista en 4 pasos
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                No necesitas conocimientos técnicos. En menos de 5 minutos tendrás tu tienda funcionando.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="relative bg-white rounded-3xl p-6 md:p-8 border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group h-full">
                  {/* Número de paso */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7 text-blue-600" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={500}>
            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="primary"
                icon={Rocket}
                onClick={() => navigate('/auth/registro')}
                className="group"
              >
                Empezar ahora — es gratis
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN E - MÓDULOS ESTRELLA */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16">
              <Badge variant="purple" size="lg" className="mb-4">
                Todo incluido
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Herramientas que hacen crecer tu negocio
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Todo lo que necesitas para vender profesionalmente, en un solo lugar.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <AnimatedSection key={index} delay={index * 75}>
                <div className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full group">
                  {module.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={module.badge === 'Pro' ? 'purple' : 'amber'}
                        size="sm"
                      >
                        {module.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <module.icon className="w-6 h-6 text-blue-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2 pr-16">
                    {module.title}
                  </h3>
                  <p className="text-sm text-slate-600">{module.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN F - EMPIEZA GRATIS (PERSUASIVO) */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                Sin riesgo, sin compromisos
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                No necesitas pagar para comenzar
              </h2>

              <p className="text-lg md:text-xl text-slate-600 mb-8">
                Crea tu tienda gratis y pruébala sin presión. Actualiza solo cuando tu negocio lo necesite.
                Sin tarjeta de crédito, sin trucos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="xl"
                  variant="primary"
                  icon={Rocket}
                  onClick={() => navigate('/auth/registro')}
                  className="w-full sm:w-auto group"
                >
                  Crear mi tienda gratis
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Beneficios rápidos */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Gratis para siempre</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sin comisiones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN G - PLANES DINÁMICOS */}
      {/* ============================================ */}
      <section id="planes" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12 md:mb-16">
              <Badge variant="blue" size="lg" className="mb-4">
                Planes flexibles
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Empieza gratis, crece cuando quieras
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Elige el plan que se adapte a tu negocio. Siempre puedes cambiar después.
              </p>
            </div>
          </AnimatedSection>

          {/* Loading State */}
          {plansLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <Skeleton variant="text" className="w-20 h-6 mb-2" />
                  <Skeleton variant="title" className="w-32 h-10 mb-4" />
                  <Skeleton variant="text" className="w-full mb-6" />
                  <div className="space-y-3 mb-6">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} variant="text" className="w-full" />
                    ))}
                  </div>
                  <Skeleton variant="button" className="w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!plansLoading && plansError && (
            <EmptyState
              icon={AlertCircle}
              title="Error al cargar los planes"
              description="No pudimos cargar la información de los planes. Por favor, intenta nuevamente."
              action={refetchPlans}
              actionLabel="Reintentar"
            />
          )}

          {/* Plans Grid */}
          {!plansLoading && !plansError && plans.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <AnimatedSection key={plan.id} delay={index * 100}>
                  <div
                    className={`relative rounded-2xl border-2 p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                      plan.isFeatured
                        ? 'border-blue-500 bg-blue-50/30 shadow-lg scale-[1.02]'
                        : planColors[plan.slug] || 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Featured badge */}
                    {plan.isFeatured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                        Más popular
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-4">
                      <Badge
                        variant={
                          plan.slug === 'pro'
                            ? 'amber'
                            : plan.slug === 'emprendedor'
                            ? 'purple'
                            : plan.slug === 'basico'
                            ? 'blue'
                            : 'default'
                        }
                        size="md"
                        className="mb-3"
                      >
                        {plan.name}
                      </Badge>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-bold text-slate-900">
                          {plan.price === 0 ? 'Gratis' : `$${plan.price.toLocaleString()}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-slate-500 text-sm">/mes</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                    )}

                    {/* Features list */}
                    <ul className="space-y-3 mb-6 flex-grow">
                      <li className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>
                          {plan.maxProducts === -1
                            ? 'Productos ilimitados'
                            : `Hasta ${plan.maxProducts} productos`}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>
                          {plan.maxCategories === -1
                            ? 'Categorías ilimitadas'
                            : `Hasta ${plan.maxCategories} categorías`}
                        </span>
                      </li>
                      {plan.templates > 0 && (
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{plan.templates} plantillas</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Pedidos por WhatsApp</span>
                      </li>
                      {plan.features?.qr && (
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Código QR personalizado</span>
                        </li>
                      )}
                      {plan.features?.ai && (
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>IA para publicaciones</span>
                        </li>
                      )}
                      {plan.features?.finances && (
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Control de finanzas</span>
                        </li>
                      )}
                      {plan.features?.analytics && (
                        <li className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Estadísticas avanzadas</span>
                        </li>
                      )}
                    </ul>

                    {/* CTA */}
                    <Button
                      variant={plan.isFeatured ? 'primary' : 'secondary'}
                      className="w-full"
                      onClick={() => navigate('/auth/registro')}
                    >
                      {plan.price === 0 ? 'Empezar gratis' : 'Empezar'}
                    </Button>

                    {plan.price > 0 && (
                      <p className="text-xs text-slate-500 text-center mt-3">
                        Empieza gratis y actualiza cuando quieras
                      </p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN H - COMPARACIÓN ANTES VS DESPUÉS */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                El cambio que necesita tu negocio
              </h2>
            </div>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <AnimatedSection delay={100}>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl border border-slate-200 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Antes */}
                  <div className="p-8 md:border-r border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Antes</h3>
                    </div>
                    <ul className="space-y-3">
                      {comparisonBefore.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Después */}
                  <div className="p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Con EmprendeGo</h3>
                    </div>
                    <ul className="space-y-3">
                      {comparisonAfter.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN I - FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <Badge variant="blue" size="lg" className="mb-4">
                Resolvemos tus dudas
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-lg text-slate-600">
                Todo lo que necesitas saber antes de empezar
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <Accordion items={faqItems} />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="text-center mt-8">
              <p className="text-slate-600 mb-4">¿Tienes más preguntas?</p>
              <Button
                variant="outline"
                onClick={() => navigate('/auth/login')}
              >
                Contáctanos
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN J - CTA FINAL */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Únete a +100 emprendedores
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Haz que tu negocio se vea grande,
              <br className="hidden md:block" />
              aunque estés empezando
            </h2>

            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Tu próximo cliente está esperando encontrarte. Crea tu tienda hoy y empieza a vender
              de forma profesional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto group"
                onClick={() => navigate('/auth/registro')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Crear mi tienda gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={() => navigate('/')}
              >
                Volver al Marketplace
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECCIÓN K - FOOTER */}
      {/* ============================================ */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <BrandLogo size="md" variant="light" linkToHome />
              </div>
              <p className="text-slate-400 text-sm max-w-md">
                La plataforma para emprendedores que quieren vender por WhatsApp de forma
                profesional. Crea tu tienda online gratis y empieza a crecer.
              </p>
            </div>

            {/* Links rápidos */}
            <div>
              <h4 className="font-semibold text-white mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('como-funciona')}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Cómo funciona
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('planes')}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Planes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Acciones */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empezar</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/auth/registro"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Crear tienda gratis
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/login"
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Ingresar
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} EmprendeGo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Estilos para animación personalizada */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
