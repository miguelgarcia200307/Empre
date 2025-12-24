/**
 * Helpers para manejo de variantes de productos
 * Estructura estándar:
 * - options: [{ name: "Color", values: ["Rojo", "Azul"] }, ...]
 * - variants: [{ id, title, options: { Color: "Rojo" }, price, sku, stock_quantity, image_url, is_active }, ...]
 */

/**
 * Genera un ID único para variantes
 */
export const generateVariantId = () => {
  return `var_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica si un producto tiene variantes activas
 */
export const isProductWithVariants = (product) => {
  return Boolean(
    product?.has_variants &&
    Array.isArray(product?.variants) &&
    product.variants.length > 0
  )
}

/**
 * Obtiene las variantes activas de un producto
 */
export const getActiveVariants = (product) => {
  if (!isProductWithVariants(product)) return []
  return product.variants.filter(v => v.is_active !== false)
}

/**
 * Obtiene el precio mínimo de las variantes activas
 */
export const getMinVariantPrice = (product) => {
  const activeVariants = getActiveVariants(product)
  if (activeVariants.length === 0) return product?.price || 0
  return Math.min(...activeVariants.map(v => v.price || 0))
}

/**
 * Obtiene el precio máximo de las variantes activas
 */
export const getMaxVariantPrice = (product) => {
  const activeVariants = getActiveVariants(product)
  if (activeVariants.length === 0) return product?.price || 0
  return Math.max(...activeVariants.map(v => v.price || 0))
}

/**
 * Obtiene el precio a mostrar del producto
 * - Sin variantes: precio simple
 * - Con variantes: precio mínimo
 */
export const getProductDisplayPrice = (product) => {
  if (!isProductWithVariants(product)) {
    return product?.price || 0
  }
  return getMinVariantPrice(product)
}

/**
 * Verifica si el producto tiene rango de precios (min != max)
 */
export const hasPriceRange = (product) => {
  if (!isProductWithVariants(product)) return false
  const min = getMinVariantPrice(product)
  const max = getMaxVariantPrice(product)
  return min !== max
}

/**
 * Verifica disponibilidad del producto
 */
export const getProductAvailability = (product) => {
  // Sin control de inventario
  if (!product?.track_inventory) {
    if (isProductWithVariants(product)) {
      return getActiveVariants(product).length > 0
    }
    return product?.is_active !== false
  }

  // Con control de inventario
  if (isProductWithVariants(product)) {
    // Disponible si hay al menos una variante activa con stock
    return getActiveVariants(product).some(v => (v.stock_quantity || 0) > 0)
  }
  
  // Producto simple
  return (product?.stock_quantity || 0) > 0
}

/**
 * Verifica disponibilidad de una variante específica
 */
export const getVariantAvailability = (product, variant) => {
  if (!variant || variant.is_active === false) return false
  
  if (!product?.track_inventory) return true
  
  return (variant.stock_quantity || 0) > 0
}

/**
 * Genera el título de una variante a partir de sus opciones
 * Ej: { Color: "Rojo", Talla: "M" } => "Rojo / M"
 */
export const generateVariantTitle = (optionsMap, productOptions = []) => {
  if (!optionsMap || Object.keys(optionsMap).length === 0) return ''
  
  // Ordenar por el orden de las opciones del producto
  const orderedValues = productOptions.map(opt => optionsMap[opt.name]).filter(Boolean)
  
  // Si no hay orden definido, usar orden alfabético
  if (orderedValues.length === 0) {
    return Object.values(optionsMap).join(' / ')
  }
  
  return orderedValues.join(' / ')
}

/**
 * Genera la clave única de una variante para comparación
 */
export const generateVariantKey = (optionsMap) => {
  if (!optionsMap) return ''
  const sorted = Object.entries(optionsMap).sort((a, b) => a[0].localeCompare(b[0]))
  return JSON.stringify(sorted)
}

/**
 * Encuentra una variante que coincida con las opciones seleccionadas
 */
export const findMatchingVariant = (variants, selectedOptions) => {
  if (!variants || !selectedOptions) return null
  
  const targetKey = generateVariantKey(selectedOptions)
  return variants.find(v => generateVariantKey(v.options) === targetKey)
}

/**
 * Genera el producto cartesiano de opciones para crear todas las variantes posibles
 */
export const generateCartesianVariants = (options) => {
  if (!options || options.length === 0) return []
  
  // Filtrar opciones válidas
  const validOptions = options.filter(opt => 
    opt.name && 
    opt.name.trim() && 
    Array.isArray(opt.values) && 
    opt.values.length > 0
  )
  
  if (validOptions.length === 0) return []
  
  // Generar producto cartesiano
  const cartesian = validOptions.reduce((acc, option) => {
    if (acc.length === 0) {
      return option.values.map(value => ({ [option.name]: value }))
    }
    
    const newAcc = []
    acc.forEach(existing => {
      option.values.forEach(value => {
        newAcc.push({ ...existing, [option.name]: value })
      })
    })
    return newAcc
  }, [])
  
  return cartesian.map(optionsMap => ({
    id: generateVariantId(),
    title: generateVariantTitle(optionsMap, validOptions),
    options: optionsMap,
    price: 0,
    compare_price: null,
    sku: null,
    stock_quantity: 0,
    image_url: null,
    is_active: true
  }))
}

/**
 * Mezcla variantes existentes con nuevas generadas
 * Preserva datos de variantes coincidentes (precio, sku, etc.)
 */
export const mergeVariants = (existingVariants, newVariants) => {
  if (!newVariants || newVariants.length === 0) return []
  if (!existingVariants || existingVariants.length === 0) return newVariants
  
  // Crear mapa de variantes existentes por clave
  const existingMap = new Map()
  existingVariants.forEach(v => {
    const key = generateVariantKey(v.options)
    existingMap.set(key, v)
  })
  
  // Mezclar con nuevas variantes
  const merged = newVariants.map(newVar => {
    const key = generateVariantKey(newVar.options)
    const existing = existingMap.get(key)
    
    if (existing) {
      // Preservar datos existentes, actualizar título por si cambió el orden
      return {
        ...existing,
        title: newVar.title,
        options: newVar.options
      }
    }
    
    return newVar
  })
  
  return merged
}

/**
 * Calcula el precio base del producto basado en las variantes
 */
export const calculateBasePrice = (variants) => {
  if (!variants || variants.length === 0) return 0
  
  const activeVariants = variants.filter(v => v.is_active !== false)
  if (activeVariants.length === 0) {
    // Si no hay activas, usar el mínimo de todas
    const allPrices = variants.map(v => v.price || 0).filter(p => p > 0)
    return allPrices.length > 0 ? Math.min(...allPrices) : 0
  }
  
  const prices = activeVariants.map(v => v.price || 0).filter(p => p > 0)
  return prices.length > 0 ? Math.min(...prices) : 0
}

/**
 * Valida la estructura de opciones
 */
export const validateOptions = (options) => {
  const errors = []
  
  if (!Array.isArray(options)) {
    return { valid: false, errors: ['Las opciones deben ser un array'] }
  }
  
  if (options.length > 3) {
    errors.push('Máximo 3 opciones permitidas')
  }
  
  const names = new Set()
  
  options.forEach((opt, index) => {
    if (!opt.name || !opt.name.trim()) {
      errors.push(`La opción ${index + 1} necesita un nombre`)
    } else {
      const normalizedName = opt.name.trim().toLowerCase()
      if (names.has(normalizedName)) {
        errors.push(`El nombre "${opt.name}" está duplicado`)
      }
      names.add(normalizedName)
    }
    
    if (!Array.isArray(opt.values) || opt.values.length === 0) {
      errors.push(`La opción "${opt.name || index + 1}" necesita al menos un valor`)
    } else {
      const values = new Set()
      opt.values.forEach(val => {
        const normalized = (val || '').trim().toLowerCase()
        if (values.has(normalized)) {
          errors.push(`El valor "${val}" está duplicado en "${opt.name}"`)
        }
        values.add(normalized)
      })
    }
  })
  
  return { valid: errors.length === 0, errors }
}

/**
 * Valida la estructura de variantes
 */
export const validateVariants = (variants, options) => {
  const errors = []
  
  if (!Array.isArray(variants)) {
    return { valid: false, errors: ['Las variantes deben ser un array'] }
  }
  
  if (variants.length === 0) {
    errors.push('Debe existir al menos una variante')
  }
  
  variants.forEach((variant, index) => {
    const label = variant.title || `Variante ${index + 1}`
    
    if (variant.price === null || variant.price === undefined || variant.price < 0) {
      errors.push(`${label}: precio inválido`)
    }
    
    if (!variant.options || Object.keys(variant.options).length === 0) {
      errors.push(`${label}: opciones faltantes`)
    }
  })
  
  // Verificar que haya al menos una variante con precio válido
  const validPrices = variants.filter(v => v.price > 0)
  if (validPrices.length === 0) {
    errors.push('Al menos una variante debe tener un precio mayor a 0')
  }
  
  return { valid: errors.length === 0, errors }
}

/**
 * Normaliza los valores de una opción (trim y elimina vacíos)
 */
export const normalizeOptionValues = (values) => {
  if (!Array.isArray(values)) return []
  
  return values
    .map(v => (v || '').trim())
    .filter(v => v.length > 0)
    .filter((v, i, arr) => arr.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i)
}

/**
 * Prepara los datos de variantes para guardar en Supabase
 */
export const prepareVariantsForSave = (variants) => {
  return variants.map(v => ({
    id: v.id || generateVariantId(),
    title: v.title || '',
    options: v.options || {},
    price: parseFloat(v.price) || 0,
    compare_price: v.compare_price ? parseFloat(v.compare_price) : null,
    sku: v.sku || null,
    stock_quantity: parseInt(v.stock_quantity) || 0,
    image_url: v.image_url || null,
    is_active: v.is_active !== false
  }))
}

/**
 * Genera el ID único del carrito para un producto con o sin variante
 */
export const generateCartItemId = (productId, variantId = null) => {
  return `${productId}_${variantId || 'simple'}`
}

/**
 * Obtiene el stock disponible de una variante o producto
 */
export const getAvailableStock = (product, variant = null) => {
  if (!product?.track_inventory) return Infinity
  
  if (variant) {
    return variant.stock_quantity || 0
  }
  
  return product.stock_quantity || 0
}
