/**
 * Theme Utilities for TiendaPublica
 * Provides helpers for consistent theme application across components
 */

/**
 * Calculate relative luminance of a color
 * Used to determine if text should be light or dark
 */
export const getLuminance = (hex) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert hex to RGB
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Determine if text should be light or dark based on background
 */
export const getContrastText = (backgroundColor) => {
  const luminance = getLuminance(backgroundColor)
  return luminance > 0.5 ? '#1f2937' : '#ffffff'
}

/**
 * Generate alpha variation of a color
 */
export const withAlpha = (hex, alpha) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Lighten a color
 */
export const lighten = (hex, amount = 0.2) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const newR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))
  const newG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))
  const newB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Darken a color
 */
export const darken = (hex, amount = 0.2) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const newR = Math.max(0, Math.round(rgb.r * (1 - amount)))
  const newG = Math.max(0, Math.round(rgb.g * (1 - amount)))
  const newB = Math.max(0, Math.round(rgb.b * (1 - amount)))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Generate CSS custom properties object from theme
 */
export const generateCSSVariables = (theme) => {
  if (!theme) return {}
  
  const primary = theme.primary || '#2563eb'
  const secondary = theme.secondary || '#7c3aed'
  const accent = theme.accent || primary
  
  return {
    '--eg-primary': primary,
    '--eg-primary-light': lighten(primary, 0.9),
    '--eg-primary-dark': darken(primary, 0.15),
    '--eg-secondary': secondary,
    '--eg-accent': accent,
    '--eg-bg': theme.background || '#f9fafb',
    '--eg-surface': theme.surface || '#ffffff',
    '--eg-font': theme.fontFamily || 'Inter, system-ui, sans-serif',
    '--eg-radius': theme.radius === '2xl' ? '1rem' : theme.radius === 'xl' ? '0.75rem' : '0.5rem',
    '--eg-primary-text': getContrastText(primary),
    '--eg-primary-alpha-10': withAlpha(primary, 0.1),
    '--eg-primary-alpha-20': withAlpha(primary, 0.2),
    '--eg-primary-alpha-50': withAlpha(primary, 0.5),
  }
}

/**
 * Get button style classes based on theme
 */
export const getButtonClasses = (buttonsStyle) => {
  switch (buttonsStyle) {
    case 'pill': return 'rounded-full'
    case 'rounded': return 'rounded-xl'
    case 'square': return 'rounded-lg'
    default: return 'rounded-xl'
  }
}

/**
 * Get card style classes based on theme
 */
export const getCardClasses = (cardsStyle) => {
  switch (cardsStyle) {
    case 'soft': return 'rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm'
    case 'bordered': return 'rounded-xl border border-gray-200 bg-white shadow-none'
    case 'elevated': return 'rounded-2xl shadow-lg border-0 bg-white'
    default: return 'rounded-2xl shadow-sm bg-white border border-gray-100'
  }
}

/**
 * Get header style classes based on theme
 */
export const getHeaderClasses = (headerStyle) => {
  switch (headerStyle) {
    case 'glass': return 'backdrop-blur-xl bg-white/80 border-b border-white/30 shadow-sm'
    case 'solid': return 'bg-white border-b border-gray-200 shadow-sm'
    case 'minimal': return 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
    default: return 'backdrop-blur-xl bg-white/80 border-b border-white/30 shadow-sm'
  }
}
