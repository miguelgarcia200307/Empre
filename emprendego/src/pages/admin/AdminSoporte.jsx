import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  Button,
  Input,
  Modal,
  EmptyState,
  Drawer,
} from '../../components/ui'
import { TabPills } from '../../components/ui/Tabs'
import Pagination from '../../components/ui/Pagination'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import {
  MessageSquare,
  Search,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Store,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Tag,
  Loader2,
  FileText,
  RefreshCw,
} from 'lucide-react'

const TABS = [
  { id: 'all', label: 'Todos', icon: MessageSquare },
  { id: 'open', label: 'Abiertos', icon: Clock },
  { id: 'in_progress', label: 'En progreso', icon: RefreshCw },
  { id: 'resolved', label: 'Resueltos', icon: CheckCircle },
  { id: 'closed', label: 'Cerrados', icon: XCircle },
]

const CATEGORIES = {
  general: { label: 'General', color: 'bg-slate-100 text-slate-700' },
  billing: { label: 'Facturación', color: 'bg-blue-100 text-blue-700' },
  technical: { label: 'Técnico', color: 'bg-purple-100 text-purple-700' },
  feature_request: { label: 'Sugerencia', color: 'bg-emerald-100 text-emerald-700' },
  bug: { label: 'Bug', color: 'bg-rose-100 text-rose-700' },
}

const PRIORITIES = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-rose-100 text-rose-700' },
}

const STATUS_CONFIG = {
  open: { label: 'Abierto', color: 'bg-amber-100 text-amber-700', icon: Clock },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  resolved: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  closed: { label: 'Cerrado', color: 'bg-slate-100 text-slate-600', icon: XCircle },
}

const AdminSoporte = () => {
  const toast = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [replies, setReplies] = useState([])
  const [newReply, setNewReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  const pageSize = 15

  const fetchTickets = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            phone
          ),
          stores (
            id,
            name,
            slug
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Status filter
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      // Category filter
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      // Search
      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
      }

      // Pagination
      const start = (currentPage - 1) * pageSize
      query = query.range(start, start + pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error

      setTickets(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Error al cargar tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('support_replies')
        .select(`
          *,
          admin:profiles!support_replies_admin_id_fkey (
            id,
            full_name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setReplies(data || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [activeTab, categoryFilter, searchQuery, currentPage])

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id)
    }
  }, [selectedTicket])

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket)
    setDrawerOpen(true)
    setNewReply('')
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedTicket(null)
    setReplies([])
    setNewReply('')
  }

  const handleSendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return

    setSendingReply(true)
    try {
      const { error } = await supabase
        .from('support_replies')
        .insert([{
          ticket_id: selectedTicket.id,
          admin_id: user?.id,
          message: newReply.trim(),
          is_internal: false,
        }])

      if (error) throw error

      // Si el ticket está abierto, cambiarlo a en progreso
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', selectedTicket.id)

        setSelectedTicket({ ...selectedTicket, status: 'in_progress' })
      }

      toast.success('Respuesta enviada')
      setNewReply('')
      fetchReplies(selectedTicket.id)
      fetchTickets()
    } catch (error) {
      toast.error('Error al enviar respuesta')
    } finally {
      setSendingReply(false)
    }
  }

  const handleChangeStatus = async (newStatus) => {
    if (!selectedTicket) return

    setChangingStatus(true)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : selectedTicket.resolved_at,
        })
        .eq('id', selectedTicket.id)

      if (error) throw error

      setSelectedTicket({ ...selectedTicket, status: newStatus })
      toast.success(`Estado cambiado a ${STATUS_CONFIG[newStatus].label}`)
      fetchTickets()
    } catch (error) {
      toast.error('Error al cambiar estado')
    } finally {
      setChangingStatus(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeAgo = (date) => {
    if (!date) return '-'
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `hace ${diffMins}min`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return formatDate(date)
  }

  const stats = {
    total: totalCount,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soporte</h1>
          <p className="text-slate-500 mt-1">Gestiona los tickets de soporte de los usuarios</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-4 h-4" />
              {stats.open} abiertos
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-blue-600">
              <RefreshCw className="w-4 h-4" />
              {stats.in_progress} en progreso
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <TabPills
          tabs={TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por asunto o mensaje..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No hay tickets"
            description={activeTab === 'all' ? 'Aún no hay tickets de soporte' : `No hay tickets con estado "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
          />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                const categoryConfig = CATEGORIES[ticket.category] || CATEGORIES.general
                const priorityConfig = PRIORITIES[ticket.priority] || PRIORITIES.medium
                const StatusIcon = statusConfig.icon

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    {/* Status indicator */}
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.color} flex items-center justify-center`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    {/* Ticket info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 truncate">
                          {ticket.subject}
                        </span>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.color}`}>
                          {categoryConfig.label}
                        </span>
                        {ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                          <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {ticket.profiles?.full_name || 'Usuario'}
                        </span>
                        {ticket.stores && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" />
                              {ticket.stores.name}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getTimeAgo(ticket.created_at)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                )
              })}
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="px-4 py-3 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalCount / pageSize)}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        title={selectedTicket?.subject || 'Ticket'}
        size="lg"
      >
        {selectedTicket && (
          <div className="h-full flex flex-col">
            {/* Ticket header info */}
            <div className="shrink-0 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_CONFIG[selectedTicket.status]?.color}`}>
                  {STATUS_CONFIG[selectedTicket.status]?.label}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORIES[selectedTicket.category]?.color}`}>
                  {CATEGORIES[selectedTicket.category]?.label}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PRIORITIES[selectedTicket.priority]?.color}`}>
                  Prioridad: {PRIORITIES[selectedTicket.priority]?.label}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{selectedTicket.profiles?.full_name || 'Usuario desconocido'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{selectedTicket.profiles?.email || '-'}</span>
                </div>
                {selectedTicket.stores && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Store className="w-4 h-4 text-slate-400" />
                    <span>{selectedTicket.stores.name} (/{selectedTicket.stores.slug})</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formatDate(selectedTicket.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Original message */}
            <div className="shrink-0 py-4 border-b border-slate-200">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Mensaje original</p>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>

            {/* Replies */}
            <div className="flex-1 overflow-y-auto py-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Respuestas ({replies.length})
              </p>
              {replies.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Sin respuestas aún</p>
              ) : (
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-xl ${
                        reply.admin_id ? 'bg-blue-50 ml-4' : 'bg-slate-50 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">
                          {reply.admin_id ? (reply.admin?.full_name || 'Admin') : (selectedTicket.profiles?.full_name || 'Usuario')}
                        </span>
                        <span className="text-xs text-slate-500">{getTimeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply input */}
            <div className="shrink-0 pt-4 border-t border-slate-200 space-y-3">
              {/* Status buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">Cambiar estado:</span>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleChangeStatus(key)}
                    disabled={changingStatus || selectedTicket.status === key}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                      selectedTicket.status === key
                        ? config.color
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              {/* Reply textarea */}
              <div className="flex gap-2">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows={3}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!newReply.trim() || sendingReply}
                  className="self-end"
                >
                  {sendingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AdminSoporte
