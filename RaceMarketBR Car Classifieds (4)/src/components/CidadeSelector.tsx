
import React, { useState, useEffect, useRef } from 'react'
import {ChevronDown, Search, MapPin, Check} from 'lucide-react'

interface CidadeSelectorProps {
  cidades: string[]
  cidadeSelecionada: string
  onCidadeChange: (cidade: string) => void
  estadoSelecionado: string
  disabled?: boolean
}

const CidadeSelector: React.FC<CidadeSelectorProps> = ({
  cidades,
  cidadeSelecionada,
  onCidadeChange,
  estadoSelecionado,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [cidadesFiltradas, setCidadesFiltradas] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!busca.trim()) {
      setCidadesFiltradas(cidades)
    } else {
      const filtradas = cidades.filter(cidade =>
        cidade.toLowerCase().includes(busca.toLowerCase())
      ).sort()
      setCidadesFiltradas(filtradas)
    }
    setHighlightedIndex(-1)
  }, [busca, cidades])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setBusca('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setBusca(valor)
    
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleCidadeSelect = (cidade: string) => {
    onCidadeChange(cidade)
    setIsOpen(false)
    setBusca('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < cidadesFiltradas.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && cidadesFiltradas[highlightedIndex]) {
          handleCidadeSelect(cidadesFiltradas[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setBusca('')
        break
    }
  }

  const handleFocus = () => {
    if (!disabled && cidades.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-white font-montserrat font-600 mb-2">
        Cidade *
        {estadoSelecionado && (
          <span className="text-gray-400 text-sm ml-2">
            ({cidades.length} cidades disponíveis)
          </span>
        )}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? busca : cidadeSelecionada}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled 
              ? "Selecione um estado primeiro" 
              : estadoSelecionado 
                ? "Digite para buscar ou clique para ver todas" 
                : "Selecione um estado primeiro"
          }
          disabled={disabled}
          className={`w-full p-3 pr-10 bg-primary-black border rounded-lg text-white font-montserrat focus:outline-none transition-colors ${
            disabled 
              ? 'border-gray-700 text-gray-500 cursor-not-allowed' 
              : 'border-gray-800 focus:border-primary-red'
          }`}
          required
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isOpen && !disabled && (
            <Search className="w-4 h-4 text-gray-400" />
          )}
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-primary-black border border-gray-800 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {cidadesFiltradas.length > 0 ? (
            <>
              {busca && (
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-900 border-b border-gray-800">
                  {cidadesFiltradas.length} cidade(s) encontrada(s)
                </div>
              )}
              {cidadesFiltradas.map((cidade, index) => (
                <button
                  key={cidade}
                  type="button"
                  onClick={() => handleCidadeSelect(cidade)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors font-montserrat flex items-center justify-between ${
                    index === highlightedIndex ? 'bg-gray-800' : ''
                  } ${
                    cidade === cidadeSelecionada ? 'text-primary-red' : 'text-white'
                  }`}
                >
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {cidade}
                  </span>
                  {cidade === cidadeSelecionada && (
                    <Check className="w-4 h-4 text-primary-red" />
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-6 text-center text-gray-400 font-montserrat">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p>Nenhuma cidade encontrada</p>
              <p className="text-xs mt-1">Tente buscar com menos caracteres</p>
            </div>
          )}
        </div>
      )}

      {/* Estado não selecionado */}
      {!estadoSelecionado && (
        <div className="mt-2 text-yellow-400 text-sm font-montserrat flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          Selecione um estado para ver as cidades disponíveis
        </div>
      )}
    </div>
  )
}

export default CidadeSelector
