import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice, generateSlug } from '../../lib/helpers'
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
} from 'lucide-react'

const Productos = () => {
  const { store, plan, canAddProduct, hasFeature, getLimit } = useStore()
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
  })

  // Obtener límites del plan
  const productLimit = getLimit('products')

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
    })
    setEditingProduct(null)
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
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error('Nombre y precio son requeridos')
      return
    }

    setSaving(true)
    try {
      const productData = {
        store_id: store.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        main_image_url: formData.main_image_url,
        slug: generateSlug(formData.name),
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

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category_id === filterCategory
    return matchesSearch && matchesCategory
  })

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
            {products.length} de {plan.maxProducts === -1 ? '∞' : plan.maxProducts} productos
          </p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Nuevo producto
        </Button>
      </div>

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
            <Card key={product.id} className="overflow-hidden" padding="none">
              {/* Contenedor de imagen con aspect ratio fijo */}
              <div className="relative w-full overflow-hidden bg-gray-50">
                <div className="relative w-full aspect-square">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <Badge
                  variant={product.is_active ? 'green' : 'gray'}
                  className="absolute top-2 right-2 z-10"
                >
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                {product.categories && (
                  <p className="text-sm text-gray-500">{product.categories.name}</p>
                )}
                <p className="text-lg font-bold text-blue-600 mt-2">
                  {formatPrice(product.price)}
                </p>
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
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatPrice(product.price)}
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
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-6">
            <ImageUpload
              value={formData.main_image_url}
              onChange={handleImageChange}
              onRemove={() => setFormData({ ...formData, main_image_url: null })}
              aspectRatio="1:1"
              className="w-32 shrink-0"
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

          <Toggle
            checked={formData.is_active}
            onChange={(checked) => setFormData({ ...formData, is_active: checked })}
            label="Producto activo"
            description="Los productos inactivos no aparecen en tu tienda"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
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
    </div>
  )
}

export default Productos
