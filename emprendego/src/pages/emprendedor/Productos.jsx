import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice, generateSlug } from '../../lib/helpers'
import {
  generateVariantId,
  generateCartesianVariants,
  mergeVariants,
  calculateBasePrice,
  validateOptions,
  validateVariants,
  normalizeOptionValues,
  prepareVariantsForSave,
  generateVariantTitle,
} from '../../lib/variants'
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Modal,
  Spinner,
  Badge,
  EmptyState,
  ImageUpload,
  Toggle,
} from '../../components/ui'
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Sparkles,
  Filter,
  Grid,
  List,
  Image as ImageIcon,
  Lock,
  Crown,
  AlertTriangle,
  X,
  Layers,
  DollarSign,
  Hash,
  Box,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Info,
  Camera,
  Upload,
  Loader2,
} from 'lucide-react'

const Productos = () => {
  const { store, plan, canAddProduct, hasFeature, getLimit, subscription } = useStore()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [filterCategory, setFilterCategory] = useState('')
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false) // Modal de límite
  const [productToDelete, setProductToDelete] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    main_image_url: null,
    // Campos de variantes
    has_variants: false,
    options: [],
    variants: [],
  })
  
  // Estado para UI de variantes
  const [variantsExpanded, setVariantsExpanded] = useState(true)
  const [showDisableVariantsModal, setShowDisableVariantsModal] = useState(false)
  
  // Estado de carga para imágenes de variantes (mapa: variantId -> boolean)
  const [uploadingVariantImage, setUploadingVariantImage] = useState({})

  // Obtener límites del plan
  const productLimit = getLimit('products')
  const maxProducts = productLimit.max
  const isUnlimited = productLimit.isUnlimited

  // Products with blocked status
  const productsWithBlockedStatus = useMemo(() => {
    if (isUnlimited) {
      return products.map(p => ({ ...p, isBlocked: false }))
    }
    
    // Sort by sort_order or created_at to determine which are "first"
    const sortedProducts = [...products].sort((a, b) => {
      if (a.sort_order !== undefined && b.sort_order !== undefined) {
        return a.sort_order - b.sort_order
      }
      return new Date(a.created_at) - new Date(b.created_at)
    })
    
    // Mark products beyond the limit as blocked
    const productBlockedMap = new Map()
    sortedProducts.forEach((product, index) => {
      productBlockedMap.set(product.id, index >= maxProducts)
    })
    
    // Return products in original order with blocked status
    return products.map(p => ({
      ...p,
      isBlocked: productBlockedMap.get(p.id) || false,
    }))
  }, [products, maxProducts, isUnlimited])
  
  // Count blocked products
  const blockedCount = useMemo(() => {
    return productsWithBlockedStatus.filter(p => p.isBlocked).length
  }, [productsWithBlockedStatus])

  useEffect(() => {
    if (store?.id) {
      fetchProducts()
      fetchCategories()
    }
  }, [store?.id])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', store.id)
        .order('name')
      
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_active: true,
      main_image_url: null,
      has_variants: false,
      options: [],
      variants: [],
    })
    setEditingProduct(null)
    setVariantsExpanded(true)
  }

  const openCreateModal = () => {
    // Verificar límite de productos del plan
    if (!canAddProduct(products.length)) {
      setLimitModalOpen(true)
      return
    }
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      is_active: product.is_active,
      main_image_url: product.main_image_url,
      // Cargar datos de variantes
      has_variants: product.has_variants || false,
      options: Array.isArray(product.options) ? product.options : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
    })
    setVariantsExpanded(true)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('El nombre del producto es requerido')
      return
    }

    // Validación para productos con variantes
    if (formData.has_variants) {
      const optionsValidation = validateOptions(formData.options)
      if (!optionsValidation.valid) {
        toast.error(optionsValidation.errors[0])
        return
      }
      
      const variantsValidation = validateVariants(formData.variants, formData.options)
      if (!variantsValidation.valid) {
        toast.error(variantsValidation.errors[0])
        return
      }
    } else {
      // Producto simple: precio requerido
      if (!formData.price) {
        toast.error('El precio es requerido')
        return
      }
    }

    setSaving(true)
    try {
      // Calcular precio base
      let finalPrice = parseFloat(formData.price) || 0
      
      if (formData.has_variants) {
        const preparedVariants = prepareVariantsForSave(formData.variants)
        finalPrice = calculateBasePrice(preparedVariants)
        
        if (finalPrice <= 0) {
          toast.error('Al menos una variante debe tener un precio mayor a 0')
          setSaving(false)
          return
        }
      }

      const productData = {
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        price: finalPrice,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        main_image_url: formData.main_image_url,
        slug: generateSlug(formData.name),
        // Datos de variantes
        has_variants: formData.has_variants,
        options: formData.has_variants ? formData.options : [],
        variants: formData.has_variants ? prepareVariantsForSave(formData.variants) : [],
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
        toast.success('Producto creado')
      }

      setModalOpen(false)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error
      
      toast.success('Producto eliminado')
      setDeleteModalOpen(false)
      setProductToDelete(null)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar producto')
    }
  }

  const generateAIDescription = async () => {
    if (!hasFeature('ai')) {
      toast.error('La generación con IA está disponible en el Plan Pro')
      return
    }

    if (!formData.name) {
      toast.error('Ingresa el nombre del producto primero')
      return
    }

    setGeneratingAI(true)
    try {
      // TODO: Integrar con API de IA (DeepSeek, OpenAI, etc.)
      // Por ahora simulamos una respuesta
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const descriptions = [
        `${formData.name} de excelente calidad, elaborado con los mejores ingredientes. Perfecto para cualquier ocasión especial.`,
        `Descubre nuestro ${formData.name}, preparado con dedicación y amor. Un producto que destaca por su sabor único y presentación impecable.`,
        `${formData.name}: la elección perfecta para quienes buscan calidad y buen gusto. Elaboración artesanal con ingredientes premium.`,
      ]
      
      const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)]
      setFormData({ ...formData, description: randomDesc })
      toast.success('¡Descripción generada!')
    } catch (error) {
      toast.error('Error al generar descripción')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleImageChange = async (file) => {
    if (!file || !store?.id) return
    
    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${store.id}/products/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) throw uploadError
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      setFormData({ ...formData, main_image_url: urlData.publicUrl })
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  // ====================================
  // FUNCIONES DE VARIANTES
  // ====================================
  
  // Toggle de variantes con confirmación
  const handleVariantsToggle = (checked) => {
    if (!checked && formData.variants.length > 0) {
      // Pedir confirmación antes de desactivar
      setShowDisableVariantsModal(true)
    } else {
      setFormData({ ...formData, has_variants: checked })
    }
  }
  
  // Confirmar desactivación de variantes
  const confirmDisableVariants = () => {
    setFormData({ 
      ...formData, 
      has_variants: false,
      // Mantener options/variants por si reactivan
    })
    setShowDisableVariantsModal(false)
  }
  
  // Agregar nueva opción
  const addOption = () => {
    if (formData.options.length >= 3) {
      toast.error('Máximo 3 opciones permitidas')
      return
    }
    
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', values: [] }]
    })
  }
  
  // Actualizar nombre de opción
  const updateOptionName = (index, name) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], name }
    setFormData({ ...formData, options: newOptions })
  }
  
  // Actualizar valores de opción
  const updateOptionValues = (index, valuesString) => {
    const values = valuesString
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0)
    
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], values: normalizeOptionValues(values) }
    setFormData({ ...formData, options: newOptions })
  }
  
  // Agregar valor individual a opción
  const addValueToOption = (optionIndex, value) => {
    const trimmed = value.trim()
    if (!trimmed) return
    
    const newOptions = [...formData.options]
    const currentValues = newOptions[optionIndex].values || []
    
    // Verificar duplicados
    if (currentValues.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Este valor ya existe')
      return
    }
    
    newOptions[optionIndex] = { 
      ...newOptions[optionIndex], 
      values: [...currentValues, trimmed] 
    }
    setFormData({ ...formData, options: newOptions })
  }
  
  // Eliminar valor de opción
  const removeValueFromOption = (optionIndex, valueIndex) => {
    const newOptions = [...formData.options]
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      values: newOptions[optionIndex].values.filter((_, i) => i !== valueIndex)
    }
    setFormData({ ...formData, options: newOptions })
  }
  
  // Eliminar opción
  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ 
      ...formData, 
      options: newOptions,
      // Limpiar variantes si ya no hay opciones
      variants: newOptions.length === 0 ? [] : formData.variants
    })
  }
  
  // Generar variantes desde opciones
  const generateVariants = () => {
    const validation = validateOptions(formData.options)
    if (!validation.valid) {
      toast.error(validation.errors[0])
      return
    }
    
    const newVariants = generateCartesianVariants(formData.options)
    
    if (newVariants.length === 0) {
      toast.error('No se pudieron generar variantes. Verifica tus opciones.')
      return
    }
    
    if (newVariants.length > 100) {
      toast.error('Demasiadas combinaciones. Reduce los valores de las opciones.')
      return
    }
    
    // Mezclar con existentes para preservar datos
    const mergedVariants = mergeVariants(formData.variants, newVariants)
    
    setFormData({ ...formData, variants: mergedVariants })
    toast.success(`${mergedVariants.length} variantes generadas`)
  }
  
  // Actualizar variante individual
  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }
  
  // Eliminar variante
  const removeVariant = (index) => {
    if (formData.variants.length <= 1) {
      toast.error('Debe existir al menos una variante')
      return
    }
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }
  
  // Aplicar precio a todas las variantes
  const applyPriceToAll = (price) => {
    const numPrice = parseFloat(price) || 0
    const newVariants = formData.variants.map(v => ({ ...v, price: numPrice }))
    setFormData({ ...formData, variants: newVariants })
    toast.success('Precio aplicado a todas las variantes')
  }
  
  // Aplicar stock a todas las variantes
  const applyStockToAll = (stock) => {
    const numStock = parseInt(stock) || 0
    const newVariants = formData.variants.map(v => ({ ...v, stock_quantity: numStock }))
    setFormData({ ...formData, variants: newVariants })
    toast.success('Stock aplicado a todas las variantes')
  }
  
  // Activar/desactivar todas las variantes
  const toggleAllVariants = (active) => {
    const newVariants = formData.variants.map(v => ({ ...v, is_active: active }))
    setFormData({ ...formData, variants: newVariants })
  }
  
  // ====================================
  // FUNCIONES DE IMAGEN POR VARIANTE
  // ====================================
  
  /**
   * Subir imagen para una variante específica
   */
  const handleVariantImageChange = async (vIndex, file) => {
    if (!file || !store?.id) return
    
    const variant = formData.variants[vIndex]
    if (!variant) return
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }
    
    // Validar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error('La imagen no debe superar 2MB')
      return
    }
    
    // Asegurar que la variante tenga ID
    const variantId = variant.id || generateVariantId()
    if (!variant.id) {
      updateVariant(vIndex, 'id', variantId)
    }
    
    // Marcar como subiendo
    setUploadingVariantImage(prev => ({ ...prev, [variantId]: true }))
    
    try {
      const fileExt = file.name.split('.').pop().toLowerCase()
      const fileName = `${store.id}/products/variants/${variantId}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) throw uploadError
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      // Actualizar variante con la nueva imagen
      updateVariant(vIndex, 'image_url', urlData.publicUrl)
      toast.success('Imagen de variante subida')
    } catch (error) {
      console.error('Error uploading variant image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingVariantImage(prev => ({ ...prev, [variantId]: false }))
    }
  }
  
  /**
   * Eliminar imagen de una variante
   */
  const handleRemoveVariantImage = async (vIndex) => {
    const variant = formData.variants[vIndex]
    if (!variant?.image_url) return
    
    // Intentar eliminar del storage (opcional, no crítico si falla)
    try {
      // Extraer path del URL público
      const url = new URL(variant.image_url)
      const pathMatch = url.pathname.match(/product-images\/(.+)$/)
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1])
        await supabase.storage.from('product-images').remove([storagePath])
      }
    } catch (error) {
      // No es crítico si falla la eliminación del storage
      console.warn('Could not delete variant image from storage:', error)
    }
    
    // Limpiar la URL de la variante
    updateVariant(vIndex, 'image_url', null)
    toast.success('Imagen de variante eliminada')
  }
  
  // Calcular precio mostrado (para preview)
  const displayPrice = useMemo(() => {
    if (!formData.has_variants || formData.variants.length === 0) {
      return formData.price ? formatPrice(parseFloat(formData.price)) : '$0'
    }
    const basePrice = calculateBasePrice(formData.variants)
    return basePrice > 0 ? `Desde ${formatPrice(basePrice)}` : '$0'
  }, [formData.has_variants, formData.variants, formData.price])

  // Filtered products (now uses blocked status)
  const filteredProducts = useMemo(() => {
    return productsWithBlockedStatus.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || product.category_id === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [productsWithBlockedStatus, searchTerm, filterCategory])

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">
            {products.length} de {isUnlimited ? '∞' : maxProducts} productos
          </p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Nuevo producto
        </Button>
      </div>
      
      {/* Blocked Products Warning */}
      {blockedCount > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">
                {blockedCount} producto{blockedCount !== 1 ? 's' : ''} bloqueado{blockedCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Tu plan permite máximo {maxProducts} productos. Los productos adicionales 
                no se muestran en tu tienda pública, pero tus datos están seguros.
              </p>
              <Link 
                to="/panel/plan" 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
              >
                <Crown className="w-4 h-4" />
                Mejorar plan para desbloquear
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="sm:w-48"
          />
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </Card>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchTerm ? 'No se encontraron productos' : 'Sin productos aún'}
          description={searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega tu primer producto para empezar a vender'}
          action={!searchTerm ? openCreateModal : undefined}
          actionLabel="Agregar producto"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={`overflow-hidden ${product.isBlocked ? 'opacity-60' : ''}`} 
              padding="none"
            >
              {/* Contenedor de imagen con aspect ratio fijo */}
              <div className="relative w-full overflow-hidden bg-gray-50">
                <div className="relative w-full aspect-square">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      loading="lazy"
                      className={`absolute inset-0 w-full h-full object-cover ${product.isBlocked ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                {/* Blocked overlay */}
                {product.isBlocked && (
                  <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                    <div className="bg-amber-100 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span className="text-sm font-medium text-amber-800">Bloqueado</span>
                    </div>
                  </div>
                )}
                <Badge
                  variant={product.isBlocked ? 'amber' : product.is_active ? 'green' : 'gray'}
                  className="absolute top-2 right-2 z-10"
                >
                  {product.isBlocked ? 'Bloqueado' : product.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className={`font-semibold truncate ${product.isBlocked ? 'text-gray-500' : 'text-gray-900'}`}>
                  {product.name}
                </h3>
                {product.categories && (
                  <p className="text-sm text-gray-500">{product.categories.name}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <p className={`text-lg font-bold ${product.isBlocked ? 'text-gray-400' : 'text-blue-600'}`}>
                    {product.has_variants ? 'Desde ' : ''}{formatPrice(product.price)}
                  </p>
                  {product.has_variants && (
                    <Badge variant="blue" size="sm">
                      <Layers className="w-3 h-3 mr-1" />
                      {product.variants?.length || 0}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(product)}
                    icon={Edit2}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProductToDelete(product)
                      setDeleteModalOpen(true)
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Producto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Precio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoría</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                          {product.has_variants && (
                            <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                              <Layers className="w-3 h-3 mr-0.5" />
                              {product.variants?.length || 0} var.
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {product.has_variants ? 'Desde ' : ''}{formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {product.categories?.name || 'Sin categoría'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.is_active ? 'green' : 'gray'} dot>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product)
                            setDeleteModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
        fullHeight
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={saving}
              form="product-form"
              className="w-full sm:w-auto"
            >
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Layout responsivo: mobile=stacked, desktop=side-by-side */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <ImageUpload
              value={formData.main_image_url}
              onChange={handleImageChange}
              onRemove={() => setFormData({ ...formData, main_image_url: null })}
              aspectRatio="1:1"
              className="w-full sm:w-32 max-w-[160px] mx-auto sm:mx-0 shrink-0"
              placeholder="Foto"
              loading={uploadingImage}
            />
            
            <div className="flex-1 space-y-4">
              <Input
                label="Nombre del producto"
                placeholder="Ej: Torta de chocolate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              {/* Precio - condicional según variantes */}
              {!formData.has_variants ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="text"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, price: value })
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio base
                  </label>
                  <div className="relative">
                    <div className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-600">
                      {displayPrice}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Se calcula automáticamente desde tus presentaciones
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Descripción
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateAIDescription}
                loading={generatingAI}
                icon={Sparkles}
                className="text-purple-600 hover:text-purple-700"
              >
                Generar con IA
                {!hasFeature('ai') && <Badge variant="amber" size="sm" className="ml-1">PRO</Badge>}
              </Button>
            </div>
            <Textarea
              placeholder="Describe tu producto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <Select
            label="Categoría"
            options={[
              { value: '', label: 'Sin categoría' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          />

          {/* ====================================
              SECCIÓN DE PRESENTACIONES/VARIANTES
              ==================================== */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header de la sección */}
            <div 
              className="p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
              onClick={() => setVariantsExpanded(!variantsExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Presentaciones</h3>
                    <p className="text-sm text-gray-500">Colores, tallas, tamaños...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {formData.has_variants && (
                    <Badge variant="blue">
                      {formData.variants.length} variante{formData.variants.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {variantsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Contenido expandible */}
            {variantsExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Toggle principal */}
                <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl">
                  <Toggle
                    checked={formData.has_variants}
                    onChange={handleVariantsToggle}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Este producto tiene distintas presentaciones
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Ej: Camisa (S, M, L) • Proteína (2lb, 5lb) • Taza (Roja, Azul)
                    </p>
                  </div>
                </div>
                
                {/* Constructor de opciones y variantes */}
                {formData.has_variants && (
                  <div className="space-y-5">
                    {/* ====== OPCIONES ====== */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Opciones</h4>
                        {formData.options.length < 3 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addOption}
                            icon={Plus}
                          >
                            Agregar opción
                          </Button>
                        )}
                      </div>
                      
                      {formData.options.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Agrega opciones como "Color" o "Talla"
                          </p>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addOption}
                            className="mt-3"
                            icon={Plus}
                          >
                            Agregar primera opción
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.options.map((option, optIndex) => (
                            <OptionBuilder
                              key={optIndex}
                              option={option}
                              index={optIndex}
                              onNameChange={(name) => updateOptionName(optIndex, name)}
                              onValuesChange={(values) => updateOptionValues(optIndex, values)}
                              onAddValue={(value) => addValueToOption(optIndex, value)}
                              onRemoveValue={(valueIndex) => removeValueFromOption(optIndex, valueIndex)}
                              onRemove={() => removeOption(optIndex)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* ====== GENERAR VARIANTES ====== */}
                    {formData.options.length > 0 && formData.options.some(o => o.values?.length > 0) && (
                      <div className="flex items-center justify-center py-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={generateVariants}
                          icon={RefreshCw}
                          className="shadow-sm"
                        >
                          {formData.variants.length > 0 ? 'Regenerar variantes' : 'Generar variantes'}
                        </Button>
                      </div>
                    )}
                    
                    {/* ====== EDITOR DE VARIANTES ====== */}
                    {formData.variants.length > 0 && (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <h4 className="font-medium text-gray-900">
                            Variantes ({formData.variants.length})
                          </h4>
                          
                          {/* Acciones masivas */}
                          <div className="flex flex-wrap gap-2">
                            <MassActionInput
                              icon={DollarSign}
                              placeholder="Precio"
                              buttonText="Aplicar"
                              onApply={applyPriceToAll}
                            />
                            <MassActionInput
                              icon={Box}
                              placeholder="Stock"
                              buttonText="Aplicar"
                              onApply={applyStockToAll}
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => toggleAllVariants(true)}
                                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                title="Activar todas"
                              >
                                ✓ Todas
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleAllVariants(false)}
                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Desactivar todas"
                              >
                                ✕ Ninguna
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de variantes - Mobile: cards, Desktop: tabla compacta */}
                        <div className="space-y-2">
                          {/* Desktop: tabla */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                  <th className="pb-2 font-medium w-14">Imagen</th>
                                  <th className="pb-2 font-medium">Variante</th>
                                  <th className="pb-2 font-medium">Precio *</th>
                                  <th className="pb-2 font-medium">SKU</th>
                                  <th className="pb-2 font-medium">Stock</th>
                                  <th className="pb-2 font-medium text-center">Activa</th>
                                  <th className="pb-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.variants.map((variant, vIndex) => {
                                  const isUploading = uploadingVariantImage[variant.id]
                                  return (
                                    <tr key={variant.id || vIndex} className="border-b border-gray-50 hover:bg-gray-50/50">
                                      {/* Columna de imagen */}
                                      <td className="py-2 pr-3">
                                        <VariantImageUploader
                                          imageUrl={variant.image_url}
                                          isUploading={isUploading}
                                          onUpload={(file) => handleVariantImageChange(vIndex, file)}
                                          onRemove={() => handleRemoveVariantImage(vIndex)}
                                          size="sm"
                                        />
                                      </td>
                                      <td className="py-2 pr-3">
                                        <span className="font-medium text-gray-900">{variant.title}</span>
                                      </td>
                                      <td className="py-2 pr-3">
                                        <div className="relative w-28">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                          <input
                                            type="text"
                                            value={variant.price || ''}
                                            onChange={(e) => updateVariant(vIndex, 'price', e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-5 pr-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                                            placeholder="0"
                                            disabled={isUploading}
                                          />
                                        </div>
                                      </td>
                                      <td className="py-2 pr-3">
                                        <input
                                          type="text"
                                          value={variant.sku || ''}
                                          onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                                          className="w-24 px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                                          placeholder="SKU"
                                          disabled={isUploading}
                                        />
                                      </td>
                                      <td className="py-2 pr-3">
                                        <input
                                          type="number"
                                          min="0"
                                          value={variant.stock_quantity || ''}
                                          onChange={(e) => updateVariant(vIndex, 'stock_quantity', e.target.value)}
                                          className="w-20 px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                                          placeholder="0"
                                          disabled={isUploading}
                                        />
                                      </td>
                                      <td className="py-2 pr-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={variant.is_active !== false}
                                          onChange={(e) => updateVariant(vIndex, 'is_active', e.target.checked)}
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          disabled={isUploading}
                                        />
                                      </td>
                                      <td className="py-2">
                                        <button
                                          type="button"
                                          onClick={() => removeVariant(vIndex)}
                                          className="p-1 text-gray-400 hover:text-red-500 rounded disabled:opacity-50"
                                          title="Eliminar variante"
                                          disabled={isUploading}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Mobile: cards */}
                          <div className="md:hidden space-y-3">
                            {formData.variants.map((variant, vIndex) => {
                              const isUploading = uploadingVariantImage[variant.id]
                              return (
                                <div 
                                  key={variant.id || vIndex}
                                  className={`p-3 rounded-xl border ${variant.is_active !== false ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'} ${isUploading ? 'opacity-75' : ''}`}
                                >
                                  <div className="flex items-start gap-3 mb-3">
                                    {/* Imagen de variante */}
                                    <VariantImageUploader
                                      imageUrl={variant.image_url}
                                      isUploading={isUploading}
                                      onUpload={(file) => handleVariantImageChange(vIndex, file)}
                                      onRemove={() => handleRemoveVariantImage(vIndex)}
                                      size="md"
                                    />
                                    
                                    {/* Info y controles */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 truncate">{variant.title}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <input
                                            type="checkbox"
                                            checked={variant.is_active !== false}
                                            onChange={(e) => updateVariant(vIndex, 'is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                            disabled={isUploading}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeVariant(vIndex)}
                                            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                                            disabled={isUploading}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="text-xs text-gray-500">Precio *</label>
                                      <div className="relative mt-1">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                        <input
                                          type="text"
                                          value={variant.price || ''}
                                          onChange={(e) => updateVariant(vIndex, 'price', e.target.value.replace(/\D/g, ''))}
                                          className="w-full pl-5 pr-2 py-2 text-sm rounded-lg border border-gray-200"
                                          placeholder="0"
                                          disabled={isUploading}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">SKU</label>
                                      <input
                                        type="text"
                                        value={variant.sku || ''}
                                        onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                                        className="w-full px-2 py-2 mt-1 text-sm rounded-lg border border-gray-200"
                                        placeholder="—"
                                        disabled={isUploading}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500">Stock</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={variant.stock_quantity || ''}
                                        onChange={(e) => updateVariant(vIndex, 'stock_quantity', e.target.value)}
                                        className="w-full px-2 py-2 mt-1 text-sm rounded-lg border border-gray-200"
                                        placeholder="0"
                                        disabled={isUploading}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Toggle
            checked={formData.is_active}
            onChange={(checked) => setFormData({ ...formData, is_active: checked })}
            label="Producto activo"
            description="Los productos inactivos no aparecen en tu tienda"
          />
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal.Confirm
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setProductToDelete(null)
        }}
        onConfirm={handleDelete}
        title="¿Eliminar producto?"
        description={`Se eliminará "${productToDelete?.name}" permanentemente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal de límite de productos */}
      <Modal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="Límite de productos alcanzado"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Has llegado al límite de tu plan
          </h3>
          
          <p className="text-gray-600 mb-2">
            Tu plan <span className="font-semibold">{plan.name}</span> permite hasta{' '}
            <span className="font-semibold">
              {productLimit.isUnlimited ? 'productos ilimitados' : `${productLimit.max} productos`}
            </span>.
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Actualmente tienes {products.length} productos.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link to="/panel/plan" className="w-full">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Crown className="w-4 h-4 mr-2" />
                Mejorar mi plan
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              onClick={() => setLimitModalOpen(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal de confirmación para desactivar variantes */}
      <Modal
        isOpen={showDisableVariantsModal}
        onClose={() => setShowDisableVariantsModal(false)}
        title="¿Desactivar presentaciones?"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setShowDisableVariantsModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={confirmDisableVariants}
            >
              Desactivar
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Se ocultarán tus presentaciones y el producto volverá a tener un precio único.
            Tus datos se conservarán por si deseas reactivarlas después.
          </p>
        </div>
      </Modal>
    </div>
  )
}

// ============================================
// COMPONENTES AUXILIARES PARA VARIANTES
// ============================================

/**
 * Constructor de una opción individual (nombre + valores)
 */
function OptionBuilder({ option, index, onNameChange, onValuesChange, onAddValue, onRemoveValue, onRemove }) {
  const [newValue, setNewValue] = useState('')
  
  const handleAddValue = () => {
    if (newValue.trim()) {
      onAddValue(newValue)
      setNewValue('')
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddValue()
    }
  }
  
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          {/* Nombre de la opción */}
          <div className="flex gap-2">
            <input
              type="text"
              value={option.name || ''}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nombre (ej: Color, Talla)"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar opción"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Agregar valores */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Agregar valor (ej: Rojo, Azul)"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
            <button
              type="button"
              onClick={handleAddValue}
              disabled={!newValue.trim()}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Chips de valores */}
          {option.values && option.values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value, vIndex) => (
                <span 
                  key={vIndex}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => onRemoveValue(vIndex)}
                    className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Input para acciones masivas (aplicar precio/stock a todas las variantes)
 */
function MassActionInput({ icon: Icon, placeholder, buttonText, onApply }) {
  const [value, setValue] = useState('')
  
  const handleApply = () => {
    if (value) {
      onApply(value)
      setValue('')
    }
  }
  
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <div className="relative">
        {Icon && <Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          className="w-20 pl-6 pr-2 py-1 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="button"
        onClick={handleApply}
        disabled={!value}
        className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    </div>
  )
}

/**
 * Componente para subir/cambiar/eliminar imagen de una variante
 * @param {string} imageUrl - URL de la imagen actual (o null)
 * @param {boolean} isUploading - Si está subiendo
 * @param {function} onUpload - Callback cuando se selecciona archivo
 * @param {function} onRemove - Callback para eliminar imagen
 * @param {string} size - 'sm' (40px) o 'md' (48px)
 */
function VariantImageUploader({ imageUrl, isUploading, onUpload, onRemove, size = 'sm' }) {
  const inputRef = React.useRef(null)
  
  const sizeClasses = size === 'md' ? 'w-12 h-12' : 'w-10 h-10'
  
  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click()
    }
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    // Reset input para poder subir el mismo archivo de nuevo si se elimina
    e.target.value = ''
  }
  
  return (
    <div className="relative group">
      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
        aria-label="Subir imagen de variante"
      />
      
      {/* Contenedor de imagen/placeholder */}
      <div
        onClick={handleClick}
        className={`
          ${sizeClasses} rounded-xl overflow-hidden cursor-pointer
          border transition-all duration-200
          ${imageUrl 
            ? 'border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300' 
            : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        title={imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
      >
        {isUploading ? (
          // Estado de carga
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
        ) : imageUrl ? (
          // Imagen existente
          <img
            src={imageUrl}
            alt="Imagen de variante"
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Botón eliminar (solo si hay imagen y no está subiendo) */}
      {imageUrl && !isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="
            absolute -top-1.5 -right-1.5
            w-5 h-5 rounded-full
            bg-red-500 hover:bg-red-600
            text-white
            flex items-center justify-center
            shadow-sm
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
          title="Eliminar imagen"
          aria-label="Eliminar imagen de variante"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export default Productos
