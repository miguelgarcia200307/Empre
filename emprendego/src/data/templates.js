/**
 * Catálogo de Plantillas Prediseñadas - EmprendeGo
 * 
 * Cada plantilla define:
 * - Paleta de colores completa
 * - Tipografía
 * - Estilos de layout (header, cards, buttons)
 * - Industria/categoría
 */

// ============================================
// FUENTES DISPONIBLES
// ============================================
export const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { id: 'poppins', name: 'Poppins', value: 'Poppins, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', value: 'Montserrat, sans-serif' },
]

// ============================================
// ESTILOS DE BOTONES
// ============================================
export const BUTTON_STYLES = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-lg',
}

// ============================================
// ESTILOS DE CARDS
// ============================================
export const CARD_STYLES = {
  soft: 'rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm',
  bordered: 'rounded-xl border border-gray-200 bg-white shadow-none',
  elevated: 'rounded-2xl shadow-lg border-0 bg-white',
}

// ============================================
// ESTILOS DE HEADER
// ============================================
export const HEADER_STYLES = {
  glass: 'backdrop-blur-lg bg-white/80 border-b border-gray-100',
  solid: 'bg-white border-b border-gray-200',
  minimal: 'bg-transparent border-b-0',
}

// ============================================
// INDUSTRIAS / CATEGORÍAS
// ============================================
export const INDUSTRIES = [
  { id: 'all', name: 'Todas', icon: '✨' },
  { id: 'maquillaje', name: 'Maquillaje', icon: '💄' },
  { id: 'perfumes', name: 'Perfumes', icon: '🌸' },
  { id: 'tecnologia', name: 'Tecnología', icon: '📱' },
  { id: 'relojes', name: 'Relojes', icon: '⌚' },
  { id: 'accesorios', name: 'Accesorios', icon: '💍' },
  { id: 'ropa', name: 'Ropa', icon: '👕' },
  { id: 'comida', name: 'Comida', icon: '🍕' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'minimal', name: 'Minimal', icon: '⚪' },
]

