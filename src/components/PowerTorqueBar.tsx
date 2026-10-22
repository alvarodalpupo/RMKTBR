
import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface PowerTorqueBarProps {
  value?: number
  maxValue?: number // Agora opcional, será calculado dinamicamente
  unit: string
  icon: string
  color: string
  size?: 'small' | 'large'
  category?: 'turbo' | 'aspirado' | 'original' | 'pista'
}

const PowerTorqueBar: React.FC<PowerTorqueBarProps> = ({
  value,
  maxValue, // Ignorado - será calculado dinamicamente
  unit,
  icon,
  color,
  size = 'small',
  category
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  
  if (!value) {
    return (
      <div className={`flex items-center space-x-2 ${size === 'large' ? 'mb-4' : 'mb-2'}`}>
        <span className={`${size === 'large' ? 'text-lg' : 'text-sm'}`}>{icon}</span>
        <span className={`text-gray-500 font-montserrat ${size === 'large' ? 'text-base' : 'text-xs'}`}>
          — {unit}
        </span>
      </div>
    )
  }

  // Definir escalas base conforme especificação
  const getBaseScale = () => {
    if (unit === 'whp') return 500
    if (unit === 'kgfm') return 60
    return maxValue || 500 // Fallback para outras unidades
  }

  const baseScale = getBaseScale()
  
  // Calcular número total de barras necessárias
  const calculateTotalBars = () => {
    const baseBars = 10 // Barras base para a escala principal
    
    if (value <= baseScale) {
      return baseBars
    }
    
    // Calcular barras extras proporcionalmente
    const excessValue = value - baseScale
    const extraBarsNeeded = Math.ceil((excessValue / baseScale) * baseBars)
    
    return baseBars + extraBarsNeeded
  }

  const totalBars = calculateTotalBars()
  const isExtendedRange = value > baseScale
  
  // Calcular barras preenchidas
  const calculateFilledBars = () => {
    if (value <= baseScale) {
      // Escala normal: 10 barras para valor base
      return Math.round((value / baseScale) * 10)
    } else {
      // Escala estendida: preencher todas as barras proporcionalmente
      return Math.round((value / (baseScale * Math.ceil(value / baseScale))) * totalBars)
    }
  }

  const filledBars = calculateFilledBars()

  const getCategoryColor = () => {
    if (unit === 'kgfm') return '#3B7BFF' // Azul para torque
    
    switch (category) {
      case 'turbo':
        return '#FF3B3B'
      case 'aspirado':
        return '#FFB800'
      case 'original':
        return '#00B341'
      case 'pista':
        return '#FF8C00'
      default:
        return color
    }
  }

  const barColor = getCategoryColor()

  // Calcular a escala atual para exibição
  const getCurrentScale = () => {
    if (value <= baseScale) {
      return baseScale
    }
    return baseScale * Math.ceil(value / baseScale)
  }

  const currentScale = getCurrentScale()

  return (
    <div 
      className={`flex items-center space-x-2 ${size === 'large' ? 'mb-4' : 'mb-2'} relative`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`${size === 'large' ? 'text-lg' : 'text-sm'}`}>{icon}</span>
      
      {/* Barra Visual */}
      <div className={`flex items-center space-x-1 ${size === 'large' ? 'flex-1' : ''}`}>
        <div className="flex space-x-0.5 relative">
          {/* Indicador de escala estendida */}
          {isExtendedRange && (
            <div className="absolute -top-2 left-0 right-0 flex justify-center">
              <span className={`text-xs text-orange-400 font-bold ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
                EXTREME
              </span>
            </div>
          )}
          
          {/* Barras base (primeiras 10) */}
          {Array.from({ length: Math.min(10, totalBars) }).map((_, index) => {
            const isFilled = index < filledBars
            return (
              <motion.div
                key={`base-${index}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`${size === 'large' ? 'w-3 h-4' : 'w-2 h-3'} rounded-sm ${
                  isFilled ? '' : 'bg-gray-700'
                }`}
                style={{ 
                  backgroundColor: isFilled ? barColor : undefined
                }}
              />
            )
          })}
          
          {/* Separador visual se há barras extras */}
          {totalBars > 10 && (
            <div className={`${size === 'large' ? 'w-1 h-4' : 'w-0.5 h-3'} bg-gray-600 mx-1`} />
          )}
          
          {/* Barras extras */}
          {totalBars > 10 && Array.from({ length: totalBars - 10 }).map((_, index) => {
            const barIndex = 10 + index
            const isFilled = barIndex < filledBars
            return (
              <motion.div
                key={`extra-${index}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: (10 + index) * 0.05 }}
                className={`${size === 'large' ? 'w-3 h-4' : 'w-2 h-3'} rounded-sm ${
                  isFilled ? '' : 'bg-gray-700'
                }`}
                style={{ 
                  backgroundColor: isFilled ? '#FF8C00' : undefined // Cor diferente para barras extras
                }}
              />
            )
          })}
        </div>
        
        {/* Valor numérico */}
        <span 
          className={`font-montserrat font-600 ${size === 'large' ? 'text-base ml-3' : 'text-xs ml-2'}`}
          style={{ color: isExtendedRange ? '#FF8C00' : barColor }}
        >
          {value} {unit}
        </span>
        
        {/* Indicador de escala estendida */}
        {isExtendedRange && (
          <span className={`text-orange-400 ${size === 'large' ? 'text-sm' : 'text-xs'} font-bold`}>
            ⚡
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
        >
          <div className="bg-primary-black border border-gray-600 rounded-lg px-3 py-2 text-xs font-montserrat text-white whitespace-nowrap">
            {value} {unit} — escala {currentScale} {unit}
            {isExtendedRange && (
              <div className="text-orange-400 text-xs mt-1">
                ⚡ Escala estendida ativa
              </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PowerTorqueBar
