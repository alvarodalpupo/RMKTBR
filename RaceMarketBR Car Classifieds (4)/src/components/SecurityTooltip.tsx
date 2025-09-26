
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {Shield, Lock, Eye, CheckCircle} from 'lucide-react'

interface SecurityTooltipProps {
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const SecurityTooltip: React.FC<SecurityTooltipProps> = ({ 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  }

  const securityFeatures = [
    {
      icon: Lock,
      text: 'Criptografia SSL 256-bit',
      color: 'text-green-400'
    },
    {
      icon: Shield,
      text: 'Dados protegidos LGPD',
      color: 'text-blue-400'
    },
    {
      icon: Eye,
      text: 'Sem compartilhamento',
      color: 'text-purple-400'
    },
    {
      icon: CheckCircle,
      text: 'Verificação automática',
      color: 'text-emerald-400'
    }
  ]

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            {/* Tooltip Content */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl min-w-[280px]">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-montserrat font-600 text-sm">
                  Segurança Garantida
                </h3>
              </div>

              {/* Security Features */}
              <div className="space-y-2">
                {securityFeatures.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <IconComponent className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-gray-300 font-montserrat text-xs">
                        {feature.text}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-400 font-montserrat text-xs text-center">
                  Seus dados estão 100% seguros
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SecurityTooltip
