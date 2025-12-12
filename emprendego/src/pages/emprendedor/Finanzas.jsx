import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice, formatDate, financialCategories } from '../../lib/helpers'
import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  Spinner,
  Badge,
  EmptyState,
  Skeleton,
} from '../../components/ui'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Download,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  BookOpen,
  Sparkles,
  Calculator,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ============================================
// CONSTANTS
// ============================================
const ONBOARDING_KEY = 'eg_finances_onboarding_seen'

const PERIOD_LABELS = {
  week: 'esta semana',
  month: 'este mes',
  year: 'este año',
}

// ============================================
// ONBOARDING MODAL COMPONENT
// ============================================
const OnboardingModal = ({ isOpen, onClose, onAddEntry }) => {
  const [step, setStep] = useState(0)
  
  const steps = [
    {
      icon: BookOpen,
      title: '¿Qué registrar?',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <div className="p-2 rounded-lg bg-green-100">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Ingresos</p>
              <p className="text-sm text-green-700">Cada venta que hagas, cada pago que recibas.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
            <div className="p-2 rounded-lg bg-red-100">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Gastos</p>
              <p className="text-sm text-red-700">Materiales, envíos, publicidad, servicios.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Calculator,
      title: '¿Cómo se calcula el balance?',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-center gap-4 text-lg font-medium">
              <span className="text-green-600">Ingresos</span>
              <span className="text-gray-400">−</span>
              <span className="text-red-600">Gastos</span>
              <span className="text-gray-400">=</span>
              <span className="text-blue-600">Balance</span>
            </div>
            <p className="text-center text-sm text-blue-700 mt-3">
              EmprendeGo calcula todo automáticamente. Tú solo registra.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-gray-600">
              Verás gráficos e insights para entender mejor tu negocio.
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: Lightbulb,
      title: 'Tip para que funcione',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-amber-800 font-medium mb-2">
              📝 Registra apenas ocurra
            </p>
            <p className="text-sm text-amber-700">
              Si esperas al final del día, es fácil olvidar. Apenas vendas o compres algo, agrégalo aquí.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">
              Así siempre sabrás cuánto estás ganando de verdad.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onClose()
    onAddEntry('ingreso')
  }

  const currentStep = steps[step]
  const IconComponent = currentStep.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-blue-600 w-6' : i < step ? 'bg-blue-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <IconComponent className="w-8 h-8 text-blue-600" />
        </div>

        {/* Step title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">{currentStep.title}</h3>

        {/* Step content */}
        <div className="mb-6">{currentStep.content}</div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
              Anterior
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleComplete} className="flex-1">
              Agregar mi primer registro
            </Button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={() => {
            localStorage.setItem(ONBOARDING_KEY, 'true')
            onClose()
          }}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Saltar guía
        </button>
      </div>
    </Modal>
  )
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar este registro?</h3>
      <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
          Eliminar
        </Button>
      </div>
    </div>
  </Modal>
)

