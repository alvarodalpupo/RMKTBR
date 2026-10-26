
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, BarChart3, Bell, Plus, Edit3, Trash2, Eye, MessageCircleDashed as MessageCircle, Clock, CheckCircle, X, Calendar, Mail, User, Shield, Camera, Save, Smartphone, Monitor, Tablet, LogOut, Key, Verified, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useUserSessions } from '../hooks/useUserSessions'
import { useListingsStore } from '../stores/listingsStore'
import { useNotificationsStore } from '../stores/notificationsStore'
import { Link } from 'react-router-dom'
import { estadosCidades } from '../data/estados-cidades'
import toast from 'react-hot-toast'
import { useSeo } from '../seo/useSeo';

const Painel = () => {
  useSeo({ caminho: '/painel', titulo: 'RaceMarketBR', naoIndexar: true });
  const { user, isAuthenticated, signOut } = useAuth()
  const { profile, updating, updateProfile, uploadAvatar, removeAvatar } = useUserProfile()
  const { sessions, loading: sessionsLoading, endSession, endAllOtherSessions } = useUserSessions()
  const { listings, deleteListing, updateListing } = useListingsStore()
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationsStore()
  
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    biografia: '',
    telefone: '',
    cidade: '',
    uf: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string>('')

  // Filtrar dados do usuário logado
  const userListings = listings.filter(listing => listing.user_id === user?.id)
  const userNotifications = notifications.filter(notification => notification.user_id === user?.id)
  const unreadNotifications = userNotifications.filter(n => !n.read)
  const unreadCount = unreadNotifications.length

  // Estatísticas do usuário
  const stats = {
    total_anuncios: userListings.length,
    anuncios_ativos: userListings.filter(l => l.status === 'publicado').length,
    anuncios_pendentes: userListings.filter(l => l.status === 'em_revisao').length,
    total_visualizacoes: userListings.reduce((sum, l) => sum + l.views, 0),
    total_whatsapp: userListings.reduce((sum, l) => sum + l.clicks_whatsapp, 0)
  }

  // Inicializar formulário quando o perfil carrega
  useEffect(() => {
    if (profile) {
      setProfileForm({
        biografia: profile.biografia || '',
        telefone: profile.telefone || '',
        cidade: profile.cidade || '',
        uf: profile.uf || ''
      })
    }
  }, [profile])

  // Manipular upload de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Salvar avatar
  const handleSaveAvatar = async () => {
    if (avatarFile) {
      const success = await uploadAvatar(avatarFile)
      if (success) {
        setAvatarFile(null)
        setPreviewAvatar('')
      }
    }
  }

  // Remover avatar
  const handleRemoveAvatar = async () => {
    if (window.confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      const success = await removeAvatar()
      if (success) {
        setPreviewAvatar('')
      }
    }
  }

  // Salvar perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateProfile(profileForm)
    if (success) {
      setEditingProfile(false)
    }
  }

  // Atualizar preferências de notificação
  const updateNotificationPreferences = async (key: string, value: boolean) => {
    if (!profile?.preferencias_notificacao) return
    
    const newPreferences = {
      ...profile.preferencias_notificacao,
      [key]: value
    }
    
    await updateProfile({
      preferencias_notificacao: newPreferences
    })
  }

  // Atualizar configurações de privacidade
  const updatePrivacySettings = async (key: string, value: boolean) => {
    if (!profile?.configuracoes_privacidade) return
    
    const newSettings = {
      ...profile.configuracoes_privacidade,
      [key]: value
    }
    
    await updateProfile({
      configuracoes_privacidade: newSettings
    })
  }

  // Alternar 2FA
  const toggleTwoFactor = async () => {
    const newValue = !profile?.two_factor_enabled
    await updateProfile({ two_factor_enabled: newValue })
    
    if (newValue) {
      toast.success('Autenticação de dois fatores ativada!')
    } else {
      toast.success('Autenticação de dois fatores desativada!')
    }
  }

  // Manipular exclusão de anúncio
  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      await deleteListing(id)
    }
  }

  // Dono avisa que vendeu: sai da vitrine e vai para "Vendidos"
  const handleMarcarVendido = async (id: string) => {
    if (await updateListing(id, { status: 'vendido' })) toast.success('Parabéns pela venda! O anúncio foi para Vendidos.')
  }

  // Funções utilitárias
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'text-green-400 bg-green-400/20'
      case 'em_revisao': return 'text-yellow-400 bg-yellow-400/20'
      case 'rejeitado': return 'text-red-400 bg-red-400/20'
      case 'arquivado': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'publicado': return 'Publicado'
      case 'em_revisao': return 'Em Revisão'
      case 'rejeitado': return 'Rejeitado'
      case 'arquivado': return 'Arquivado'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="font-bebas text-3xl text-white mb-4">ACESSO RESTRITO</h2>
          <p className="text-gray-400 font-montserrat mb-6">
            Você precisa estar logado para acessar o painel
          </p>
          <Link
            to="/login"
            className="bg-primary-red hover:bg-red-700 text-white font-montserrat font-600 px-6 py-3 rounded-lg transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profile?.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-red"
                />
                {profile?.email_verified && (
                  <Verified className="w-5 h-5 text-blue-400 absolute -bottom-1 -right-1 bg-primary-black rounded-full" />
                )}
              </div>
              <div>
                <h1 className="font-bebas text-4xl md:text-5xl text-white">
                  MEU PAINEL
                </h1>
                <p className="text-gray-400 font-montserrat">
                  Bem-vindo, <span className="text-red-text font-600">{user?.nome}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-montserrat">Sair</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-primary-gray p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'anuncios', label: 'Meus Anúncios', icon: Car },
              { id: 'perfil', label: 'Perfil', icon: User },
              { id: 'seguranca', label: 'Segurança', icon: Shield },
              { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: unreadCount }
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-montserrat font-600 transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-primary-red text-white'
                      : 'text-gray-400 hover:text-white hover:bg-primary-black/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="font-bebas text-3xl text-white">DASHBOARD</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Car className="w-8 h-8 text-red-text" />
                    <span className="text-2xl font-bebas text-white">{stats.total_anuncios}</span>
                  </div>
                  <h3 className="font-montserrat font-600 text-white">Total Anúncios</h3>
                  <p className="text-gray-400 text-sm">Todos os seus anúncios</p>
                </div>

                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bebas text-white">{stats.anuncios_ativos}</span>
                  </div>
                  <h3 className="font-montserrat font-600 text-white">Ativos</h3>
                  <p className="text-gray-400 text-sm">Anúncios publicados</p>
                </div>

                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-yellow-400" />
                    <span className="text-2xl font-bebas text-white">{stats.anuncios_pendentes}</span>
                  </div>
                  <h3 className="font-montserrat font-600 text-white">Pendentes</h3>
                  <p className="text-gray-400 text-sm">Aguardando aprovação</p>
                </div>

                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bebas text-white">{stats.total_visualizacoes}</span>
                  </div>
                  <h3 className="font-montserrat font-600 text-white">Visualizações</h3>
                  <p className="text-gray-400 text-sm">Total de views</p>
                </div>

                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <MessageCircle className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bebas text-white">{stats.total_whatsapp}</span>
                  </div>
                  <h3 className="font-montserrat font-600 text-white">Contatos</h3>
                  <p className="text-gray-400 text-sm">Cliques WhatsApp</p>
                </div>
              </div>

              {/* Atividade Recente */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-2xl text-white mb-6">ATIVIDADE RECENTE</h3>
                <div className="space-y-4">
                  {userListings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-primary-black rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.titulo}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-montserrat font-600 text-white">{listing.titulo}</h4>
                          <p className="text-gray-400 text-sm">{formatDate(listing.created_at)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-montserrat font-600 ${getStatusColor(listing.status)}`}>
                        {getStatusText(listing.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Perfil Tab */}
          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bebas text-3xl text-white">PERFIL DO USUÁRIO</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="bg-primary-red hover:bg-red-700 text-white font-montserrat font-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{editingProfile ? 'Cancelar' : 'Editar'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bebas text-xl text-white mb-4">FOTO DE PERFIL</h3>
                  
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img
                        src={previewAvatar || profile?.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-red"
                      />
                      {updating && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <span className="bg-blue-600 hover:bg-blue-700 text-white font-montserrat font-600 px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span>Alterar Foto</span>
                        </span>
                      </label>

                      {avatarFile && (
                        <button
                          onClick={handleSaveAvatar}
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700 text-white font-montserrat font-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                        >
                          <Save className="w-4 h-4" />
                          <span>Salvar Foto</span>
                        </button>
                      )}

                      {profile?.avatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={updating}
                          className="bg-red-600 hover:bg-red-700 text-white font-montserrat font-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div className="lg:col-span-2 bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bebas text-xl text-white mb-6">INFORMAÇÕES PESSOAIS</h3>

                  {editingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={user?.nome || ''}
                            disabled
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-gray-400 font-montserrat cursor-not-allowed"
                          />
                          <p className="text-gray-500 text-sm mt-1">Nome não pode ser alterado</p>
                        </div>

                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-gray-400 font-montserrat cursor-not-allowed"
                          />
                          <p className="text-gray-500 text-sm mt-1">Email não pode ser alterado</p>
                        </div>

                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={profileForm.telefone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, telefone: e.target.value }))}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red outline-none"
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Estado
                          </label>
                          <select
                            value={profileForm.uf}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, uf: e.target.value }))}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red outline-none"
                          >
                            <option value="">Selecione o estado</option>
                            {estadosCidades.map(estado => (
                              <option key={estado.codigo} value={estado.codigo}>
                                {estado.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={profileForm.cidade}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, cidade: e.target.value }))}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red outline-none"
                            placeholder="Sua cidade"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white font-montserrat font-600 mb-2">
                          Biografia
                        </label>
                        <textarea
                          value={profileForm.biografia}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, biografia: e.target.value }))}
                          rows={4}
                          maxLength={500}
                          className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat focus:border-primary-red outline-none resize-none"
                          placeholder="Conte um pouco sobre você e sua paixão por carros..."
                        />
                        <p className="text-gray-500 text-sm mt-1">
                          {profileForm.biografia.length}/500 caracteres
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={updating}
                          className="bg-green-600 hover:bg-green-700 text-white font-montserrat font-600 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{updating ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-montserrat font-600 px-6 py-2 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-montserrat font-600 text-white mb-2">Nome</h4>
                          <p className="text-gray-300">{user?.nome || 'Não informado'}</p>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-600 text-white mb-2">Email</h4>
                          <div className="flex items-center space-x-2">
                            <p className="text-gray-300">{user?.email || 'Não informado'}</p>
                            {profile?.email_verified ? (
                              <Verified className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-600 text-white mb-2">Telefone</h4>
                          <p className="text-gray-300">{profile?.telefone || 'Não informado'}</p>
                        </div>

                        <div>
                          <h4 className="font-montserrat font-600 text-white mb-2">Localização</h4>
                          <p className="text-gray-300">
                            {profile?.cidade && profile?.uf 
                              ? `${profile.cidade}, ${profile.uf}`
                              : 'Não informado'
                            }
                          </p>
                        </div>
                      </div>

                      {profile?.biografia && (
                        <div>
                          <h4 className="font-montserrat font-600 text-white mb-2">Biografia</h4>
                          <p className="text-gray-300 bg-primary-black p-4 rounded-lg">
                            {profile.biografia}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-montserrat font-600 text-white mb-2">Membro desde</h4>
                        <p className="text-gray-300">
                          {profile?.created_at ? formatDate(profile.created_at) : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferências */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notificações */}
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bebas text-xl text-white mb-6">PREFERÊNCIAS DE NOTIFICAÇÃO</h3>
                  
                  <div className="space-y-4">
                    {profile?.preferencias_notificacao && Object.entries(profile.preferencias_notificacao).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-white font-montserrat">
                          {key === 'email_anuncios' && 'Novos anúncios por email'}
                          {key === 'email_promocoes' && 'Promoções por email'}
                          {key === 'push_notifications' && 'Notificações push'}
                          {key === 'sms_notifications' && 'SMS notifications'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNotificationPreferences(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-red"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacidade */}
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bebas text-xl text-white mb-6">CONFIGURAÇÕES DE PRIVACIDADE</h3>
                  
                  <div className="space-y-4">
                    {profile?.configuracoes_privacidade && Object.entries(profile.configuracoes_privacidade).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-white font-montserrat">
                          {key === 'perfil_publico' && 'Perfil público'}
                          {key === 'mostrar_telefone' && 'Mostrar telefone'}
                          {key === 'mostrar_email' && 'Mostrar email'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updatePrivacySettings(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-red"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Segurança Tab */}
          {activeTab === 'seguranca' && (
            <motion.div
              key="seguranca"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="font-bebas text-3xl text-white">SEGURANÇA</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configurações de Segurança */}
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <h3 className="font-bebas text-xl text-white mb-6">CONFIGURAÇÕES</h3>
                  
                  <div className="space-y-6">
                    {/* Status do Email */}
                    <div className="flex items-center justify-between p-4 bg-primary-black rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="font-montserrat font-600 text-white">Verificação de Email</h4>
                          <p className="text-gray-400 text-sm">
                            {profile?.email_verified ? 'Email verificado' : 'Email não verificado'}
                          </p>
                        </div>
                      </div>
                      {profile?.email_verified ? (
                        <Verified className="w-6 h-6 text-green-400" />
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          Verificar
                        </button>
                      )}
                    </div>

                    {/* 2FA */}
                    <div className="flex items-center justify-between p-4 bg-primary-black rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="font-montserrat font-600 text-white">Autenticação de Dois Fatores</h4>
                          <p className="text-gray-400 text-sm">
                            {profile?.two_factor_enabled ? 'Ativada' : 'Desativada'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTwoFactor}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          profile?.two_factor_enabled
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {profile?.two_factor_enabled ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>

                    {/* Alterar Senha */}
                    <div className="p-4 bg-primary-black rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <Key className="w-5 h-5 text-yellow-400" />
                        <div>
                          <h4 className="font-montserrat font-600 text-white">Alterar Senha</h4>
                          <p className="text-gray-400 text-sm">Mantenha sua conta segura</p>
                        </div>
                      </div>
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors font-montserrat font-600">
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sessões Ativas */}
                <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bebas text-xl text-white">SESSÕES ATIVAS</h3>
                    <button
                      onClick={endAllOtherSessions}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Encerrar Outras
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {sessionsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                      </div>
                    ) : (
                      sessions.filter(s => s.is_active).map((session) => (
                        <div key={session._id} className="p-4 bg-primary-black rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getDeviceIcon(session.device_type)}
                              <div>
                                <h4 className="font-montserrat font-600 text-white text-sm">
                                  {session.device_type === 'mobile' ? 'Dispositivo Móvel' :
                                   session.device_type === 'tablet' ? 'Tablet' : 'Desktop'}
                                </h4>
                                <p className="text-gray-400 text-xs">
                                  {session.location} • {formatDate(session.created_at)}
                                </p>
                                {session.ip_address && (
                                  <p className="text-gray-500 text-xs">IP: {session.ip_address}</p>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => endSession(session._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Encerrar sessão"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {sessions.filter(s => s.is_active).length === 0 && !sessionsLoading && (
                    <p className="text-gray-400 text-center py-4">Nenhuma sessão ativa encontrada</p>
                  )}
                </div>
              </div>

              {/* Histórico de Login */}
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <h3 className="font-bebas text-xl text-white mb-6">HISTÓRICO DE LOGIN</h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3 bg-primary-black rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(session.device_type)}
                        <div>
                          <p className="text-white font-montserrat text-sm">
                            {session.location} • {formatDate(session.created_at)}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {session.is_active ? 'Ativa' : 'Encerrada'}
                            {session.ended_at && ` em ${formatDate(session.ended_at)}`}
                          </p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Anúncios Tab */}
          {activeTab === 'anuncios' && (
            <motion.div
              key="anuncios"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bebas text-3xl text-white">MEUS ANÚNCIOS</h2>
                <Link
                  to="/anuncie-seu-carro"
                  className="bg-primary-red hover:bg-red-700 text-white font-montserrat font-600 px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Anúncio</span>
                </Link>
              </div>

              {userListings.length > 0 ? (
                <div className="space-y-4">
                  {userListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-primary-gray border border-gray-800 rounded-xl p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                          <img
                            src={listing.images[0]}
                            alt={listing.titulo}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-montserrat font-bold text-white text-lg">
                                {listing.titulo}
                              </h3>
                              {listing.destaque && (
                                <span className="bg-primary-red text-white px-2 py-1 rounded text-xs font-montserrat font-600">
                                  DESTAQUE
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 mb-2">{listing.cidade} - {listing.uf}</p>
                            <span className="font-bebas text-xl text-red-text">
                              {listing.preco}
                            </span>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-montserrat font-600 ${getStatusColor(listing.status)}`}>
                                {getStatusText(listing.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end space-y-4">
                          <div className="flex items-center space-x-6 text-gray-400 text-sm">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{listing.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{listing.clicks_whatsapp}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(listing.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Link
                              to={`/anuncio/${listing.id}`}
                              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Ver</span>
                            </Link>
                            {listing.status === 'publicado' && (
                              <button
                                onClick={() => handleMarcarVendido(listing.id)}
                                className="px-4 py-2 rounded-lg font-montserrat font-600 transition-colors bg-success/15 text-success hover:bg-success/25"
                              >
                                Marquei como vendido
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-bebas text-2xl text-gray-400 mb-2">
                    Nenhum anúncio cadastrado
                  </h3>
                  <p className="text-gray-500 font-montserrat mb-6">
                    Comece anunciando seu primeiro carro
                  </p>
                  <Link
                    to="/anuncie-seu-carro"
                    className="bg-primary-red hover:bg-red-700 text-white font-montserrat font-600 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Criar Primeiro Anúncio</span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Notificações Tab */}
          {activeTab === 'notificacoes' && (
            <motion.div
              key="notificacoes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bebas text-3xl text-white">NOTIFICAÇÕES</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(user?.id || '')}
                    className="bg-primary-red hover:bg-red-700 text-white font-montserrat font-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {userNotifications.length > 0 ? (
                <div className="space-y-4">
                  {userNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-xl p-6 transition-all ${
                        notification.read
                          ? 'bg-primary-gray border-gray-800'
                          : 'bg-primary-gray/80 border-primary-red/30 shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-montserrat font-bold text-white">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-red rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-300 font-montserrat mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-montserrat font-600 ${
                              notification.type === 'aprovacao' ? 'bg-green-400/20 text-green-400' :
                              notification.type === 'rejeicao' ? 'bg-red-400/20 text-red-400' :
                              notification.type === 'status_change' ? 'bg-yellow-400/20 text-yellow-400' :
                              notification.type === 'destaque' ? 'bg-purple-400/20 text-purple-400' :
                              'bg-blue-400/20 text-blue-400'
                            }`}>
                              {notification.type}
                            </span>
                            <span>{formatDate(notification.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-primary-red transition-colors"
                              title="Marcar como lida"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Excluir notificação"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-bebas text-2xl text-gray-400 mb-2">
                    Nenhuma notificação
                  </h3>
                  <p className="text-gray-500 font-montserrat">
                    Você não tem notificações no momento
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Painel
