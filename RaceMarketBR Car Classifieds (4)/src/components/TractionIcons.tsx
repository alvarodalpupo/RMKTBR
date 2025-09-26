import React from 'react'

// Ícone de Tração Dianteira (FWD)
export const FWDIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg
    viewBox="0 0 120 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chassi principal */}
    <rect x="35" y="15" width="50" height="50" fill="none" stroke="#000000" strokeWidth="1.5" rx="4" />
    
    {/* Eixo dianteiro */}
    <line x1="20" y1="25" x2="100" y2="25" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo traseiro */}
    <line x1="20" y1="55" x2="100" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo central de transmissão */}
    <line x1="60" y1="25" x2="60" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Rodas dianteiras (motoras - vermelhas) */}
    <circle cx="20" cy="25" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="25" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    
    {/* Rodas traseiras (passivas - cinza escuro) */}
    <circle cx="20" cy="55" r="6" fill="#333333" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="55" r="6" fill="#333333" stroke="#000000" strokeWidth="1" />
  </svg>
)

// Ícone de Tração Traseira (RWD)
export const RWDIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg
    viewBox="0 0 120 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chassi principal */}
    <rect x="35" y="15" width="50" height="50" fill="none" stroke="#000000" strokeWidth="1.5" rx="4" />
    
    {/* Eixo dianteiro */}
    <line x1="20" y1="25" x2="100" y2="25" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo traseiro */}
    <line x1="20" y1="55" x2="100" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo central de transmissão */}
    <line x1="60" y1="25" x2="60" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Rodas dianteiras (passivas - cinza escuro) */}
    <circle cx="20" cy="25" r="6" fill="#333333" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="25" r="6" fill="#333333" stroke="#000000" strokeWidth="1" />
    
    {/* Rodas traseiras (motoras - vermelhas) */}
    <circle cx="20" cy="55" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="55" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
  </svg>
)

// Ícone de Tração Integral (AWD)
export const AWDIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg
    viewBox="0 0 120 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chassi principal */}
    <rect x="35" y="15" width="50" height="50" fill="none" stroke="#000000" strokeWidth="1.5" rx="4" />
    
    {/* Eixo dianteiro */}
    <line x1="20" y1="25" x2="100" y2="25" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo traseiro */}
    <line x1="20" y1="55" x2="100" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Eixo central de transmissão */}
    <line x1="60" y1="25" x2="60" y2="55" stroke="#000000" strokeWidth="1.5" />
    
    {/* Todas as rodas são motoras (vermelhas) */}
    <circle cx="20" cy="25" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="25" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    <circle cx="20" cy="55" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
    <circle cx="100" cy="55" r="6" fill="#FF0000" stroke="#000000" strokeWidth="1" />
  </svg>
)