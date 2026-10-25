
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Car, BarChart3, Settings, Clock, CheckCircle, X, Eye, MessageCircleDashed as MessageCircle, Shield, FileText, Search, UserCheck, Crown, Edit3, Download, Save, RotateCcw, Mail, Globe, Lock, Bell, Star, Palette, ShoppingCart, TrendingUp, Clock3, MailOpen, MessageSquareMore, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useListingsStore, type Listing } from '../stores/listingsStore'
import { useUsersStore, type User, type UserFilters } from '../stores/usersStore'

type UserRoleFilter = UserFilters['role']
type UserStatusFilter = UserFilters['status']
import { useConfigStore, type SystemConfig } from '../stores/configStore'
import { useCustomizationStore } from '../stores/customizationStore'
import { useContactMessagesStore } from '../stores/contactMessagesStore'
import type { ContactMessage, ContactMessageFilters } from '../types/contactMessage'
import ColorPicker from '../components/ColorPicker'
import ImageUploader from '../components/ImageUploader'
import PowerTorqueBar from '../components/PowerTorqueBar'
import ContactMessageCard from '../components/ContactMessageCard'
import MessageResponse from '../components/MessageResponse'
import toast from 'react-hot-toast'

/** Botão "Excluir" que pede confirmação na própria tela antes de apagar. */
const BotaoExcluir = ({ onConfirm, compacto = false }: { onConfirm: () => Promise<unknown>; compacto?: boolean }) => {
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  if (confirmando) {
    return (
      <div className="flex items-center gap-2" role="group" aria-label="Confirmar exclusão">
        <span className="text-sm text-gray-300">Excluir de vez?</span>
        <button
          disabled={excluindo}
          onClick={async () => {
            setExcluindo(true)
            await onConfirm()
            setExcluindo(false)
            setConfirmando(false)
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-montserrat font-600 text-sm disabled:opacity-50"
        >
          {excluindo ? 'Excluindo…' : 'Sim, excluir'}
        </button>
        <button onClick={() => setConfirmando(false)} className="text-gray-400 hover:text-white px-2 py-2 text-sm">
          Cancelar
        </button>
      </div>
    )
  }
  return compacto ? (
    <button
      onClick={() => setConfirmando(true)}
      title="Excluir anúncio"
      aria-label="Excluir anúncio"
      className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  ) : (
    <button
      onClick={() => setConfirmando(true)}
      className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
    >
      <Trash2 className="w-4 h-4" />
      <span>Excluir</span>
    </button>
  )
}

const Admin = () => {
  const { user } = useAuthStore()
  const { 
    listings, 
    approveListing, 
    rejectListing, 
    updateListing, 
    markAsSold, 
    deleteListing,
    getSoldListings, 
    getListingsByStatus 
  } = useListingsStore()
  
  const { 
    users, filters, setFilters, getFilteredUsers, 
    getUserStats, banUser, unbanUser, suspendUser, promoteToAdmin, 
    demoteFromAdmin, deleteUser, updateUser, initializeUsers 
  } = useUsersStore()
  
  const { config, loading: configLoading, updateConfig, exportConfig } = useConfigStore()
  
  const {
    saving: customizationSaving,
    getConfigValue,
    fetchConfigs,
    updateConfig: updateCustomizationConfig,
    exportConfigs
  } = useCustomizationStore()

  // Contact Messages Store
  const {
    messages: contactMessages,
    filters: messageFilters,
    setFilters: setMessageFilters,
    getFilteredMessages,
    getStats: getMessageStats,
    getUnreadCount,
    markAsRead,
    markAsResponded,
    archiveMessage,
    updatePriority,
    markMultipleAsRead,
    archiveMultiple,
    updateMultiplePriority,
    responseTemplates
  } = useContactMessagesStore()
  
  const [activeTab, setActiveTab] = useState('revisao')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState<string>('')
  const [rejectionComment, setRejectionComment] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  
  // User Management States
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userAction, setUserAction] = useState<'ban' | 'suspend' | 'promote' | 'demote' | 'delete' | 'edit' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [suspensionDays, setSuspensionDays] = useState(7)
  const [editUserData, setEditUserData] = useState<Partial<User>>({})

  // Config States
  const [configChanges, setConfigChanges] = useState<Partial<SystemConfig>>({})
  const [, setShowConfigExport] = useState(false)

  // Customization States
  const [customizationChanges, setCustomizationChanges] = useState<Record<string, string>>({})
  const [, setShowCustomizationExport] = useState(false)

  // Contact Messages States
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [respondingMessage, setRespondingMessage] = useState<ContactMessage | null>(null)
  const [, setShowMessageDetails] = useState(false)
  const [, setSelectedMessage] = useState<ContactMessage | null>(null)

  // Safe initialization effect
  // Usuários: carrega ao abrir o Admin e atualiza só quando a aba Usuários é aberta
  // (antes recarregava a cada troca de aba, consultando o banco sem necessidade)
  useEffect(() => {
    void initializeUsers()
  }, [initializeUsers])

  useEffect(() => {
    if (activeTab === 'usuarios') void initializeUsers()
    if (activeTab === 'customizacao') void fetchConfigs()
  }, [activeTab, initializeUsers, fetchConfigs])

  // Memoized data to prevent unnecessary re-renders
  const pendingListings = getListingsByStatus('em_revisao')
  const publishedListings = getListingsByStatus('publicado')
  const soldListings = getSoldListings()

  // Calculados a cada render: os getters do store são estáveis e o useMemo congelava os dados
  const filteredMessages = getFilteredMessages()
  const messageStats = getMessageStats()
  const unreadMessagesCount = getUnreadCount()

  const handleApprove = React.useCallback(async (listingId: string) => {
    setSelectedListingId(listingId)
    setShowApproveModal(true)
  }, [])

  const confirmApproval = React.useCallback(async () => {
    try {
      const success = await approveListing(selectedListingId, adminNotes)
      if (success) {
        toast.success('Anúncio aprovado com sucesso!')
        setShowApproveModal(false)
        setAdminNotes('')
        setSelectedListingId('')
      } else {
        toast.error('Erro ao aprovar anúncio')
      }
    } catch {
      toast.error('Erro ao aprovar anúncio')
    }
  }, [approveListing, selectedListingId, adminNotes])

  const handleReject = React.useCallback(async (listingId: string) => {
    setSelectedListingId(listingId)
    setShowRejectModal(true)
  }, [])

  const confirmRejection = React.useCallback(async () => {
    if (!rejectionComment.trim()) {
      toast.error('Por favor, forneça um motivo para a rejeição')
      return
    }

    try {
      const success = await rejectListing(selectedListingId, rejectionComment)
      if (success) {
        toast.success('Anúncio rejeitado com feedback enviado')
        setShowRejectModal(false)
        setRejectionComment('')
        setSelectedListingId('')
      } else {
        toast.error('Erro ao rejeitar anúncio')
      }
    } catch {
      toast.error('Erro ao rejeitar anúncio')
    }
  }, [rejectListing, selectedListingId, rejectionComment])

  const handleToggleDestaque = React.useCallback(async (listingId: string, currentDestaque: boolean) => {
    try {
      const success = await updateListing(listingId, { destaque: !currentDestaque })
      if (success) {
        toast.success(currentDestaque ? 'Destaque removido' : 'Anúncio destacado!')
      } else {
        toast.error('Erro ao alterar destaque')
      }
    } catch {
      toast.error('Erro ao alterar destaque')
    }
  }, [updateListing])

  const handleDelete = React.useCallback(async (listingId: string) => {
    if (await deleteListing(listingId)) toast.success('Anúncio excluído.')
  }, [deleteListing])

  const handleMarkAsSold = React.useCallback(async (listingId: string) => {
    setSelectedListingId(listingId)
    setShowSoldModal(true)
  }, [])

  const confirmMarkAsSold = React.useCallback(async () => {
    try {
      const success = await markAsSold(selectedListingId, adminNotes)
      if (success) {
        toast.success('Veículo marcado como vendido!')
        setShowSoldModal(false)
        setAdminNotes('')
        setSelectedListingId('')
      } else {
        toast.error('Erro ao marcar como vendido')
      }
    } catch {
      toast.error('Erro ao marcar como vendido')
    }
  }, [markAsSold, selectedListingId, adminNotes])

  const handleEditListing = React.useCallback((listing: Listing) => {
    setEditingListing(listing)
    setShowEditModal(true)
  }, [])

  const handleSaveEdit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingListing) return

    try {
      const formData = new FormData(event.target as HTMLFormElement)
      const updates = {
        titulo: formData.get('titulo') as string,
        preco: formData.get('preco') as string,
        ano: parseInt(formData.get('ano') as string),
        cidade: formData.get('cidade') as string,
        uf: formData.get('uf') as string,
        categoria: formData.get('categoria') as Listing['categoria'],
        descricao: formData.get('descricao') as string,
        power_whp: parseInt(formData.get('power_whp') as string) || undefined,
        torque_kgfm: parseFloat(formData.get('torque_kgfm') as string) || undefined,
        tracao: (formData.get('tracao') as Listing['tracao']) || undefined,
        aceita_troca: formData.get('aceita_troca') === 'true'
      }

      const success = await updateListing(editingListing.id, updates)
      if (success) {
        toast.success('Anúncio atualizado com sucesso!')
        setShowEditModal(false)
        setEditingListing(null)
      } else {
        toast.error('Erro ao atualizar anúncio')
      }
    } catch {
      toast.error('Erro ao atualizar anúncio')
    }
  }, [updateListing, editingListing])

  // User Management Functions
  const resetUserModal = React.useCallback(() => {
    setSelectedUser(null)
    setUserAction(null)
    setActionReason('')
    setSuspensionDays(7)
    setEditUserData({})
  }, [])

  const handleUserAction = React.useCallback((user: User, action: typeof userAction) => {
    setSelectedUser(user)
    setUserAction(action)
    setEditUserData(user)
    setShowUserModal(true)
  }, [])

  const confirmUserAction = React.useCallback(async () => {
    if (!selectedUser || !userAction) return

    try {
      let success = false
      const userId = selectedUser.id

      switch (userAction) {
        case 'ban':
          if (!actionReason.trim()) {
            toast.error('Forneça um motivo para o banimento')
            return
          }
          success = await banUser(userId, actionReason)
          break
        case 'suspend':
          if (!actionReason.trim()) {
            toast.error('Forneça um motivo para a suspensão')
            return
          }
          success = await suspendUser(userId, actionReason, suspensionDays)
          break
        case 'promote':
          success = await promoteToAdmin(userId)
          break
        case 'demote':
          success = await demoteFromAdmin(userId)
          break
        case 'delete':
          success = await deleteUser(userId)
          break
        case 'edit':
          success = await updateUser(userId, editUserData)
          break
      }

      if (success) {
        toast.success('Ação executada com sucesso!')
        setShowUserModal(false)
        resetUserModal()
      } else {
        toast.error('Erro ao executar ação')
      }
    } catch {
      toast.error('Erro ao executar ação')
    }
  }, [selectedUser, userAction, actionReason, suspensionDays, editUserData, banUser, suspendUser, promoteToAdmin, demoteFromAdmin, deleteUser, updateUser, resetUserModal])

  const handleUnbanUser = React.useCallback(async (userId: string) => {
    try {
      const success = await unbanUser(userId)
      if (success) {
        toast.success('Usuário desbaneado com sucesso!')
      } else {
        toast.error('Erro ao desbanear usuário')
      }
    } catch {
      toast.error('Erro ao desbanear usuário')
    }
  }, [unbanUser])

  // Config Functions
  const handleConfigChange = React.useCallback(<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfigChanges((prev) => ({ ...prev, [key]: value }))
  }, [])

  const saveConfig = React.useCallback(async () => {
    try {
      const success = await updateConfig(configChanges)
      if (success) {
        toast.success('Configurações salvas com sucesso!')
        setConfigChanges({})
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch {
      toast.error('Erro ao salvar configurações')
    }
  }, [updateConfig, configChanges])

  const handleConfigExport = React.useCallback(() => {
    try {
      const configData = exportConfig()
      navigator.clipboard.writeText(configData)
      toast.success('Configurações copiadas para a área de transferência!')
      setShowConfigExport(true)
    } catch {
      toast.error('Erro ao exportar configurações')
    }
  }, [exportConfig])

  // Customization Functions
  const handleCustomizationChange = React.useCallback((key: string, value: string) => {
    setCustomizationChanges(prev => ({ ...prev, [key]: value }))
  }, [])

  const getCurrentCustomizationValue = React.useCallback((key: string) => {
    return customizationChanges[key] ?? getConfigValue(key) ?? ''
  }, [customizationChanges, getConfigValue])

  const saveCustomizations = React.useCallback(async () => {
    try {
      const promises = Object.entries(customizationChanges).map(([key, value]) =>
        updateCustomizationConfig(key, value)
      )
      
      const results = await Promise.all(promises)
      const allSuccessful = results.every(result => result)
      
      if (allSuccessful) {
        setCustomizationChanges({})
        toast.success('Customizações salvas com sucesso!')
      } else {
        toast.error('Algumas alterações falharam')
      }
    } catch {
      toast.error('Erro ao salvar customizações')
    }
  }, [customizationChanges, updateCustomizationConfig])

  const resetCustomizations = React.useCallback(() => {
    setCustomizationChanges({})
    toast('Alterações descartadas', { icon: 'ℹ️' })
  }, [])

  const exportCustomizations = React.useCallback(() => {
    try {
      const data = exportConfigs()
      navigator.clipboard.writeText(data)
      setShowCustomizationExport(true)
      toast.success('Configurações copiadas para área de transferência!')
    } catch {
      toast.error('Erro ao exportar configurações')
    }
  }, [exportConfigs])


  // Contact Messages Functions
  const handleMessageSelect = React.useCallback((messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }, [])

  const handleMarkMessageAsRead = React.useCallback((messageId: string) => {
    try {
      markAsRead(messageId, user?.id || 'admin')
      toast.success('Mensagem marcada como lida')
    } catch {
      toast.error('Erro ao marcar mensagem como lida')
    }
  }, [markAsRead, user?.id])

  const handleRespondMessage = React.useCallback((messageId: string) => {
    const message = contactMessages.find(m => m.id === messageId)
    if (message) {
      setRespondingMessage(message)
      setShowResponseModal(true)
      // Mark as read when opening response
      if (message.status === 'nova') {
        markAsRead(messageId, user?.id || 'admin')
      }
    }
  }, [contactMessages, markAsRead, user?.id])

  const handleSendResponse = React.useCallback(async (response: string, messageId: string) => {
    try {
      markAsResponded(messageId, response, user?.id || 'admin')
      toast.success('Resposta enviada com sucesso!')
    } catch {
      toast.error('Erro ao enviar resposta')
    }
  }, [markAsResponded, user?.id])

  const handleArchiveMessage = React.useCallback((messageId: string) => {
    try {
      archiveMessage(messageId)
      toast.success('Mensagem arquivada')
    } catch {
      toast.error('Erro ao arquivar mensagem')
    }
  }, [archiveMessage])

  const handleUpdateMessagePriority = React.useCallback((messageId: string, priority: ContactMessage['priority']) => {
    try {
      updatePriority(messageId, priority)
      toast.success('Prioridade atualizada')
    } catch {
      toast.error('Erro ao atualizar prioridade')
    }
  }, [updatePriority])

  const handleViewMessageDetails = React.useCallback((messageId: string) => {
    const message = contactMessages.find(m => m.id === messageId)
    if (message) {
      setSelectedMessage(message)
      setShowMessageDetails(true)
      // Mark as read when viewing details
      if (message.status === 'nova') {
        markAsRead(messageId, user?.id || 'admin')
      }
    }
  }, [contactMessages, markAsRead, user?.id])

  const handleBulkMarkAsRead = React.useCallback(() => {
    if (selectedMessages.length > 0) {
      try {
        markMultipleAsRead(selectedMessages, user?.id || 'admin')
        setSelectedMessages([])
        toast.success('Mensagens marcadas como lidas')
      } catch {
        toast.error('Erro ao marcar mensagens como lidas')
      }
    }
  }, [selectedMessages, markMultipleAsRead, user?.id])

  const handleBulkArchive = React.useCallback(() => {
    if (selectedMessages.length > 0) {
      try {
        archiveMultiple(selectedMessages)
        setSelectedMessages([])
        toast.success('Mensagens arquivadas')
      } catch {
        toast.error('Erro ao arquivar mensagens')
      }
    }
  }, [selectedMessages, archiveMultiple])

  const handleBulkPriority = React.useCallback((priority: ContactMessage['priority']) => {
    if (selectedMessages.length > 0) {
      try {
        updateMultiplePriority(selectedMessages, priority)
        setSelectedMessages([])
        toast.success('Prioridade atualizada')
      } catch {
        toast.error('Erro ao atualizar prioridade')
      }
    }
  }, [selectedMessages, updateMultiplePriority])

  const getStatusColor = React.useCallback((status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-400'
      case 'banido': return 'text-red-400'
      case 'suspenso': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }, [])

  const getStatusBg = React.useCallback((status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-400/20'
      case 'banido': return 'bg-red-400/20'
      case 'suspenso': return 'bg-yellow-400/20'
      default: return 'bg-gray-400/20'
    }
  }, [])

  // Memoized stats
  const stats = React.useMemo(() => ({
    total_listings: listings.length,
    pending_review: pendingListings.length,
    published: publishedListings.length,
    sold: soldListings.length,
    total_users: users.length,
    total_views: listings.reduce((sum, l) => sum + l.views, 0),
    total_whatsapp: listings.reduce((sum, l) => sum + l.clicks_whatsapp, 0)
  }), [listings, pendingListings, publishedListings, soldListings, users])

  const userStats = getUserStats()
  const filteredUsers = getFilteredUsers()

  const getCategoryStats = React.useCallback(() => {
    const categories = ['turbo', 'aspirado', 'original', 'pista']
    return categories.map(cat => ({
      name: cat,
      count: listings.filter(l => l.categoria === cat && l.status === 'publicado').length
    }))
  }, [listings])

  // Prevent rendering if user is not available
  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-white font-montserrat">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-red-text" />
            <h1 className="font-bebas text-4xl md:text-5xl text-white">
              PAINEL ADMINISTRATIVO
            </h1>
          </div>
          <p className="text-gray-400 font-montserrat">
            Bem-vindo, <span className="text-red-text font-600">{user.nome}</span> - Administrador
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-primary-gray p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'revisao', label: 'Revisão', icon: Clock, badge: pendingListings.length },
              { id: 'anuncios', label: 'Anúncios', icon: Car },
              { id: 'vendidos', label: 'Vendidos', icon: ShoppingCart, badge: soldListings.length },
              { id: 'mensagens', label: 'Mensagens', icon: MessageSquareMore, badge: unreadMessagesCount },
              { id: 'usuarios', label: 'Usuários', icon: Users, badge: userStats.total },
              { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
              { id: 'customizacao', label: 'Customização', icon: Palette },
              { id: 'configuracoes', label: 'Configurações', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-montserrat font-600 transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-red text-white'
                      : 'text-gray-400 hover:text-white hover:bg-primary-black/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Aba de Revisão */}
        {activeTab === 'revisao' && (
          <motion.div
            key="revisao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">ANÚNCIOS PENDENTES</h2>
              <div className="bg-primary-red/20 text-red-text px-4 py-2 rounded-lg font-montserrat font-600">
                {pendingListings.length} aguardando revisão
              </div>
            </div>

            {pendingListings.length > 0 ? (
              <div className="grid gap-6">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Imagem */}
                      <div className="lg:w-1/3">
                        <img
                          src={listing.images[0]}
                          alt={listing.titulo}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>

                      {/* Conteúdo */}
                      <div className="lg:w-2/3 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bebas text-2xl text-white mb-2">{listing.titulo}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 font-montserrat">
                              <span>{listing.ano}</span>
                              <span>{listing.cidade}, {listing.uf}</span>
                              <span className="capitalize bg-primary-red/20 text-red-text px-2 py-1 rounded">
                                {listing.categoria}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bebas text-2xl text-red-text">{listing.preco}</div>
                            <div className="text-sm text-gray-400 font-montserrat">
                              {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        {!!listing.power_whp && (
                          <div className="space-y-2 mb-3">
                            <PowerTorqueBar
                              value={listing.power_whp}
                              unit="whp"
                              icon="⚡"
                              color="#FF3B3B"
                              size="small"
                              category={listing.categoria}
                            />
                            {!!listing.torque_kgfm && (
                              <PowerTorqueBar
                                value={listing.torque_kgfm}
                                unit="kgfm"
                                icon="🔧"
                                color="#3B7BFF"
                                size="small"
                                category={listing.categoria}
                              />
                            )}
                          </div>
                        )}

                        <p className="text-gray-300 font-montserrat line-clamp-3">
                          {listing.descricao}
                        </p>

                        {/* Ações */}
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Aprovar</span>
                          </button>
                          
                          <button
                            onClick={() => handleReject(listing.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Rejeitar</span>
                          </button>
                          
                          <button
                            onClick={() => handleEditListing(listing)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          
                          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>Visualizar</span>
                          </button>

                          <BotaoExcluir onConfirm={() => handleDelete(listing.id)} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gray-400 mb-2">
                  Nenhum anúncio pendente
                </h3>
                <p className="text-gray-500 font-montserrat">
                  Todos os anúncios foram revisados
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Aba de Anúncios */}
        {activeTab === 'anuncios' && (
          <motion.div
            key="anuncios"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">ANÚNCIOS PUBLICADOS</h2>
              <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg font-montserrat font-600">
                {publishedListings.length} publicados
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar anúncios..."
                    className="w-full pl-10 pr-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                  />
                </div>
                
                <select className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat">
                  <option value="todos">Todas as categorias</option>
                  <option value="turbo">Turbo</option>
                  <option value="aspirado">Aspirado</option>
                  <option value="original">Original</option>
                  <option value="pista">Pista</option>
                </select>
                
                <select className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat">
                  <option value="todos">Todos os estados</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                </select>
                
                <select className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat">
                  <option value="recentes">Mais recentes</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="views">Mais visualizados</option>
                  <option value="preco_alto">Maior preço</option>
                  <option value="preco_baixo">Menor preço</option>
                </select>
              </div>
            </div>

            {/* Lista de Anúncios */}
            <div className="grid gap-4">
              {publishedListings.map((listing) => (
                <div key={listing.id} className="bg-primary-gray border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={listing.images[0]}
                      alt={listing.titulo}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bebas text-xl text-white">{listing.titulo}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-400 font-montserrat">
                            <span>{listing.ano}</span>
                            <span>{listing.cidade}, {listing.uf}</span>
                            <span className="capitalize">{listing.categoria}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bebas text-xl text-red-text">{listing.preco}</div>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{listing.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{listing.clicks_whatsapp}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {listing.destaque && (
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs font-montserrat font-600">
                          DESTAQUE
                        </span>
                      )}
                      
                      <button
                        onClick={() => handleToggleDestaque(listing.id, listing.destaque)}
                        className={`p-2 rounded-lg transition-colors ${
                          listing.destaque 
                            ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30' 
                            : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditListing(listing)}
                        className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleMarkAsSold(listing.id)}
                        title="Marcar como vendido"
                        aria-label="Marcar como vendido"
                        className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>

                      <BotaoExcluir compacto onConfirm={() => handleDelete(listing.id)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Aba de Vendidos */}
        {activeTab === 'vendidos' && (
          <motion.div
            key="vendidos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">VEÍCULOS VENDIDOS</h2>
              <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg font-montserrat font-600">
                {soldListings.length} vendidos
              </div>
            </div>

            {soldListings.length > 0 ? (
              <div className="grid gap-4">
                {soldListings.map((listing) => (
                  <div key={listing.id} className="bg-primary-gray border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={listing.images[0]}
                        alt={listing.titulo}
                        className="w-20 h-20 object-cover rounded-lg opacity-75"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bebas text-xl text-white">{listing.titulo}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-400 font-montserrat">
                              <span>{listing.ano}</span>
                              <span>{listing.cidade}, {listing.uf}</span>
                              <span className="capitalize">{listing.categoria}</span>
                            </div>
                            {listing.sold_at && (
                              <div className="text-sm text-green-400 font-montserrat mt-1">
                                Vendido em {new Date(listing.sold_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bebas text-xl text-green-400">VENDIDO</div>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{listing.views}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{listing.clicks_whatsapp}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {listing.admin_notes && (
                          <div className="mt-3 p-3 bg-primary-black border border-gray-800 rounded-lg">
                            <div className="text-sm text-gray-400 font-montserrat">
                              <strong>Observações do Admin:</strong> {listing.admin_notes}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-lg text-sm font-montserrat font-600">
                          VENDIDO
                        </span>
                        <BotaoExcluir compacto onConfirm={() => handleDelete(listing.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gray-400 mb-2">
                  Nenhum veículo vendido
                </h3>
                <p className="text-gray-500 font-montserrat">
                  Os veículos vendidos aparecerão aqui
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Aba de Usuários */}
        {activeTab === 'usuarios' && (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">GERENCIAR USUÁRIOS</h2>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-montserrat font-600">
                  {userStats.total} usuários
                </div>
                <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg font-montserrat font-600">
                  {userStats.active} ativos
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-blue-400">{userStats.total}</div>
                <div className="text-sm text-gray-400 font-montserrat">Total</div>
              </div>
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-green-400">{userStats.active}</div>
                <div className="text-sm text-gray-400 font-montserrat">Ativos</div>
              </div>
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-red-400">{userStats.banned}</div>
                <div className="text-sm text-gray-400 font-montserrat">Banidos</div>
              </div>
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-yellow-400">{userStats.suspended}</div>
                <div className="text-sm text-gray-400 font-montserrat">Suspensos</div>
              </div>
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-purple-400">{userStats.admins}</div>
                <div className="text-sm text-gray-400 font-montserrat">Admins</div>
              </div>
              <div className="bg-primary-gray border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bebas text-cyan-400">{userStats.verified}</div>
                <div className="text-sm text-gray-400 font-montserrat">Verificados</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                  />
                </div>
                
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ role: e.target.value as UserRoleFilter })}
                  className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                >
                  <option value="all">Todos os papéis</option>
                  <option value="user">Usuários</option>
                  <option value="admin">Administradores</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ status: e.target.value as UserStatusFilter })}
                  className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                >
                  <option value="all">Todos os status</option>
                  <option value="ativo">Ativos</option>
                  <option value="banido">Banidos</option>
                  <option value="suspenso">Suspensos</option>
                </select>
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-primary-gray border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bebas text-lg">
                          {user.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bebas text-lg text-white">{user.nome}</h3>
                          {user.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          )}
                          {user.role === 'admin' && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 font-montserrat">
                          <span>{user.email}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBg(user.status)} ${getStatusColor(user.status)}`}>
                            {user.status.toUpperCase()}
                          </span>
                          <span>{user.total_listings} anúncios</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.status === 'banido' ? (
                        <button
                          onClick={() => handleUnbanUser(user.id)}
                          className="bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                        >
                          Desbanear
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUserAction(user, 'ban')}
                            className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                          >
                            Banir
                          </button>
                          <button
                            onClick={() => handleUserAction(user, 'suspend')}
                            className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                          >
                            Suspender
                          </button>
                        </>
                      )}
                      
                      {user.role === 'user' ? (
                        <button
                          onClick={() => handleUserAction(user, 'promote')}
                          className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                        >
                          Promover
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user, 'demote')}
                          className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                        >
                          Rebaixar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUserAction(user, 'edit')}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Aba de Relatórios */}
        {activeTab === 'relatorios' && (
          <motion.div
            key="relatorios"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="font-bebas text-3xl text-white">RELATÓRIOS E ESTATÍSTICAS</h2>

            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Car className="w-8 h-8 text-blue-400" />
                  <h3 className="font-bebas text-xl text-white">ANÚNCIOS</h3>
                </div>
                <div className="text-3xl font-bebas text-blue-400 mb-2">{stats.total_listings}</div>
                <p className="text-gray-400 font-montserrat text-sm">Total de anúncios</p>
                <div className="mt-3 space-y-1 text-sm font-montserrat">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pendentes:</span>
                    <span className="text-yellow-400">{stats.pending_review}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Publicados:</span>
                    <span className="text-green-400">{stats.published}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vendidos:</span>
                    <span className="text-blue-400">{stats.sold}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-8 h-8 text-green-400" />
                  <h3 className="font-bebas text-xl text-white">USUÁRIOS</h3>
                </div>
                <div className="text-3xl font-bebas text-green-400 mb-2">{stats.total_users}</div>
                <p className="text-gray-400 font-montserrat text-sm">Usuários cadastrados</p>
                <div className="mt-3 space-y-1 text-sm font-montserrat">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ativos:</span>
                    <span className="text-green-400">{userStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verificados:</span>
                    <span className="text-blue-400">{userStats.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admins:</span>
                    <span className="text-purple-400">{userStats.admins}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <h3 className="font-bebas text-xl text-white">VISUALIZAÇÕES</h3>
                </div>
                <div className="text-3xl font-bebas text-purple-400 mb-2">{stats.total_views.toLocaleString()}</div>
                <p className="text-gray-400 font-montserrat text-sm">Total de visualizações</p>
                <div className="mt-3 text-sm font-montserrat">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Média por anúncio:</span>
                    <span className="text-purple-400">
                      {stats.total_listings > 0 ? Math.round(stats.total_views / stats.total_listings) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="w-8 h-8 text-yellow-400" />
                  <h3 className="font-bebas text-xl text-white">CONTATOS</h3>
                </div>
                <div className="text-3xl font-bebas text-yellow-400 mb-2">{stats.total_whatsapp}</div>
                <p className="text-gray-400 font-montserrat text-sm">Cliques no WhatsApp</p>
                <div className="mt-3 text-sm font-montserrat">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxa de conversão:</span>
                    <span className="text-yellow-400">
                      {stats.total_views > 0 ? ((stats.total_whatsapp / stats.total_views) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Categorias */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h3 className="font-bebas text-2xl text-white mb-6">DISTRIBUIÇÃO POR CATEGORIA</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getCategoryStats().map((category) => (
                  <div key={category.name} className="text-center">
                    <div className="bg-primary-black border border-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bebas text-red-text mb-2">{category.count}</div>
                      <div className="text-sm text-gray-400 font-montserrat capitalize">
                        {category.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividade Recente */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
              <h3 className="font-bebas text-2xl text-white mb-6">ATIVIDADE DOS ÚLTIMOS 30 DIAS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary-black border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Plus className="w-6 h-6 text-green-400" />
                    <h4 className="font-bebas text-lg text-white">NOVOS ANÚNCIOS</h4>
                  </div>
                  <div className="text-2xl font-bebas text-green-400 mb-2">
                    {listings.filter(l => {
                      const created = new Date(l.created_at)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return created >= thirtyDaysAgo
                    }).length}
                  </div>
                  <p className="text-gray-400 font-montserrat text-sm">Anúncios criados</p>
                </div>

                <div className="bg-primary-black border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                    <h4 className="font-bebas text-lg text-white">VENDAS</h4>
                  </div>
                  <div className="text-2xl font-bebas text-blue-400 mb-2">
                    {soldListings.filter(l => {
                      if (!l.sold_at) return false
                      const sold = new Date(l.sold_at)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return sold >= thirtyDaysAgo
                    }).length}
                  </div>
                  <p className="text-gray-400 font-montserrat text-sm">Veículos vendidos</p>
                </div>

                <div className="bg-primary-black border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCheck className="w-6 h-6 text-purple-400" />
                    <h4 className="font-bebas text-lg text-white">NOVOS USUÁRIOS</h4>
                  </div>
                  <div className="text-2xl font-bebas text-purple-400 mb-2">
                    {users.filter(u => {
                      const created = new Date(u.created_at)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return created >= thirtyDaysAgo
                    }).length}
                  </div>
                  <p className="text-gray-400 font-montserrat text-sm">Cadastros realizados</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba de Customização */}
        {activeTab === 'customizacao' && (
          <motion.div
            key="customizacao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">CUSTOMIZAÇÃO DO SITE</h2>
              <div className="flex items-center space-x-3">
                {Object.keys(customizationChanges).length > 0 && (
                  <>
                    <button
                      onClick={resetCustomizations}
                      className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Descartar</span>
                    </button>
                    <button
                      onClick={saveCustomizations}
                      disabled={customizationSaving}
                      className="bg-primary-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{customizationSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={exportCustomizations}
                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {/* Seções de Customização */}
            <div className="grid gap-6">
              {/* Cores e Visual */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Palette className="w-6 h-6 text-red-text" />
                  <span>CORES E VISUAL</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ColorPicker
                      label="Cor Primária"
                      value={getCurrentCustomizationValue('primary_color') || '#dc2626'}
                      onChange={(color) => handleCustomizationChange('primary_color', color)}
                    />
                  </div>
                  
                  <div>
                    <ColorPicker
                      label="Cor Secundária"
                      value={getCurrentCustomizationValue('secondary_color') || '#1f2937'}
                      onChange={(color) => handleCustomizationChange('secondary_color', color)}
                    />
                  </div>
                  
                  <div>
                    <ImageUploader
                      label="Logo do Site"
                      onChange={(url: string) => handleCustomizationChange('site_logo', url)}
                      value={getCurrentCustomizationValue('site_logo') || ''}
                    />
                  </div>
                  
                  <div>
                    <ImageUploader
                      label="Imagem de Fundo"
                      onChange={(url: string) => handleCustomizationChange('hero_background', url)}
                      value={getCurrentCustomizationValue('hero_background') || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-red-text" />
                  <span>CONTEÚDO</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Título Principal</label>
                    <input
                      type="text"
                      value={getCurrentCustomizationValue('site_title') || 'RaceMarket'}
                      onChange={(e) => handleCustomizationChange('site_title', e.target.value)}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Slogan</label>
                    <input
                      type="text"
                      value={getCurrentCustomizationValue('site_slogan') || 'O marketplace dos carros preparados'}
                      onChange={(e) => handleCustomizationChange('site_slogan', e.target.value)}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Descrição do Site</label>
                    <textarea
                      value={getCurrentCustomizationValue('site_description') || 'A plataforma definitiva para compra e venda de carros preparados, turbos, aspirados e de pista.'}
                      onChange={(e) => handleCustomizationChange('site_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-red-text" />
                  <span>REDES SOCIAIS</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Instagram</label>
                    <input
                      type="text"
                      value={getCurrentCustomizationValue('instagram_url') || ''}
                      onChange={(e) => handleCustomizationChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/racemarket"
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Facebook</label>
                    <input
                      type="text"
                      value={getCurrentCustomizationValue('facebook_url') || ''}
                      onChange={(e) => handleCustomizationChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/racemarket"
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">WhatsApp Suporte</label>
                    <input
                      type="text"
                      value={getCurrentCustomizationValue('whatsapp_support') || ''}
                      onChange={(e) => handleCustomizationChange('whatsapp_support', e.target.value)}
                      placeholder="5511999999999"
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Email de Contato</label>
                    <input
                      type="email"
                      value={getCurrentCustomizationValue('contact_email') || ''}
                      onChange={(e) => handleCustomizationChange('contact_email', e.target.value)}
                      placeholder="contato@racemarket.com.br"
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba de Configurações */}
        {activeTab === 'configuracoes' && (
          <motion.div
            key="configuracoes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-3xl text-white">CONFIGURAÇÕES DO SISTEMA</h2>
              <div className="flex items-center space-x-3">
                {Object.keys(configChanges).length > 0 && (
                  <>
                    <button
                      onClick={() => setConfigChanges({})}
                      className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Descartar</span>
                    </button>
                    <button
                      onClick={saveConfig}
                      disabled={configLoading}
                      className="bg-primary-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{configLoading ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleConfigExport}
                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {/* Seções de Configuração */}
            <div className="grid gap-6">
              {/* Moderação */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-red-text" />
                  <span>MODERAÇÃO</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-montserrat font-600">Aprovação Automática</label>
                      <button
                        onClick={() => handleConfigChange('auto_approval', !config.auto_approval)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (configChanges.auto_approval ?? config.auto_approval) ? 'bg-primary-red' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (configChanges.auto_approval ?? config.auto_approval) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-white font-montserrat font-600">Verificação de Telefone</label>
                      <button
                        onClick={() => handleConfigChange('require_phone_verification', !config.require_phone_verification)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (configChanges.require_phone_verification ?? config.require_phone_verification) ? 'bg-primary-red' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (configChanges.require_phone_verification ?? config.require_phone_verification) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-montserrat font-600 mb-2">Máximo de Imagens por Anúncio</label>
                      <input
                        type="number"
                        value={configChanges.max_images_per_listing ?? config.max_images_per_listing}
                        onChange={(e) => handleConfigChange('max_images_per_listing', parseInt(e.target.value))}
                        min="1"
                        max="20"
                        className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white font-montserrat font-600 mb-2">Preço Mínimo</label>
                        <input
                          type="number"
                          value={configChanges.min_price ?? config.min_price}
                          onChange={(e) => handleConfigChange('min_price', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-montserrat font-600 mb-2">Preço Máximo</label>
                        <input
                          type="number"
                          value={configChanges.max_price ?? config.max_price}
                          onChange={(e) => handleConfigChange('max_price', parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notificações */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-red-text" />
                  <span>NOTIFICAÇÕES</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-white font-montserrat font-600">Email</label>
                    <button
                      onClick={() => handleConfigChange('email_notifications', !config.email_notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (configChanges.email_notifications ?? config.email_notifications) ? 'bg-primary-red' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (configChanges.email_notifications ?? config.email_notifications) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-white font-montserrat font-600">SMS</label>
                    <button
                      onClick={() => handleConfigChange('sms_notifications', !config.sms_notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (configChanges.sms_notifications ?? config.sms_notifications) ? 'bg-primary-red' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (configChanges.sms_notifications ?? config.sms_notifications) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-white font-montserrat font-600">Push</label>
                    <button
                      onClick={() => handleConfigChange('push_notifications', !config.push_notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (configChanges.push_notifications ?? config.push_notifications) ? 'bg-primary-red' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (configChanges.push_notifications ?? config.push_notifications) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-red-text" />
                  <span>SEGURANÇA</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-montserrat font-600 mb-2">Máximo de Tentativas de Login</label>
                      <input
                        type="number"
                        value={configChanges.max_login_attempts ?? config.max_login_attempts}
                        onChange={(e) => handleConfigChange('max_login_attempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                        className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-montserrat font-600 mb-2">Timeout da Sessão (horas)</label>
                      <input
                        type="number"
                        value={configChanges.session_timeout_hours ?? config.session_timeout_hours}
                        onChange={(e) => handleConfigChange('session_timeout_hours', parseInt(e.target.value))}
                        min="1"
                        max="168"
                        className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-montserrat font-600">Verificação de Email</label>
                      <button
                        onClick={() => handleConfigChange('require_email_verification', !config.require_email_verification)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (configChanges.require_email_verification ?? config.require_email_verification) ? 'bg-primary-red' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (configChanges.require_email_verification ?? config.require_email_verification) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-white font-montserrat font-600">Modo Manutenção</label>
                      <button
                        onClick={() => handleConfigChange('site_maintenance', !config.site_maintenance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (configChanges.site_maintenance ?? config.site_maintenance) ? 'bg-red-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (configChanges.site_maintenance ?? config.site_maintenance) ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6 flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-red-text" />
                  <span>INFORMAÇÕES DE CONTATO</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Email de Contato</label>
                    <input
                      type="email"
                      value={configChanges.contact_email ?? config.contact_email}
                      onChange={(e) => handleConfigChange('contact_email', e.target.value)}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Telefone de Suporte</label>
                    <input
                      type="text"
                      value={configChanges.support_phone ?? config.support_phone}
                      onChange={(e) => handleConfigChange('support_phone', e.target.value)}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">WhatsApp Suporte</label>
                    <input
                      type="text"
                      value={configChanges.whatsapp_support ?? config.whatsapp_support}
                      onChange={(e) => handleConfigChange('whatsapp_support', e.target.value)}
                      placeholder="5511999999999"
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba de Mensagens */}
        {activeTab === 'mensagens' && (
          <motion.div
            key="mensagens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header com Estatísticas */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h2 className="font-bebas text-3xl text-white">MENSAGENS DE CONTATO</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-primary-gray border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bebas text-blue-400">{messageStats.novas}</div>
                  <div className="text-xs text-gray-400 font-montserrat">Novas</div>
                </div>
                <div className="bg-primary-gray border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bebas text-yellow-400">{messageStats.lidas}</div>
                  <div className="text-xs text-gray-400 font-montserrat">Lidas</div>
                </div>
                <div className="bg-primary-gray border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bebas text-green-400">{messageStats.respondidas}</div>
                  <div className="text-xs text-gray-400 font-montserrat">Respondidas</div>
                </div>
                <div className="bg-primary-gray border border-gray-800 rounded-lg p-3 text-center">
                  <div className="text-lg font-bebas text-gray-400">{messageStats.arquivadas}</div>
                  <div className="text-xs text-gray-400 font-montserrat">Arquivadas</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-primary-gray border border-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou mensagem..."
                    value={messageFilters.search}
                    onChange={(e) => setMessageFilters({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                  />
                </div>
                
                <select
                  value={messageFilters.status}
                  onChange={(e) => setMessageFilters({ status: e.target.value as ContactMessageFilters['status'] })}
                  className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                >
                  <option value="all">Todos os status</option>
                  <option value="nova">Novas</option>
                  <option value="lida">Lidas</option>
                  <option value="respondida">Respondidas</option>
                  <option value="arquivada">Arquivadas</option>
                </select>
                
                <select
                  value={messageFilters.priority}
                  onChange={(e) => setMessageFilters({ priority: e.target.value as ContactMessageFilters['priority'] })}
                  className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                >
                  <option value="all">Todas as prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
                
                <select
                  value={messageFilters.subject}
                  onChange={(e) => setMessageFilters({ subject: e.target.value as ContactMessageFilters['subject'] })}
                  className="px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                >
                  <option value="all">Todos os assuntos</option>
                  <option value="duvida">Dúvida Geral</option>
                  <option value="anuncio">Problema com Anúncio</option>
                  <option value="venda">Ajuda para Vender</option>
                  <option value="compra">Ajuda para Comprar</option>
                  <option value="parceria">Parceria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedMessages.length > 0 && (
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                  <span className="text-white font-montserrat font-600">
                    {selectedMessages.length} selecionada(s)
                  </span>
                  
                  <button
                    onClick={handleBulkMarkAsRead}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                  >
                    Marcar como Lidas
                  </button>
                  
                  <button
                    onClick={handleBulkArchive}
                    className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors"
                  >
                    Arquivar
                  </button>
                  
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkPriority(e.target.value as ContactMessage['priority'])
                        e.target.value = ''
                      }
                    }}
                    className="bg-primary-black border border-gray-800 rounded px-3 py-1 text-sm text-white font-montserrat"
                  >
                    <option value="">Alterar Prioridade</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                  
                  <button
                    onClick={() => setSelectedMessages([])}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <ContactMessageCard
                    key={message.id}
                    message={message}
                    onMarkAsRead={handleMarkMessageAsRead}
                    onRespond={handleRespondMessage}
                    onArchive={handleArchiveMessage}
                    onUpdatePriority={handleUpdateMessagePriority}
                    onViewDetails={handleViewMessageDetails}
                    isSelected={selectedMessages.includes(message.id)}
                    onSelect={handleMessageSelect}
                  />
                ))
              ) : (
                <div className="text-center py-20">
                  <MessageSquareMore className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-bebas text-2xl text-gray-400 mb-2">
                    Nenhuma mensagem encontrada
                  </h3>
                  <p className="text-gray-500 font-montserrat">
                    Ajuste os filtros para ver mais mensagens
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <h3 className="font-bebas text-xl text-white">VOLUME HOJE</h3>
                </div>
                <div className="text-3xl font-bebas text-blue-400 mb-2">
                  {contactMessages.filter(m => {
                    const today = new Date().toDateString()
                    const messageDate = new Date(m.created_at).toDateString()
                    return today === messageDate
                  }).length}
                </div>
                <p className="text-gray-400 font-montserrat text-sm">
                  Mensagens recebidas hoje
                </p>
              </div>

              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock3 className="w-8 h-8 text-green-400" />
                  <h3 className="font-bebas text-xl text-white">TEMPO RESPOSTA</h3>
                </div>
                <div className="text-3xl font-bebas text-green-400 mb-2">
                  {messageStats.avgResponseTime.toFixed(1)}h
                </div>
                <p className="text-gray-400 font-montserrat text-sm">
                  Tempo médio de resposta
                </p>
              </div>

              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MailOpen className="w-8 h-8 text-yellow-400" />
                  <h3 className="font-bebas text-xl text-white">ASSUNTO POPULAR</h3>
                </div>
                <div className="text-lg font-bebas text-yellow-400 mb-2">
                  {Object.entries(messageStats.subjectStats).length > 0 
                    ? Object.entries(messageStats.subjectStats)
                        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    : 'N/A'
                  }
                </div>
                <p className="text-gray-400 font-montserrat text-sm">
                  Assunto mais comum
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modais */}
      
      {/* Modal de Aprovação */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="font-bebas text-2xl text-white mb-4">APROVAR ANÚNCIO</h3>
              <p className="text-gray-400 font-montserrat mb-4">
                Confirma a aprovação deste anúncio? Ele será publicado imediatamente.
              </p>
              
              <div className="mb-4">
                <label className="block text-white font-montserrat font-600 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione observações sobre a aprovação..."
                  rows={3}
                  className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmApproval}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false)
                    setAdminNotes('')
                    setSelectedListingId('')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Rejeição */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="font-bebas text-2xl text-white mb-4">REJEITAR ANÚNCIO</h3>
              <p className="text-gray-400 font-montserrat mb-4">
                Informe o motivo da rejeição. O usuário receberá este feedback.
              </p>
              
              <div className="mb-4">
                <label className="block text-white font-montserrat font-600 mb-2">
                  Motivo da rejeição *
                </label>
                <textarea
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  placeholder="Explique por que o anúncio foi rejeitado..."
                  rows={4}
                  className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmRejection}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionComment('')
                    setSelectedListingId('')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Marcar como Vendido */}
      <AnimatePresence>
        {showSoldModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="font-bebas text-2xl text-white mb-4">MARCAR COMO VENDIDO</h3>
              <p className="text-gray-400 font-montserrat mb-4">
                Confirma que este veículo foi vendido? Esta ação removerá o anúncio da listagem ativa.
              </p>
              
              <div className="mb-4">
                <label className="block text-white font-montserrat font-600 mb-2">
                  Observações da venda (opcional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione informações sobre a venda..."
                  rows={3}
                  className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmMarkAsSold}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Marcar como Vendido
                </button>
                <button
                  onClick={() => {
                    setShowSoldModal(false)
                    setAdminNotes('')
                    setSelectedListingId('')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Anúncio */}
      <AnimatePresence>
        {showEditModal && editingListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bebas text-2xl text-white mb-6">EDITAR ANÚNCIO</h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Título</label>
                    <input
                      type="text"
                      name="titulo"
                      defaultValue={editingListing.titulo}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Preço</label>
                    <input
                      type="text"
                      name="preco"
                      defaultValue={editingListing.preco}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Ano</label>
                    <input
                      type="number"
                      name="ano"
                      defaultValue={editingListing.ano}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Categoria</label>
                    <select
                      name="categoria"
                      defaultValue={editingListing.categoria}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    >
                      <option value="turbo">Turbo</option>
                      <option value="aspirado">Aspirado</option>
                      <option value="original">Original</option>
                      <option value="pista">Pista</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      defaultValue={editingListing.cidade}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Estado</label>
                    <input
                      type="text"
                      name="uf"
                      defaultValue={editingListing.uf}
                      maxLength={2}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Potência (WHP)</label>
                    <input
                      type="number"
                      name="power_whp"
                      defaultValue={editingListing.power_whp || ''}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Torque (kgf.m)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="torque_kgfm"
                      defaultValue={editingListing.torque_kgfm || ''}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Tração</label>
                    <select
                      name="tracao"
                      defaultValue={editingListing.tracao || ''}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    >
                      <option value="">Selecione</option>
                      <option value="dianteira">Dianteira</option>
                      <option value="traseira">Traseira</option>
                      <option value="integral">Integral</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="aceita_troca"
                      value="true"
                      defaultChecked={editingListing.aceita_troca}
                      className="w-4 h-4 text-red-text bg-primary-black border-gray-800 rounded"
                    />
                    <label className="text-white font-montserrat font-600">Aceita Troca</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">Descrição</label>
                  <textarea
                    name="descricao"
                    defaultValue={editingListing.descricao}
                    rows={4}
                    className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-red hover:bg-red-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingListing(null)
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ação do Usuário */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="font-bebas text-2xl text-white mb-4">
                {userAction === 'ban' && 'BANIR USUÁRIO'}
                {userAction === 'suspend' && 'SUSPENDER USUÁRIO'}
                {userAction === 'promote' && 'PROMOVER A ADMIN'}
                {userAction === 'demote' && 'REBAIXAR DE ADMIN'}
                {userAction === 'delete' && 'DELETAR USUÁRIO'}
                {userAction === 'edit' && 'EDITAR USUÁRIO'}
              </h3>
              
              <p className="text-gray-400 font-montserrat mb-4">
                Usuário: <span className="text-white font-600">{selectedUser.nome}</span>
              </p>

              {userAction === 'edit' ? (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Nome</label>
                    <input
                      type="text"
                      value={editUserData.nome || ''}
                      onChange={(e) => setEditUserData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Email</label>
                    <input
                      type="email"
                      value={editUserData.email || ''}
                      onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-montserrat font-600 mb-2">Telefone</label>
                    <input
                      type="text"
                      value={editUserData.telefone || ''}
                      onChange={(e) => setEditUserData(prev => ({ ...prev, telefone: e.target.value }))}
                      className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {(userAction === 'ban' || userAction === 'suspend') && (
                    <div className="mb-4">
                      <label className="block text-white font-montserrat font-600 mb-2">
                        Motivo *
                      </label>
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Explique o motivo da ação..."
                        rows={3}
                        className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                      />
                    </div>
                  )}

                  {userAction === 'suspend' && (
                    <div className="mb-4">
                      <label className="block text-white font-montserrat font-600 mb-2">
                        Duração (dias)
                      </label>
                      <input
                        type="number"
                        value={suspensionDays}
                        onChange={(e) => setSuspensionDays(parseInt(e.target.value))}
                        min="1"
                        max="365"
                        className="w-full px-4 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmUserAction}
                  className={`flex-1 py-2 rounded-lg font-montserrat font-600 transition-colors ${
                    userAction === 'ban' || userAction === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : userAction === 'suspend'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-primary-red hover:bg-red-700 text-white'
                  }`}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    resetUserModal()
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Resposta de Mensagem */}
      {showResponseModal && respondingMessage && (
        <MessageResponse
          message={respondingMessage}
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false)
            setRespondingMessage(null)
          }}
          onSend={handleSendResponse}
          responseTemplates={responseTemplates}
        />
      )}
    </div>
  )
}

export default Admin
