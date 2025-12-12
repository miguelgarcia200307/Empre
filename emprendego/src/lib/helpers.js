// Genera un slug a partir de un texto
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Formatea un precio en formato colombiano
export const formatPrice = (price, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Formatea una fecha
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }
  return new Intl.DateTimeFormat('es-CO', defaultOptions).format(new Date(date))
}

// Formatea fecha relativa (hace X tiempo)
export const formatRelativeTime = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(date)
}

// Copia texto al portapapeles
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Error al copiar:', err)
    return false
  }
}

// Valida un email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Valida un número de teléfono colombiano
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return /^(3\d{9}|60\d{8})$/.test(cleaned)
}

// Formatea un número de teléfono para WhatsApp
export const formatWhatsAppNumber = (phone, countryCode = '57') => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith(countryCode)) {
    return cleaned
  }
  return `${countryCode}${cleaned}`
}

// Genera mensaje de WhatsApp para pedido
export const generateWhatsAppMessage = (storeName, products, customerName = '') => {
  let message = `¡Hola! 👋\n\nQuiero hacer un pedido en *${storeName}*:\n\n`
  
  let total = 0
  products.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad
    total += subtotal
    message += `${index + 1}. ${item.nombre} x${item.cantidad} - ${formatPrice(subtotal)}\n`
  })
  
  message += `\n💰 *Total: ${formatPrice(total)}*`
  
  if (customerName) {
    message += `\n\nMi nombre es: ${customerName}`
  }
  
  message += '\n\n¡Gracias! 🙏'
  
  return encodeURIComponent(message)
}

// Genera URL de WhatsApp
export const generateWhatsAppUrl = (phone, message) => {
  const formattedPhone = formatWhatsAppNumber(phone)
  return `https://wa.me/${formattedPhone}?text=${message}`
}

// Trunca texto
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Paletas de colores predefinidas para tiendas
export const colorPalettes = [
  {
    id: 'moderna',
    name: 'Moderna',
    primary: '#2563eb',
    secondary: '#7c3aed',
    accent: '#06b6d4',
  },
  {
    id: 'natural',
    name: 'Natural',
    primary: '#059669',
    secondary: '#84cc16',
    accent: '#f59e0b',
  },
  {
    id: 'elegante',
    name: 'Elegante',
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#d97706',
  },
  {
    id: 'coral',
    name: 'Coral',
    primary: '#f43f5e',
    secondary: '#ec4899',
    accent: '#8b5cf6',
  },
  {
    id: 'oceano',
    name: 'Océano',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#10b981',
  },
]

// Categorías de gastos/ingresos para finanzas
export const financialCategories = {
  ingresos: [
    { id: 'ventas', name: 'Ventas', icon: '💰' },
    { id: 'servicios', name: 'Servicios', icon: '🛠️' },
    { id: 'otros_ingresos', name: 'Otros ingresos', icon: '📈' },
  ],
  gastos: [
    { id: 'materiales', name: 'Materiales', icon: '📦' },
    { id: 'envios', name: 'Envíos', icon: '🚚' },
    { id: 'publicidad', name: 'Publicidad', icon: '📢' },
    { id: 'servicios_basicos', name: 'Servicios básicos', icon: '💡' },
    { id: 'otros_gastos', name: 'Otros gastos', icon: '📉' },
  ],
}

// Genera un ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Comprime una imagen antes de subir
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
