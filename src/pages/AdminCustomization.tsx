
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Type, Layout, Share2, Search, Settings, Save, RotateCcw, Download, Upload, Eye, Monitor, Smartphone, Tablet, Image, Globe, Instagram, Facebook, MessageCircleDashed as MessageCircle, Mail, Phone, MapPin, Star, TrendingUp, Zap, Shield, Award } from 'lucide-react'
import { useCustomizationStore } from '../stores/customizationStore'
import ColorPicker from '../components/ColorPicker'
import ImageUploader from '../components/ImageUploader'
import toast from 'react-hot-toast'

const AdminCustomization = () => {
  const {
    loading,
    saving,
    getConfigValue,
    fetchConfigs,
    updateConfig,
    exportConfigs,
    importConfigs
  } = useCustomizationStore()

  const [activeTab, setActiveTab] = useState('visual')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [changes, setChanges] = useState<Record<string, string>>({})
  const [showExportModal, setShowExportModal] = useState(false)
  const [importData, setImportData] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const handleConfigChange = (key: string, value: string) => {
    setChanges(prev => ({ ...prev, [key]: value }))
  }

  const saveChanges = async () => {
    const promises = Object.entries(changes).map(([key, value]) =>
      updateConfig(key, value)
    )
    
    const results = await Promise.all(promises)
    const allSuccessful = results.every(result => result)
    
    if (allSuccessful) {
      setChanges({})
      toast.success('Alterações salvas com sucesso!')
    } else {
      toast.error('Algumas alterações falharam')
    }
  }

  const resetChanges = () => {
    setChanges({})
    toast('Alterações descartadas', { icon: 'ℹ️' })
  }

  const exportConfig = () => {
    const data = exportConfigs()
    navigator.clipboard.writeText(data)
    setShowExportModal(true)
    toast.success('Configurações copiadas para área de transferência!')
  }

  const importConfig = async () => {
    if (!importData.trim()) {
      toast.error('Cole os dados de configuração')
      return
    }
    
    const success = await importConfigs(importData)
    if (success) {
      setImportData('')
      setChanges({})
    }
  }

  const getCurrentValue = (key: string) => {
    return changes[key] ?? getConfigValue(key) ?? ''
  }

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Palette, color: 'text-purple-400' },
    { id: 'content', label: 'Conteúdo', icon: Type, color: 'text-blue-400' },
    { id: 'layout', label: 'Layout', icon: Layout, color: 'text-green-400' },
    { id: 'social', label: 'Redes Sociais', icon: Share2, color: 'text-pink-400' },
    { id: 'seo', label: 'SEO', icon: Search, color: 'text-yellow-400' },
    { id: 'advanced', label: 'Avançado', icon: Settings, color: 'text-red-400' }
  ]

  const previewSizes = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' }
  ]

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-white font-montserrat">Carregando configurações...</p>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="font-bebas text-4xl md:text-5xl text-white mb-2">
                CUSTOMIZAÇÃO DO SITE
              </h1>
              <p className="text-gray-400 font-montserrat">
                Personalize todos os aspectos visuais e funcionais da plataforma
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Preview Mode */}
              <div className="flex items-center space-x-2 bg-primary-gray p-1 rounded-lg">
                {previewSizes.map((size) => {
                  const IconComponent = size.icon
                  return (
                    <button
                      key={size.id}
                      onClick={() => setPreviewMode(size.id as typeof previewMode)}
                      className={`p-2 rounded transition-colors ${
                        previewMode === size.id
                          ? 'bg-primary-red text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title={size.label}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {Object.keys(changes).length > 0 && (
                  <>
                    <button
                      onClick={resetChanges}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Descartar</span>
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={saving}
                      className="bg-primary-red hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={exportConfig}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-primary-gray p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md font-montserrat font-600 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-red text-white'
                      : 'text-gray-400 hover:text-white hover:bg-primary-black/50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Visual Tab */}
                {activeTab === 'visual' && (
                  <>
                    {/* Cores */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Palette className="w-5 h-5" />
                        <span>CORES DO SITE</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ColorPicker
                          value={getCurrentValue('primary_color')}
                          onChange={(value) => handleConfigChange('primary_color', value)}
                          label="Cor Primária"
                        />
                        <ColorPicker
                          value={getCurrentValue('secondary_color')}
                          onChange={(value) => handleConfigChange('secondary_color', value)}
                          label="Cor Secundária"
                        />
                        <ColorPicker
                          value={getCurrentValue('accent_color')}
                          onChange={(value) => handleConfigChange('accent_color', value)}
                          label="Cor de Destaque"
                        />
                        <ColorPicker
                          value={getCurrentValue('background_color')}
                          onChange={(value) => handleConfigChange('background_color', value)}
                          label="Cor de Fundo"
                        />
                      </div>
                    </div>

                    {/* Imagens */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Image className="w-5 h-5" />
                        <span>IMAGENS</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <ImageUploader
                          value={getCurrentValue('hero_background_image')}
                          onChange={(value) => handleConfigChange('hero_background_image', value)}
                          label="Imagem de Fundo do Hero"
                        />
                        <ImageUploader
                          value={getCurrentValue('logo_image')}
                          onChange={(value) => handleConfigChange('logo_image', value)}
                          label="Logo do Site"
                        />
                        <ImageUploader
                          value={getCurrentValue('favicon')}
                          onChange={(value) => handleConfigChange('favicon', value)}
                          label="Favicon"
                        />
                      </div>
                    </div>

                    {/* Tipografia */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Type className="w-5 h-5" />
                        <span>TIPOGRAFIA</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Fonte Principal
                          </label>
                          <select 
                            value={getCurrentValue('primary_font')}
                            onChange={(e) => handleConfigChange('primary_font', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                          >
                            <option value="Bebas Neue">Bebas Neue</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Fonte Secundária
                          </label>
                          <select 
                            value={getCurrentValue('secondary_font')}
                            onChange={(e) => handleConfigChange('secondary_font', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                          >
                            <option value="Montserrat">Montserrat</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <>
                    {/* Hero Section */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Star className="w-5 h-5" />
                        <span>SEÇÃO HERO</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Título Principal
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('hero_title')}
                            onChange={(e) => handleConfigChange('hero_title', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="RACE MARKET BR"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Subtítulo
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('hero_subtitle')}
                            onChange={(e) => handleConfigChange('hero_subtitle', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="O maior marketplace de carros esportivos do Brasil"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Texto do Botão Principal
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('hero_button_text')}
                            onChange={(e) => handleConfigChange('hero_button_text', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="VER ANÚNCIOS"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sobre Section */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Award className="w-5 h-5" />
                        <span>SEÇÃO SOBRE</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Título da Seção
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('about_title')}
                            onChange={(e) => handleConfigChange('about_title', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="SOBRE O RACE MARKET"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Descrição
                          </label>
                          <textarea
                            value={getCurrentValue('about_description')}
                            onChange={(e) => handleConfigChange('about_description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Descrição sobre a plataforma..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Content */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Globe className="w-5 h-5" />
                        <span>RODAPÉ</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Texto de Copyright
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('footer_copyright')}
                            onChange={(e) => handleConfigChange('footer_copyright', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="© 2025 Race Market BR. Todos os direitos reservados."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Descrição da Empresa
                          </label>
                          <textarea
                            value={getCurrentValue('footer_description')}
                            onChange={(e) => handleConfigChange('footer_description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Descrição da empresa no rodapé..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Layout Tab */}
                {activeTab === 'layout' && (
                  <>
                    {/* Header Layout */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Layout className="w-5 h-5" />
                        <span>LAYOUT DO HEADER</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Header Fixo</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('header_fixed') === 'true'}
                            onChange={(e) => handleConfigChange('header_fixed', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Mostrar Logo</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('header_show_logo') === 'true'}
                            onChange={(e) => handleConfigChange('header_show_logo', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Menu Transparente</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('header_transparent') === 'true'}
                            onChange={(e) => handleConfigChange('header_transparent', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Home Page Sections */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>SEÇÕES DA HOME</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Seção Hero</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('show_hero_section') === 'true'}
                            onChange={(e) => handleConfigChange('show_hero_section', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Anúncios em Destaque</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('show_featured_ads') === 'true'}
                            onChange={(e) => handleConfigChange('show_featured_ads', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Categorias</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('show_categories') === 'true'}
                            onChange={(e) => handleConfigChange('show_categories', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Feed Instagram</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('show_instagram_feed') === 'true'}
                            onChange={(e) => handleConfigChange('show_instagram_feed', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Seção Sobre</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('show_about_section') === 'true'}
                            onChange={(e) => handleConfigChange('show_about_section', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grid Settings */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Layout className="w-5 h-5" />
                        <span>CONFIGURAÇÕES DE GRID</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Colunas Desktop
                          </label>
                          <select 
                            value={getCurrentValue('grid_columns_desktop')}
                            onChange={(e) => handleConfigChange('grid_columns_desktop', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                          >
                            <option value="2">2 Colunas</option>
                            <option value="3">3 Colunas</option>
                            <option value="4">4 Colunas</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Colunas Tablet
                          </label>
                          <select 
                            value={getCurrentValue('grid_columns_tablet')}
                            onChange={(e) => handleConfigChange('grid_columns_tablet', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                          >
                            <option value="1">1 Coluna</option>
                            <option value="2">2 Colunas</option>
                            <option value="3">3 Colunas</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Colunas Mobile
                          </label>
                          <select 
                            value={getCurrentValue('grid_columns_mobile')}
                            onChange={(e) => handleConfigChange('grid_columns_mobile', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                          >
                            <option value="1">1 Coluna</option>
                            <option value="2">2 Colunas</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Social Tab */}
                {activeTab === 'social' && (
                  <>
                    {/* Instagram Integration */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Instagram className="w-5 h-5" />
                        <span>INTEGRAÇÃO INSTAGRAM</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Ativar Feed Instagram</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('instagram_feed') === 'true'}
                            onChange={(e) => handleConfigChange('instagram_feed', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Hashtag para Busca
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('instagram_hashtag')}
                            onChange={(e) => handleConfigChange('instagram_hashtag', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="#racemarket"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Perfil do Instagram
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('instagram_profile')}
                            onChange={(e) => handleConfigChange('instagram_profile', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="@racemarketbr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Share2 className="w-5 h-5" />
                        <span>LINKS SOCIAIS</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <Facebook className="w-4 h-4" />
                            <span>Facebook</span>
                          </label>
                          <input
                            type="url"
                            value={getCurrentValue('facebook_url')}
                            onChange={(e) => handleConfigChange('facebook_url', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="https://facebook.com/racemarketbr"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <Instagram className="w-4 h-4" />
                            <span>Instagram</span>
                          </label>
                          <input
                            type="url"
                            value={getCurrentValue('instagram_url')}
                            onChange={(e) => handleConfigChange('instagram_url', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="https://instagram.com/racemarketbr"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </label>
                          <input
                            type="tel"
                            value={getCurrentValue('whatsapp_number')}
                            onChange={(e) => handleConfigChange('whatsapp_number', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="5511999999999"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Phone className="w-5 h-5" />
                        <span>INFORMAÇÕES DE CONTATO</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </label>
                          <input
                            type="email"
                            value={getCurrentValue('contact_email')}
                            onChange={(e) => handleConfigChange('contact_email', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="contato@racemarket.com.br"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Telefone</span>
                          </label>
                          <input
                            type="tel"
                            value={getCurrentValue('contact_phone')}
                            onChange={(e) => handleConfigChange('contact_phone', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Endereço</span>
                          </label>
                          <textarea
                            value={getCurrentValue('contact_address')}
                            onChange={(e) => handleConfigChange('contact_address', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Endereço completo da empresa..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <>
                    {/* Meta Tags */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>META TAGS</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Título do Site
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('meta_title')}
                            onChange={(e) => handleConfigChange('meta_title', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="Race Market BR - Marketplace de Carros Esportivos"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Meta Description
                          </label>
                          <textarea
                            value={getCurrentValue('meta_description')}
                            onChange={(e) => handleConfigChange('meta_description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Descrição do site para mecanismos de busca..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Palavras-chave
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('meta_keywords')}
                            onChange={(e) => handleConfigChange('meta_keywords', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="carros esportivos, turbo, aspirado, marketplace"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>ANALYTICS</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Google Analytics ID
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('google_analytics_id')}
                            onChange={(e) => handleConfigChange('google_analytics_id', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="G-XXXXXXXXXX"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Google Tag Manager ID
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('gtm_id')}
                            onChange={(e) => handleConfigChange('gtm_id', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="GTM-XXXXXXX"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Facebook Pixel ID
                          </label>
                          <input
                            type="text"
                            value={getCurrentValue('facebook_pixel_id')}
                            onChange={(e) => handleConfigChange('facebook_pixel_id', e.target.value)}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat"
                            placeholder="000000000000000"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <>
                    {/* Performance */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>PERFORMANCE</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Lazy Loading</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_lazy_loading') === 'true'}
                            onChange={(e) => handleConfigChange('enable_lazy_loading', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Compressão de Imagens</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_image_compression') === 'true'}
                            onChange={(e) => handleConfigChange('enable_image_compression', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Cache de Dados</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_data_cache') === 'true'}
                            onChange={(e) => handleConfigChange('enable_data_cache', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Animations */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>ANIMAÇÕES</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Animações de Entrada</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_entrance_animations') === 'true'}
                            onChange={(e) => handleConfigChange('enable_entrance_animations', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Efeitos de Hover</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_hover_effects') === 'true'}
                            onChange={(e) => handleConfigChange('enable_hover_effects', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Parallax Scrolling</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('enable_parallax') === 'true'}
                            onChange={(e) => handleConfigChange('enable_parallax', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Maintenance */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>MANUTENÇÃO</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-white font-montserrat">Modo Manutenção</label>
                          <input
                            type="checkbox"
                            checked={getCurrentValue('maintenance_mode') === 'true'}
                            onChange={(e) => handleConfigChange('maintenance_mode', e.target.checked.toString())}
                            className="w-5 h-5 text-red-text"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Mensagem de Manutenção
                          </label>
                          <textarea
                            value={getCurrentValue('maintenance_message')}
                            onChange={(e) => handleConfigChange('maintenance_message', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Site em manutenção. Voltaremos em breve!"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Import/Export */}
                    <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                      <h3 className="font-bebas text-xl text-white mb-6 flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>IMPORTAR/EXPORTAR</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-montserrat font-600 mb-2">
                            Importar Configurações (JSON)
                          </label>
                          <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-primary-black border border-gray-800 rounded-lg text-white font-montserrat resize-none"
                            placeholder="Cole aqui o JSON das configurações..."
                          />
                        </div>
                        
                        <button
                          onClick={importConfig}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Importar Configurações</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-primary-gray border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bebas text-lg text-white">PREVIEW</h3>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{previewMode}</span>
                  </div>
                </div>
                
                <div className="bg-primary-black rounded-lg p-4 min-h-96">
                  <div 
                    className="mx-auto transition-all duration-300"
                    style={{ 
                      width: previewSizes.find(s => s.id === previewMode)?.width,
                      maxWidth: '100%'
                    }}
                  >
                    {/* Preview Content */}
                    <div className="space-y-4">
                      {/* Header Preview */}
                      <div 
                        className="h-16 rounded flex items-center justify-between px-4"
                        style={{ backgroundColor: getCurrentValue('secondary_color') || '#1A1A1A' }}
                      >
                        <div className="text-white font-bold">LOGO</div>
                        <div className="flex space-x-4 text-white text-sm">
                          <span>HOME</span>
                          <span>ANÚNCIOS</span>
                          <span>CONTATO</span>
                        </div>
                      </div>
                      
                      {/* Hero Preview */}
                      <div 
                        className="h-32 rounded flex items-center justify-center text-center"
                        style={{ 
                          backgroundColor: getCurrentValue('primary_color') || '#E53E3E',
                          backgroundImage: getCurrentValue('hero_background_image') 
                            ? `url(${getCurrentValue('hero_background_image')})` 
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="text-white">
                          <h2 className="font-bold text-lg">
                            {getCurrentValue('hero_title') || 'RACE MARKET BR'}
                          </h2>
                          <p className="text-sm opacity-90">
                            {getCurrentValue('hero_subtitle') || 'O maior marketplace de carros esportivos'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Content Preview */}
                      <div className="space-y-2">
                        <div className="h-20 bg-gray-800 rounded"></div>
                        <div className="h-20 bg-gray-800 rounded"></div>
                        <div className="h-20 bg-gray-800 rounded"></div>
                      </div>
                      
                      {/* Footer Preview */}
                      <div 
                        className="h-16 rounded flex items-center justify-center"
                        style={{ backgroundColor: getCurrentValue('secondary_color') || '#1A1A1A' }}
                      >
                        <p className="text-white text-xs text-center">
                          {getCurrentValue('footer_copyright') || '© 2025 Race Market BR'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-xs">
                    Preview em tempo real das suas alterações
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bebas text-xl text-white mb-4">
                CONFIGURAÇÕES EXPORTADAS
              </h3>
              
              <p className="text-gray-400 text-sm mb-4">
                As configurações foram copiadas para a área de transferência. 
                Você pode salvar este JSON como backup.
              </p>
              
              <div className="bg-primary-black p-4 rounded-lg mb-4">
                <pre className="text-gray-300 text-xs overflow-x-auto">
                  {exportConfigs()}
                </pre>
              </div>
              
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full bg-primary-red hover:bg-red-700 text-white py-2 rounded-lg font-montserrat font-600 transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminCustomization
