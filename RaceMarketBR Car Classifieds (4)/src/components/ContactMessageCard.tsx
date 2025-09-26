
import React from 'react'
import { motion } from 'framer-motion'
import {Mail, Phone, Clock, CheckCircle, MessageCircleDashed as MessageCircle, Archive, AlertTriangle, Flag, Eye, Reply, MoreVertical, Tag, Calendar, User} from 'lucide-react'
import { ContactMessage } from '../types/contactMessage'

interface ContactMessageCardProps {
  message: ContactMessage
  onMarkAsRead: (messageId: string) => void
  onRespond: (messageId: string) => void
  onArchive: (messageId: string) => void
  onUpdatePriority: (messageId: string, priority: ContactMessage['priority']) => void
  onViewDetails: (messageId: string) => void
  isSelected?: boolean
  onSelect?: (messageId: string) => void
}

const ContactMessageCard: React.FC<ContactMessageCardProps> = ({
  message,
  onMarkAsRead,
  onRespond,
  onArchive,
  onUpdatePriority,
  onViewDetails,
  isSelected = false,
  onSelect
}) => {
  const getStatusColor = React.useCallback((status: ContactMessage['status']) => {
    switch (status) {
      case 'nova': return 'text-blue-400 bg-blue-400/20'
      case 'lida': return 'text-yellow-400 bg-yellow-400/20'
      case 'respondida': return 'text-green-400 bg-green-400/20'
      case 'arquivada': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }, [])

  const getPriorityColor = React.useCallback((priority: ContactMessage['priority']) => {
    switch (priority) {
      case 'alta': return 'text-red-400'
      case 'media': return 'text-yellow-400'
      case 'baixa': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }, [])

  const getSubjectLabel = React.useCallback((subject: string) => {
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

  const formatDate = React.useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Agora há pouco'
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h atrás`
      } else if (diffInHours < 48) {
        return 'Ontem'
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      }
    } catch (error) {
      return 'Data inválida'
    }
  }, [])

  const handleMarkAsRead = React.useCallback(() => {
    onMarkAsRead(message.id)
  }, [onMarkAsRead, message.id])

  const handleRespond = React.useCallback(() => {
    onRespond(message.id)
  }, [onRespond, message.id])

  const handleArchive = React.useCallback(() => {
    onArchive(message.id)
  }, [onArchive, message.id])

  const handleViewDetails = React.useCallback(() => {
    onViewDetails(message.id)
  }, [onViewDetails, message.id])

  const handleSelect = React.useCallback(() => {
    if (onSelect) {
      onSelect(message.id)
    }
  }, [onSelect, message.id])

  const handlePriorityChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdatePriority(message.id, e.target.value as ContactMessage['priority'])
  }, [onUpdatePriority, message.id])

  // Prevent rendering if message is null or undefined
  if (!message || !message.id) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-primary-gray border rounded-xl p-6 transition-all duration-300 hover:border-primary-red/50 ${
        isSelected ? 'border-primary-red bg-primary-red/5' : 'border-gray-800'
      } ${message.status === 'nova' ? 'shadow-lg shadow-blue-400/10' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="w-4 h-4 text-primary-red rounded"
            />
          )}
          
          <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center">
            <span className="text-white font-bebas text-sm">
              {(message.name || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-montserrat font-bold text-white">
                {message.name || 'Nome não informado'}
              </h3>
              <Flag className={`w-4 h-4 ${getPriorityColor(message.priority)}`} />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{message.email || 'Email não informado'}</span>
              </div>
              {message.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{message.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-montserrat font-600 ${getStatusColor(message.status)}`}>
            {message.status}
          </span>
          
          <div className="flex items-center space-x-1 text-gray-400 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(message.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-montserrat font-600 text-white">
            {getSubjectLabel(message.subject)}
          </span>
        </div>
        
        <p className="text-gray-300 font-montserrat text-sm leading-relaxed">
          {message.message && message.message.length > 150 
            ? `${message.message.substring(0, 150)}...`
            : message.message || 'Mensagem não disponível'
          }
        </p>
      </div>

      {message.tags && message.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {message.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-black text-gray-300 text-xs rounded font-montserrat"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {message.admin_notes && (
        <div className="bg-primary-black border border-gray-800 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-montserrat">Observações Internas</span>
          </div>
          <p className="text-gray-300 text-sm font-montserrat">{message.admin_notes}</p>
        </div>
      )}

      {message.response && (
        <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <Reply className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400 font-montserrat">
              Respondido em {message.responded_at ? formatDate(message.responded_at) : ''}
            </span>
          </div>
          <p className="text-gray-300 text-sm font-montserrat">{message.response}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          {message.status === 'nova' && (
            <button
              onClick={handleMarkAsRead}
              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>Marcar Lida</span>
            </button>
          )}
          
          {message.status !== 'respondida' && (
            <button
              onClick={handleRespond}
              className="bg-green-600/20 text-green-400 hover:bg-green-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors flex items-center space-x-1"
            >
              <Reply className="w-3 h-3" />
              <span>Responder</span>
            </button>
          )}
          
          {message.status !== 'arquivada' && (
            <button
              onClick={handleArchive}
              className="bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 px-3 py-1 rounded text-sm font-montserrat font-600 transition-colors flex items-center space-x-1"
            >
              <Archive className="w-3 h-3" />
              <span>Arquivar</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={message.priority}
            onChange={handlePriorityChange}
            className="bg-primary-black border border-gray-800 rounded px-2 py-1 text-xs text-white font-montserrat"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
          
          <button
            onClick={handleViewDetails}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ContactMessageCard