// ============================================
// CATÁLOGO DE PLANTILLAS
// ============================================
export const TEMPLATES = [
  // ----------------------------------------
  // MAQUILLAJE
  // ----------------------------------------
  {
    id: 'beauty-rose-minimal',
    name: 'Rose Beauty',
    description: 'Elegante y femenino, perfecto para cosméticos y maquillaje',
    industry: 'maquillaje',
    tags: ['elegante', 'femenino', 'rosa'],
    tier: 'basic', // Disponible desde básico
    palette: {
      primary: '#E11D48',
      secondary: '#EC4899',
      accent: '#F43F5E',
      background: '#FFF1F2',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 600,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'pill',
      radius: '2xl',
    },
  },
  {
    id: 'beauty-gold-luxe',
    name: 'Gold Luxe',
    description: 'Sofisticado con toques dorados para marcas premium',
    industry: 'maquillaje',
    tags: ['lujo', 'dorado', 'premium'],
    tier: 'pro',
    palette: {
      primary: '#B45309',
      secondary: '#D97706',
      accent: '#F59E0B',
      background: '#FFFBEB',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      headingWeight: 700,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'elevated',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
  },

  // ----------------------------------------
  // PERFUMES
  // ----------------------------------------
  {
    id: 'perfume-lavender-dream',
    name: 'Lavender Dream',
    description: 'Suave y aromático, ideal para fragancias y perfumería',
    industry: 'perfumes',
    tags: ['suave', 'lavanda', 'aromático'],
    tier: 'basic',
    palette: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      accent: '#8B5CF6',
      background: '#FAF5FF',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'pill',
      radius: '2xl',
    },
  },
  {
    id: 'perfume-noir-elegance',
    name: 'Noir Elegance',
    description: 'Oscuro y misterioso para fragancias exclusivas',
    industry: 'perfumes',
    tags: ['oscuro', 'elegante', 'misterioso'],
    tier: 'pro',
    palette: {
      primary: '#18181B',
      secondary: '#3F3F46',
      accent: '#A855F7',
      background: '#FAFAFA',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      headingWeight: 600,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'bordered',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },

  // ----------------------------------------
  // TECNOLOGÍA
  // ----------------------------------------
  {
    id: 'tech-blue-modern',
    name: 'Tech Blue',
    description: 'Moderno y tecnológico con azul vibrante',
    industry: 'tecnologia',
    tags: ['moderno', 'azul', 'tech'],
    tier: 'basic',
    palette: {
      primary: '#2563EB',
      secondary: '#3B82F6',
      accent: '#0EA5E9',
      background: '#F0F9FF',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 600,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'bordered',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
  },
  {
    id: 'tech-dark-pro',
    name: 'Dark Pro',
    description: 'Tema oscuro profesional para gadgets y tecnología',
    industry: 'tecnologia',
    tags: ['oscuro', 'profesional', 'premium'],
    tier: 'pro',
    palette: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#22D3EE',
      background: '#0F172A',
      surface: '#1E293B',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 700,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'bordered',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
    isDark: true,
  },

  // ----------------------------------------
  // RELOJES
  // ----------------------------------------
  {
    id: 'watches-classic-silver',
    name: 'Classic Silver',
    description: 'Clásico y atemporal para relojes de lujo',
    industry: 'relojes',
    tags: ['clásico', 'plata', 'elegante'],
    tier: 'basic',
    palette: {
      primary: '#475569',
      secondary: '#64748B',
      accent: '#94A3B8',
      background: '#F8FAFC',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'minimal',
      cardsStyle: 'elevated',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },

  // ----------------------------------------
  // ACCESORIOS (Manillas, joyería)
  // ----------------------------------------
  {
    id: 'accessories-emerald-chic',
    name: 'Emerald Chic',
    description: 'Verde esmeralda sofisticado para joyería y accesorios',
    industry: 'accesorios',
    tags: ['verde', 'sofisticado', 'joyería'],
    tier: 'basic',
    palette: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#ECFDF5',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'pill',
      radius: '2xl',
    },
  },
  {
    id: 'accessories-coral-summer',
    name: 'Coral Summer',
    description: 'Vibrante y veraniego para accesorios de moda',
    industry: 'accesorios',
    tags: ['coral', 'verano', 'vibrante'],
    tier: 'emprendedor',
    palette: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FDBA74',
      background: '#FFF7ED',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 600,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'elevated',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
  },

  // ----------------------------------------
  // ROPA
  // ----------------------------------------
  {
    id: 'fashion-urban-street',
    name: 'Urban Street',
    description: 'Estilo urbano y streetwear',
    industry: 'ropa',
    tags: ['urbano', 'street', 'moderno'],
    tier: 'basic',
    palette: {
      primary: '#18181B',
      secondary: '#27272A',
      accent: '#EF4444',
      background: '#FAFAFA',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 700,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'bordered',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },
  {
    id: 'fashion-soft-pastel',
    name: 'Soft Pastel',
    description: 'Colores pastel suaves para moda femenina',
    industry: 'ropa',
    tags: ['pastel', 'suave', 'femenino'],
    tier: 'emprendedor',
    palette: {
      primary: '#DB2777',
      secondary: '#EC4899',
      accent: '#F9A8D4',
      background: '#FDF2F8',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'pill',
      radius: '2xl',
    },
  },

  // ----------------------------------------
  // COMIDA
  // ----------------------------------------
  {
    id: 'food-fresh-organic',
    name: 'Fresh Organic',
    description: 'Fresco y natural para comida saludable',
    industry: 'comida',
    tags: ['fresco', 'orgánico', 'natural'],
    tier: 'basic',
    palette: {
      primary: '#16A34A',
      secondary: '#22C55E',
      accent: '#4ADE80',
      background: '#F0FDF4',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 600,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
  },
  {
    id: 'food-warm-bakery',
    name: 'Warm Bakery',
    description: 'Cálido y acogedor para panaderías y repostería',
    industry: 'comida',
    tags: ['cálido', 'panadería', 'dulce'],
    tier: 'emprendedor',
    palette: {
      primary: '#B45309',
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#FFFBEB',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'elevated',
      buttonsStyle: 'rounded',
      radius: 'xl',
    },
  },

  // ----------------------------------------
  // FITNESS
  // ----------------------------------------
  {
    id: 'fitness-energy-boost',
    name: 'Energy Boost',
    description: 'Energético y dinámico para fitness y deporte',
    industry: 'fitness',
    tags: ['energético', 'fitness', 'dinámico'],
    tier: 'basic',
    palette: {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#F97316',
      background: '#FEF2F2',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 700,
    },
    layout: {
      headerStyle: 'solid',
      cardsStyle: 'bordered',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },

  // ----------------------------------------
  // HOGAR
  // ----------------------------------------
  {
    id: 'home-nordic-calm',
    name: 'Nordic Calm',
    description: 'Minimalista nórdico para decoración del hogar',
    industry: 'hogar',
    tags: ['nórdico', 'minimal', 'hogar'],
    tier: 'emprendedor',
    palette: {
      primary: '#78716C',
      secondary: '#A8A29E',
      accent: '#0EA5E9',
      background: '#FAFAF9',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 400,
    },
    layout: {
      headerStyle: 'minimal',
      cardsStyle: 'soft',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },

  // ----------------------------------------
  // MINIMAL (Genéricos)
  // ----------------------------------------
  {
    id: 'minimal-clean-white',
    name: 'Clean White',
    description: 'Ultra minimalista, limpio y profesional',
    industry: 'minimal',
    tags: ['blanco', 'limpio', 'minimal'],
    tier: 'basic',
    palette: {
      primary: '#171717',
      secondary: '#404040',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#FAFAFA',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'minimal',
      cardsStyle: 'bordered',
      buttonsStyle: 'square',
      radius: 'lg',
    },
  },
  {
    id: 'minimal-ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Azul océano relajante y versátil',
    industry: 'minimal',
    tags: ['azul', 'océano', 'relajante'],
    tier: 'basic',
    palette: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      background: '#ECFEFF',
      surface: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      headingWeight: 500,
    },
    layout: {
      headerStyle: 'glass',
      cardsStyle: 'soft',
      buttonsStyle: 'pill',
      radius: '2xl',
    },
  },
]

// ============================================
// HELPERS
// ============================================

/**
 * Obtener plantilla por ID
 */
export const getTemplateById = (templateId) => {
  return TEMPLATES.find(t => t.id === templateId) || null
}

/**
 * Filtrar plantillas por industria
 */
export const getTemplatesByIndustry = (industryId) => {
  if (!industryId || industryId === 'all') {
    return TEMPLATES
  }
  return TEMPLATES.filter(t => t.industry === industryId)
}

/**
 * Buscar plantillas por nombre o tags
 */
export const searchTemplates = (query) => {
  if (!query) return TEMPLATES
  
  const normalizedQuery = query.toLowerCase().trim()
  return TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(normalizedQuery) ||
    t.description.toLowerCase().includes(normalizedQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  )
}

/**
 * Verificar si el usuario puede usar una plantilla según su plan
 */
export const canUseTemplate = (template, plan, currentTemplateIndex = 0) => {
  // Sin templates = no puede usar ninguna
  if (!plan?.features?.templates) {
    return { allowed: false, reason: 'upgrade' }
  }
  
  // -1 = ilimitado
  if (plan.templates === -1) {
    return { allowed: true }
  }
  
  // Verificar tier de la plantilla
  const tierOrder = { basic: 1, emprendedor: 2, pro: 3 }
  const planTier = plan.slug || 'gratis'
  const templateTier = template.tier || 'basic'
  
  // Si el plan no tiene suficiente tier
  if (tierOrder[templateTier] > tierOrder[planTier]) {
    return { allowed: false, reason: 'tier', requiredTier: templateTier }
  }
  
  // Verificar límite numérico
  if (plan.templates > 0 && currentTemplateIndex >= plan.templates) {
    return { allowed: false, reason: 'limit', limit: plan.templates }
  }
  
  return { allowed: true }
}

/**
 * Aplicar overrides a una plantilla
 */
export const applyTemplateOverrides = (template, overrides = {}) => {
  if (!template) return null
  
  return {
    ...template,
    palette: {
      ...template.palette,
      ...(overrides.palette || {}),
    },
    typography: {
      ...template.typography,
      ...(overrides.typography || {}),
    },
    layout: {
      ...template.layout,
      ...(overrides.layout || {}),
    },
  }
}

/**
 * Generar theme desde store (con o sin plantilla)
 */
export const generateThemeFromStore = (store) => {
  if (!store) return getDefaultTheme()
  
  // Si tiene plantilla, usarla como base
  if (store.template_id) {
    const template = getTemplateById(store.template_id)
    if (template) {
      const withOverrides = applyTemplateOverrides(template, store.template_overrides || {})
      return {
        primary: withOverrides.palette.primary,
        secondary: withOverrides.palette.secondary,
        accent: withOverrides.palette.accent || withOverrides.palette.primary,
        background: withOverrides.palette.background,
        surface: withOverrides.palette.surface,
        fontFamily: withOverrides.typography.fontFamily,
        headingWeight: withOverrides.typography.headingWeight,
        headerStyle: withOverrides.layout.headerStyle,
        cardsStyle: withOverrides.layout.cardsStyle,
        buttonsStyle: withOverrides.layout.buttonsStyle,
        radius: withOverrides.layout.radius,
        isDark: withOverrides.isDark || false,
      }
    }
  }
  
  // Sin plantilla, usar colores del store directamente
  return {
    primary: store.primary_color || '#2563eb',
    secondary: store.secondary_color || '#7c3aed',
    accent: store.accent_color || store.primary_color || '#f59e0b',
    background: '#f9fafb',
    surface: '#ffffff',
    fontFamily: store.font_family || 'Inter, system-ui, sans-serif',
    headingWeight: 600,
    headerStyle: 'glass',
    cardsStyle: 'soft',
    buttonsStyle: 'rounded',
    radius: 'xl',
    isDark: false,
  }
}

/**
 * Theme por defecto
 */
export const getDefaultTheme = () => ({
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#f59e0b',
  background: '#f9fafb',
  surface: '#ffffff',
  fontFamily: 'Inter, system-ui, sans-serif',
  headingWeight: 600,
  headerStyle: 'glass',
  cardsStyle: 'soft',
  buttonsStyle: 'rounded',
  radius: 'xl',
  isDark: false,
})