// ============================================
// ENTRY CARD (Mobile)
// ============================================
const EntryCard = ({ entry, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const isIngreso = entry.type === 'ingreso'
  
  // Find category info
  const categoryList = financialCategories[isIngreso ? 'ingresos' : 'gastos']
  const categoryInfo = categoryList.find((c) => c.id === entry.category)

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${isIngreso ? 'bg-green-100' : 'bg-red-100'}`}>
            {isIngreso ? (
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {entry.description || (categoryInfo ? `${categoryInfo.icon} ${categoryInfo.name}` : entry.category)}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={isIngreso ? 'green' : 'red'} size="sm">
                {categoryInfo?.icon} {categoryInfo?.name || entry.category}
              </Badge>
              <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
            </div>
            {entry.reference && (
              <p className="text-xs text-gray-400 mt-1">Ref: {entry.reference}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <p className={`font-bold text-lg whitespace-nowrap ${isIngreso ? 'text-green-600' : 'text-red-600'}`}>
            {isIngreso ? '+' : '-'}{formatPrice(entry.amount)}
          </p>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(entry) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4" /> Editar
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(entry) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
const Finanzas = () => {
  const { store, hasFeature } = useStore()
  const toast = useToast()
  
  // Data states
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI states
  const [period, setPeriod] = useState('month')
  const [filter, setFilter] = useState('all') // all | ingreso | gasto
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Form state - mapped to DB fields
  const [formData, setFormData] = useState({
    type: 'ingreso',      // DB: type
    amount: '',           // DB: amount
    category: '',         // DB: category
    description: '',      // DB: description
    date: new Date().toISOString().split('T')[0], // DB: date
    reference: '',        // DB: reference
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Feature check
  const hasAccess = hasFeature('finances')

  // ============================================
  // DATA FETCHING
  // ============================================
  useEffect(() => {
    if (store?.id && hasAccess) {
      fetchEntries()
    } else {
      setLoading(false)
    }
  }, [store?.id, period, hasAccess])

  // Check onboarding on mount
  useEffect(() => {
    if (hasAccess) {
      const seen = localStorage.getItem(ONBOARDING_KEY)
      if (!seen) {
        // Delay to check if entries exist
        const timer = setTimeout(() => {
          if (entries.length === 0 && !loading) {
            setShowOnboarding(true)
          }
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [hasAccess, entries.length, loading])

  const fetchEntries = async () => {
    setLoading(true)
    setError(null)
    try {
      const now = new Date()
      let startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Query using correct DB field names
      const { data, error: fetchError } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('store_id', store.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setEntries(data || [])
    } catch (err) {
      console.error('Error fetching entries:', err)
      setError('Error al cargar datos financieros')
      toast.error('Error al cargar datos financieros')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // FORM HANDLERS
  // ============================================
  const openModal = (type = 'ingreso') => {
    setFormData({
      type,
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
    })
    setEditingEntry(null)
    setShowAdvanced(false)
    setModalOpen(true)
  }

  const openEditModal = (entry) => {
    setFormData({
      type: entry.type,
      amount: String(entry.amount),
      category: entry.category,
      description: entry.description || '',
      date: entry.date,
      reference: entry.reference || '',
    })
    setEditingEntry(entry)
    setShowAdvanced(!!entry.reference)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const amountNum = parseFloat(formData.amount)
    if (!amountNum || amountNum <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    if (!formData.category) {
      toast.error('Selecciona una categoría')
      return
    }

    setSaving(true)
    try {
      const payload = {
        store_id: store.id,
        type: formData.type,
        amount: amountNum,
        category: formData.category,
        description: formData.description || null,
        date: formData.date,
        reference: formData.reference || null,
      }

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('finance_entries')
          .update(payload)
          .eq('id', editingEntry.id)
          .eq('store_id', store.id)

        if (error) throw error
        toast.success('Registro actualizado')
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('finance_entries')
          .insert(payload)

        if (error) throw error
        toast.success('Registro agregado')
      }
      
      setModalOpen(false)
      setEditingEntry(null)
      fetchEntries()
    } catch (err) {
      console.error('Error saving entry:', err)
      toast.error('Error al guardar registro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteEntry) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('finance_entries')
        .delete()
        .eq('id', deleteEntry.id)
        .eq('store_id', store.id)

      if (error) throw error
      
      toast.success('Registro eliminado')
      setDeleteEntry(null)
      fetchEntries()
    } catch (err) {
      console.error('Error deleting entry:', err)
      toast.error('Error al eliminar registro')
    } finally {
      setDeleting(false)
    }
  }

  // ============================================
  // CSV EXPORT
  // ============================================
  const exportToCSV = () => {
    if (entries.length === 0) {
      toast.error('No hay registros para exportar')
      return
    }

    const headers = ['Tipo', 'Categoría', 'Monto', 'Fecha', 'Descripción', 'Referencia']
    const rows = filteredEntries.map((e) => [
      e.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      e.category,
      e.amount,
      e.date,
      e.description || '',
      e.reference || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `finanzas_${period}_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Archivo CSV descargado')
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Type filter
      if (filter !== 'all' && entry.type !== filter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const desc = (entry.description || '').toLowerCase()
        const cat = (entry.category || '').toLowerCase()
        if (!desc.includes(query) && !cat.includes(query)) return false
      }
      
      return true
    })
  }, [entries, filter, searchQuery])

  // Calculate totals
  const totales = useMemo(() => {
    const result = entries.reduce(
      (acc, entry) => {
        if (entry.type === 'ingreso') {
          acc.ingresos += entry.amount
        } else {
          acc.gastos += entry.amount
        }
        return acc
      },
      { ingresos: 0, gastos: 0 }
    )
    result.balance = result.ingresos - result.gastos
    return result
  }, [entries])

  // Chart data
  const chartData = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const dateLabel = formatDate(entry.date, { month: 'short', day: 'numeric' })
      const existing = acc.find((d) => d.fecha === dateLabel)
      
      if (existing) {
        if (entry.type === 'ingreso') {
          existing.ingresos += entry.amount
        } else {
          existing.gastos += entry.amount
        }
      } else {
        acc.push({
          fecha: dateLabel,
          ingresos: entry.type === 'ingreso' ? entry.amount : 0,
          gastos: entry.type === 'gasto' ? entry.amount : 0,
        })
      }
      
      return acc
    }, []).reverse()
  }, [entries])

  // Smart insights
  const insights = useMemo(() => {
    if (entries.length === 0) return null
    
    // Top expense category
    const gastos = entries.filter((e) => e.type === 'gasto')
    const categoryTotals = gastos.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
    
    let topCategory = null
    let topAmount = 0
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (amount > topAmount) {
        topCategory = cat
        topAmount = amount
      }
    })
    
    // Best income day
    const ingresos = entries.filter((e) => e.type === 'ingreso')
    const dayTotals = ingresos.reduce((acc, e) => {
      acc[e.date] = (acc[e.date] || 0) + e.amount
      return acc
    }, {})
    
    let bestDay = null
    let bestDayAmount = 0
    Object.entries(dayTotals).forEach(([day, amount]) => {
      if (amount > bestDayAmount) {
        bestDay = day
        bestDayAmount = amount
      }
    })
    
    // Find category info
    const catInfo = financialCategories.gastos.find((c) => c.id === topCategory)
    
    return {
      topExpenseCategory: catInfo ? `${catInfo.icon} ${catInfo.name}` : topCategory,
      topExpenseAmount: topAmount,
      bestIncomeDay: bestDay ? formatDate(bestDay, { weekday: 'long', day: 'numeric', month: 'short' }) : null,
      bestIncomeDayAmount: bestDayAmount,
    }
  }, [entries])

  // ============================================
  // RENDER - BLOCKED VIEW
  // ============================================
  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-600 mt-1">
            Controla los ingresos y gastos de tu negocio
          </p>
        </div>

        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Módulo de Finanzas
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            Lleva un control detallado de tus ingresos y gastos, con gráficos y 
            reportes que te ayudan a tomar mejores decisiones.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Registra ingresos</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Controla gastos</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Exporta a CSV</span>
          </div>
          <Link to="/panel/plan">
            <Button>
              Ver planes disponibles
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // ============================================
  // RENDER - LOADING
  // ============================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton variant="title" className="w-32 mb-2" />
            <Skeleton variant="text" className="w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="button" className="w-36" />
            <Skeleton variant="button" className="w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <Skeleton variant="avatar" width={48} height={48} className="rounded-xl" />
                <div className="flex-1">
                  <Skeleton variant="text" className="w-20 mb-2" />
                  <Skeleton variant="title" className="w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <Skeleton variant="title" className="w-24 mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </Card>
      </div>
    )
  }

  // ============================================
  // RENDER - ERROR
  // ============================================
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-600 mt-1">
            Controla los ingresos y gastos de tu negocio
          </p>
        </div>
        <EmptyState
          icon={X}
          title="Error al cargar"
          description={error}
          action={fetchEntries}
          actionLabel="Reintentar"
        />
      </div>
    )
  }

  // ============================================
  // RENDER - MAIN
  // ============================================
  return (
    <div className="space-y-6">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onAddEntry={openModal}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteEntry}
        onClose={() => setDeleteEntry(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
              <button
                onClick={() => setShowOnboarding(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Ver guía rápida"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              Controla los ingresos y gastos de tu negocio
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'week', label: 'Esta semana' },
                { value: 'month', label: 'Este mes' },
                { value: 'year', label: 'Este año' },
              ]}
              className="w-36"
            />
            <Button variant="secondary" onClick={exportToCSV} icon={Download} className="hidden sm:flex">
              CSV
            </Button>
            <Button onClick={() => openModal('ingreso')} icon={Plus}>
              <span className="hidden sm:inline">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2 sm:hidden">
          <button
            onClick={() => openModal('ingreso')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
            + Ingreso
          </button>
          <button
            onClick={() => openModal('gasto')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors"
          >
            <ArrowDownRight className="w-5 h-5" />
            + Gasto
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(totales.ingresos)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPrice(totales.gastos)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${totales.balance >= 0 ? 'bg-blue-100' : 'bg-amber-100'}`}>
              {totales.balance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-blue-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${totales.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {formatPrice(totales.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Period note + insights */}
      {entries.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
          <p className="text-gray-500">
            📊 Basado en los movimientos de {PERIOD_LABELS[period]}
          </p>
          {insights && (
            <div className="flex flex-wrap gap-3">
              {insights.topExpenseCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                  Mayor gasto: {insights.topExpenseCategory}
                </span>
              )}
              {insights.bestIncomeDay && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  Mejor día: {insights.bestIncomeDay}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Resumen visual</h2>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  labelStyle={{ color: '#1f2937' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Desktop quick actions */}
      <div className="hidden sm:flex items-center gap-3">
        <button
          onClick={() => openModal('ingreso')}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
          + Ingreso rápido
        </button>
        <button
          onClick={() => openModal('gasto')}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors"
        >
          <ArrowDownRight className="w-4 h-4" />
          + Gasto rápido
        </button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={exportToCSV} icon={Download} className="sm:hidden">
          Exportar
        </Button>
      </div>

      {/* Entries list */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-semibold text-gray-900">Últimos movimientos</h2>
          
          {entries.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'ingreso', label: 'Ingresos' },
                  { value: 'gasto', label: 'Gastos' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filter === opt.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}
        </div>
        
        {entries.length === 0 ? (
          /* Improved empty state */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
              <DollarSign className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Empieza a llevar tus finanzas
            </h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Registra tus ventas y gastos para saber cuánto estás ganando realmente.
            </p>
            
            {/* Educational bullets */}
            <div className="flex flex-col gap-2 mb-6 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-600">Registra cada venta como <strong className="text-green-600">Ingreso</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-gray-600">Registra compras y envíos como <strong className="text-red-600">Gasto</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-600">EmprendeGo calcula tu <strong className="text-blue-600">balance</strong> automáticamente</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => openModal('ingreso')}>
                Agregar mi primer registro
              </Button>
              <Button variant="secondary" onClick={() => setShowOnboarding(true)} icon={HelpCircle}>
                Ver guía rápida
              </Button>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No hay registros que coincidan con tu búsqueda"
            action={() => { setFilter('all'); setSearchQuery('') }}
            actionLabel="Limpiar filtros"
          />
        ) : (
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={openEditModal}
                onDelete={setDeleteEntry}
              />
            ))}
            
            {filteredEntries.length < entries.length && (
              <p className="text-center text-sm text-gray-500 pt-2">
                Mostrando {filteredEntries.length} de {entries.length} registros
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit entry modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null) }}
        title={editingEntry ? 'Editar registro' : 'Nuevo registro'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'ingreso', category: '' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.type === 'ingreso'
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💰 Ingreso
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'gasto', category: '' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.type === 'gasto'
                  ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💸 Gasto
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, amount: value })
                }}
                className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 text-gray-900 text-xl font-bold placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">El monto debe ser mayor a 0</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {financialCategories[formData.type === 'ingreso' ? 'ingresos' : 'gastos'].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.category === cat.id
                      ? formData.type === 'ingreso'
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <Input
            label="Descripción (opcional)"
            placeholder="Ej: Venta de torta de chocolate a Juan"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Date */}
          <Input
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          {/* Advanced options (collapsible) */}
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full"
            >
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Campos opcionales
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <Input
                  label="Referencia"
                  placeholder="Ej: Factura 001, Nequi, Transferencia..."
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalOpen(false); setEditingEntry(null) }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingEntry ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Finanzas
