import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import {
  Card,
  Button,
  Input,
  Modal,
  Spinner,
  EmptyState,
  Badge,
} from '../../components/ui'
import {
  Plus,
  FolderOpen,
  Edit2,
  Trash2,
  GripVertical,
  Lock,
  Crown,
  AlertTriangle,
} from 'lucide-react'

const Categorias = () => {
  const { store, plan, canAddCategory, getLimit, subscription } = useStore()
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [limitModalOpen, setLimitModalOpen] = useState(false) // Modal de límite
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form
  const [nombre, setNombre] = useState('')
  
  // Obtener límites
  const categoryLimitData = getLimit('categories')
  const categoryLimit = categoryLimitData.max
  const isUnlimited = categoryLimitData.isUnlimited

  // Determine which categories are blocked (over limit)
  const categoriesWithBlockedStatus = useMemo(() => {
    if (isUnlimited) {
      return categories.map(cat => ({ ...cat, isBlocked: false }))
    }
    
    // Categories are sorted by sort_order, first N are allowed
    return categories.map((cat, index) => ({
      ...cat,
      isBlocked: index >= categoryLimit,
    }))
  }, [categories, categoryLimit, isUnlimited])
  
  // Count blocked categories
  const blockedCount = useMemo(() => {
    return categoriesWithBlockedStatus.filter(c => c.isBlocked).length
  }, [categoriesWithBlockedStatus])

  useEffect(() => {
    if (store?.id) {
      fetchCategories()
    }
  }, [store?.id])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, products(count)')
        .eq('store_id', store.id)
        .order('sort_order', { ascending: true })

      if (error) throw error
      
      // Calcular conteo de productos por categoría
      const categoriesWithCount = data?.map(cat => ({
        ...cat,
        productCount: cat.products?.[0]?.count || 0
      })) || []
      
      setCategories(categoriesWithCount)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    if (!canAddCategory(categories.length)) {
      setLimitModalOpen(true)
      return
    }
    setNombre('')
    setEditingCategory(null)
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setNombre(category.name)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name: nombre.trim(), slug: nombre.trim().toLowerCase().replace(/\s+/g, '-') })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Categoría actualizada')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            store_id: store.id,
            name: nombre.trim(),
            slug: nombre.trim().toLowerCase().replace(/\s+/g, '-'),
            sort_order: categories.length,
          })

        if (error) throw error
        toast.success('Categoría creada')
      }

      setModalOpen(false)
      setNombre('')
      setEditingCategory(null)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Error al guardar categoría')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      // Verificar si tiene productos
      if (categoryToDelete.productCount > 0) {
        toast.error('No puedes eliminar una categoría con productos. Mueve o elimina los productos primero.')
        setDeleteModalOpen(false)
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id)

      if (error) throw error
      
      toast.success('Categoría eliminada')
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar categoría')
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">
            {categories.length} de {isUnlimited ? '∞' : categoryLimit} categorías
          </p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Nueva categoría
        </Button>
      </div>
      
      {/* Blocked Categories Warning */}
      {blockedCount > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">
                {blockedCount} categoría{blockedCount !== 1 ? 's' : ''} bloqueada{blockedCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Tu plan permite máximo {categoryLimit} categorías. Las categorías adicionales 
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

      {/* Categories list */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Sin categorías aún"
          description="Las categorías te ayudan a organizar tus productos"
          action={openCreateModal}
          actionLabel="Crear categoría"
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {categoriesWithBlockedStatus.map((category, index) => (
              <div
                key={category.id}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  category.isBlocked 
                    ? 'bg-gray-50/50 opacity-60' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-gray-400 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  category.isBlocked ? 'bg-gray-100' : 'bg-blue-100'
                }`}>
                  {category.isBlocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium truncate ${
                      category.isBlocked ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    {category.isBlocked && (
                      <Badge variant="amber" size="sm">
                        Bloqueada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {category.productCount} {category.productCount === 1 ? 'producto' : 'productos'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title={category.isBlocked ? 'Editar (categoría bloqueada)' : 'Editar'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(category)
                      setDeleteModalOpen(true)
                    }}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info */}
      <Card variant="flat">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-medium text-gray-900">Tip</h3>
            <p className="text-sm text-gray-600 mt-1">
              Organiza tus productos en categorías para que tus clientes encuentren 
              fácilmente lo que buscan. Por ejemplo: "Postres", "Bebidas", "Ofertas".
            </p>
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setNombre('')
          setEditingCategory(null)
        }}
        title={editingCategory ? 'Editar categoría' : 'Nueva categoría'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre de la categoría"
            placeholder="Ej: Postres, Bebidas, Ofertas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setNombre('')
                setEditingCategory(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingCategory ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal.Confirm
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={handleDelete}
        title="¿Eliminar categoría?"
        description={
          categoryToDelete?.productCount > 0
            ? `Esta categoría tiene ${categoryToDelete.productCount} productos. Debes moverlos o eliminarlos primero.`
            : `Se eliminará "${categoryToDelete?.name}" permanentemente.`
        }
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Category Limit Modal */}
      <Modal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="Límite de categorías alcanzado"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600 mb-2">
            Has alcanzado el límite de <strong>{categoryLimit}</strong> categorías de tu plan actual.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Tienes {categories.length} de {categoryLimit} categorías.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setLimitModalOpen(false)}
            >
              Entendido
            </Button>
            <Link to="/panel/plan">
              <Button icon={Crown}>
                Mejorar plan
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Categorias
