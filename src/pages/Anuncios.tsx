import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import {Filter, X, Search, AlertCircle} from 'lucide-react'
import CarCard from '../components/CarCard'
import { useListingsStore } from '../stores/listingsStore'

const Anuncios = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { 
    filteredListings, 
    isLoading, 
    filters, 
    setFilters, 
    clearFilters,
    searchByModel,
    clearModelSearch,
    showNoResultsMessage,
    searchedModel,
    loadError,
    fetchListings
  } = useListingsStore()
  
  const [showFilters, setShowFilters] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  // Estados dos filtros
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedCity, setSelectedCity] = useState('todas')
  const [selectedPrice, setSelectedPrice] = useState('todos')
  const [selectedAceitaTroca, setSelectedAceitaTroca] = useState<boolean | null>(null)

  // Detectar busca por modelo na URL
  useEffect(() => {
    const modeloParam = searchParams.get('modelo')
    const categoriaParam = searchParams.get('categoria')
    
    if (modeloParam) {
      // Busca específica por modelo
      searchByModel(modeloParam)
      setLocalSearchTerm(modeloParam)
    } else if (categoriaParam) {
      // Filtro por categoria
      setFilters({ category: categoriaParam })
      setSelectedCategory(categoriaParam)
    }
  }, [searchParams, searchByModel, setFilters])

  // Sincronizar filtros com o estado local
  useEffect(() => {
    setSelectedCategory(filters?.category || 'todos')
    setSelectedCity(filters?.city || 'todas')
    setSelectedPrice(filters?.price || 'todos')
    setSelectedAceitaTroca(filters?.aceita_troca || null)
    setLocalSearchTerm(filters?.search || filters?.modelSearch || '')
  }, [filters])

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      searchByModel(localSearchTerm.trim())
      // Atualizar URL para refletir a busca
      setSearchParams({ modelo: localSearchTerm.trim() })
    } else {
      clearModelSearch()
      setSearchParams({})
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleFilterChange = () => {
    // Limpar busca por modelo ao usar filtros
    clearModelSearch()
    setSearchParams({})
    
    setFilters({
      category: selectedCategory,
      city: selectedCity,
      price: selectedPrice,
      aceita_troca: selectedAceitaTroca,
      search: localSearchTerm
    })
  }

  const handleClearFilters = () => {
    clearFilters()
    clearModelSearch()
    setSearchParams({})
    setSelectedCategory('todos')
    setSelectedCity('todas')
    setSelectedPrice('todos')
    setSelectedAceitaTroca(null)
    setLocalSearchTerm('')
  }

  const cidades = [
    'todas', 'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 
    'Curitiba', 'Porto Alegre', 'Brasília', 'Salvador', 
    'Fortaleza', 'Recife', 'Goiânia'
  ]

  const categorias = [
    { value: 'todos', label: 'Todas' },
    { value: 'turbo', label: 'Turbo' },
    { value: 'aspirado', label: 'Aspirado' },
    { value: 'original', label: 'Original' },
    { value: 'pista', label: 'Pista' }
  ]

  const faixasPreco = [
    { value: 'todos', label: 'Todos os preços' },
    { value: 'até R$ 100.000', label: 'Até R$ 100.000' },
    { value: 'R$ 100.000 - R$ 300.000', label: 'R$ 100.000 - R$ 300.000' },
    { value: 'R$ 300.000 - R$ 500.000', label: 'R$ 300.000 - R$ 500.000' },
    { value: 'acima de R$ 500.000', label: 'Acima de R$ 500.000' }
  ]

  const opcoesAceitaTroca = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Aceita troca' },
    { value: false, label: 'Não aceita troca' }
  ]

  return (
    <div className="min-h-screen bg-primary-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-bebas text-4xl md:text-6xl text-white mb-4">
            ANÚNCIOS DE VEÍCULOS
          </h1>
          <p className="text-gray-400 font-montserrat text-lg">
            Encontre o veículo dos seus sonhos
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary-gray border border-gray-800 rounded-xl p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Buscar por modelo ou marca do veículo..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-14 pr-32 py-4 bg-primary-black border border-gray-700 rounded-xl text-white font-montserrat text-lg focus:border-primary-red focus:outline-none transition-colors"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-red hover:bg-turbo-dark text-white px-6 py-2 rounded-lg transition-colors font-montserrat font-600"
              >
                Buscar
              </button>
            </div>
            {filters?.modelSearch && (
              <div className="text-center mt-2">
                <span className="text-gray-400 font-montserrat text-sm">
                  Buscando por: <span className="text-red-text font-600">"{filters.modelSearch}"</span>
                </span>
                <button
                  onClick={() => {
                    clearModelSearch()
                    setLocalSearchTerm('')
                    setSearchParams({})
                  }}
                  className="ml-2 text-red-text hover:text-white transition-colors"
                >
                  <X className="w-4 h-4 inline" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-primary-black border border-gray-700 text-white px-6 py-3 rounded-lg hover:border-primary-red transition-colors font-montserrat"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros Avançados</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Categoria */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-primary-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-primary-red focus:outline-none font-montserrat"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Cidade
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-primary-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-primary-red focus:outline-none font-montserrat"
                  >
                    {cidades.map(cidade => (
                      <option key={cidade} value={cidade}>
                        {cidade === 'todas' ? 'Todas as cidades' : cidade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Faixa de Preço
                  </label>
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="w-full bg-primary-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-primary-red focus:outline-none font-montserrat"
                  >
                    {faixasPreco.map(faixa => (
                      <option key={faixa.value} value={faixa.value}>
                        {faixa.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aceita Troca */}
                <div>
                  <label className="block text-white font-montserrat font-600 mb-2">
                    Aceita Troca
                  </label>
                  <select
                    value={selectedAceitaTroca === null ? 'todos' : selectedAceitaTroca.toString()}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedAceitaTroca(
                        value === 'todos' ? null : value === 'true'
                      )
                    }}
                    className="w-full bg-primary-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-primary-red focus:outline-none font-montserrat"
                  >
                    {opcoesAceitaTroca.map(opcao => (
                      <option key={opcao.value?.toString() || 'todos'} value={opcao.value?.toString() || 'todos'}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleFilterChange}
                  className="bg-primary-red hover:bg-turbo-dark text-white px-8 py-3 rounded-lg transition-colors font-montserrat font-600"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={handleClearFilters}
                  className="border border-gray-700 text-gray-300 hover:text-white hover:border-primary-red px-8 py-3 rounded-lg transition-colors font-montserrat"
                >
                  Limpar Filtros
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* No Results Message */}
          {showNoResultsMessage && (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary-gray border border-gray-800 rounded-xl p-8 max-w-2xl mx-auto"
              >
                <AlertCircle className="w-16 h-16 text-red-text mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-white mb-4">
                  MODELO NÃO ENCONTRADO
                </h3>
                <p className="text-gray-300 font-montserrat text-lg mb-6">
                  Infelizmente não temos este modelo de veículo disponível.
                </p>
                {searchedModel && (
                  <p className="text-gray-400 font-montserrat mb-6">
                    Busca realizada por: <span className="text-red-text font-600">"{searchedModel}"</span>
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      clearModelSearch()
                      setLocalSearchTerm('')
                      setSearchParams({})
                    }}
                    className="bg-primary-red hover:bg-turbo-dark text-white px-6 py-3 rounded-lg transition-colors font-montserrat font-600"
                  >
                    Ver Todos os Veículos
                  </button>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="border border-gray-700 text-gray-300 hover:text-white hover:border-primary-red px-6 py-3 rounded-lg transition-colors font-montserrat"
                  >
                    Usar Filtros
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {loadError && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning/40 bg-warning/10 p-4 text-ink">
              <span>{loadError}</span>
              <button onClick={() => fetchListings()} className="rm-btn rm-btn--outline rm-btn--sm">TENTAR DE NOVO</button>
            </div>
          )}

          {/* Results Count */}
          {!showNoResultsMessage && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400 font-montserrat">
                {isLoading ? 'Carregando...' : `${filteredListings.length} veículo(s) encontrado(s)`}
              </p>
            </div>
          )}

          {/* Listings Grid */}
          {!showNoResultsMessage && (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CarCard car={listing} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Anuncios
