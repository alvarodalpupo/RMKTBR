
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Eye, Clock, User, Mail, Phone, MessageCircleDashed as MessageCircle, Copy, Sparkles } from 'lucide-react'
import { ContactMessage } from '../types/contactMessage'

interface MessageResponseProps {
  message: ContactMessage
  isOpen: boolean
  onClose: () => void
  onSend: (response: string, messageId: string) => void
  responseTemplates: Record<string, string>
}

const MessageResponse: React.FC<MessageResponseProps> = ({
  message,
  isOpen,
  onClose,
  onSend,
  responseTemplates
}) => {
  const [response, setResponse] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleTemplateSelect = useCallback((templateKey: string) => {
    const template = responseTemplates[templateKey]
    if (template && message?.name) {
      const personalizedTemplate = template.replace('{name}', message.name)
      setResponse(personalizedTemplate)
      setSelectedTemplate(templateKey)
    }
  }, [responseTemplates, message?.name])

  const handleSend = useCallback(async () => {
    if (!response.trim() || !message?.id) return
    
    setIsSending(true)
    try {
      await onSend(response, message.id)
      setResponse('')
      setSelectedTemplate('')
      onClose()
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
    } finally {
      setIsSending(false)
    }
  }, [response, message?.id, onSend, onClose])

  const copyToClipboard = useCallback((text: string) => {
    try {
      navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Erro ao copiar texto:', error)
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }, [])

  const getSubjectLabel = useCallback((subject: string) => {
    const subjects = {
      'duvida': 'Dúvida Geral',
      'anuncio': 'Problema com Anúncio',
      'venda': 'Ajuda para Vender',
      'compra': 'Ajuda para Comprar',
      'parceria': 'Parceria',
      'outro': 'Outro'
    }
    return subjects[subject as keyof typeof subjects] || subject
  }, [])

  // Prevent rendering if message is not available
  if (!message || !message.id) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-primary-gray border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6 text-primary-red" />
                <h3 className="font-bebas text-xl text-white">RESPONDER MENSAGEM</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Message Details Sidebar */}
              <div className="w-1/3 border-r border-gray-800 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-montserrat font-bold text-white mb-3">Informações do Contato</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 font-montserrat">{message.name || 'Nome não informado'}</span>
                        <button
                          onClick={() => copyToClipboard(message.name || '')}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 font-montserrat text-sm">{message.email || 'Email não informado'}</span>
                        <button
                          onClick={() => copyToClipboard(message.email || '')}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {message.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 font-montserrat text-sm">{message.phone}</span>
                          <button
                            onClick={() => copyToClipboard(message.phone ?? '')}
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 font-montserrat text-sm">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div>
                    <h4 className="font-montserrat font-bold text-white mb-3">Mensagem Original</h4>
                    <div className="bg-primary-black border border-gray-800 rounded-lg p-4">
                      <div className="mb-2">
                        <span className="text-primary-red font-montserrat font-600 text-sm">
                          {getSubjectLabel(message.subject)}
                        </span>
                      </div>
                      <p className="text-gray-300 font-montserrat text-sm leading-relaxed">
                        {message.message || 'Mensagem não disponível'}
                      </p>
                    </div>
                  </div>

                  {/* Response Templates */}
                  <div>
                    <h4 className="font-montserrat font-bold text-white mb-3">Templates de Resposta</h4>
                    <div className="space-y-2">
                      {Object.entries(responseTemplates).map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => handleTemplateSelect(key)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedTemplate === key
                              ? 'border-primary-red bg-primary-red/10 text-white'
                              : 'border-gray-800 bg-primary-black text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <div className="font-montserrat font-600 text-sm mb-1 capitalize">
                            {key.replace('-', ' ')}
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-2">
                            {template.replace('{name}', message.name || 'Cliente')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Editor */}
              <div className="flex-1 flex flex-col">
                {/* Editor Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-montserrat font-600">
                        Para: {message.email || 'Email não informado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors flex items-center space-x-1 ${
                          showPreview
                            ? 'bg-primary-red text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 p-4">
                  {showPreview ? (
                    <div className="h-full bg-white rounded-lg p-6 overflow-y-auto">
                      <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Re: {getSubjectLabel(message.subject)}
                          </h3>
                          <p className="text-gray-600">Para: {message.email}</p>
                        </div>
                        
                        <div className="prose prose-gray max-w-none">
                          <div className="whitespace-pre-wrap text-gray-800">
                            {response || 'Digite sua resposta para ver o preview...'}
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Atenciosamente,<br />
                            Equipe Race Market BR<br />
                            contato@racemarketbr.com.br
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      className="w-full h-full bg-primary-black border border-gray-800 rounded-lg p-4 text-white font-montserrat resize-none focus:border-primary-red focus:outline-none"
                    />
                  )}
                </div>

                {/* Editor Footer */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Use {'{name}'} para personalizar com o nome do cliente</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">
                        {response.length} caracteres
                      </span>
                      
                      <button
                        onClick={handleSend}
                        disabled={!response.trim() || isSending}
                        className="bg-primary-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-montserrat font-600 transition-colors flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSending ? 'Enviando...' : 'Enviar Resposta'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MessageResponse
