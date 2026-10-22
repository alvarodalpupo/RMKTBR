
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, Zap, Wind, Trophy, Settings, CheckCircle, Calendar } from 'lucide-react';
import CarCard from '../components/CarCard';
import InstagramFeed from '../components/InstagramFeed';
import { useListingsStore } from '../stores/listingsStore';

const Home = () => {
  const { listings, isLoading, getSoldListings } = useListingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filtrar anúncios em destaque
  const featuredListings = listings.filter((listing) => listing.destaque && listing.status === 'publicado').slice(0, 6);

  // Obter veículos vendidos recentemente (últimos 4)
  const recentSoldListings = getSoldListings().slice(0, 4);

  // Filtrar por termo de busca
  const filteredListings = featuredListings.filter((listing) =>
  listing.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  listing.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
  listing.uf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para lidar com a busca por modelo
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirecionar para a página de anúncios com a busca por modelo
      navigate(`/anuncios?modelo=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Função para lidar com Enter na busca
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const categorias = [
  {
    id: 'turbo',
    title: 'TURBO',
    description: 'Veículos turbinados de alta performance',
    icon: <Zap className="w-12 h-12" />,
    gradient: 'from-turbo-primary via-turbo-secondary to-turbo-accent',
    borderColor: 'border-turbo-primary',
    hoverColor: 'hover:border-turbo-secondary',
    textColor: 'text-turbo-primary',
    bgColor: 'bg-turbo-primary/10'
  },
  {
    id: 'aspirado',
    title: 'ASPIRADO',
    description: 'Veículos com preparação Aspirada',
    icon: <Wind className="w-12 h-12" />,
    gradient: 'from-aspirado-primary via-aspirado-secondary to-aspirado-accent',
    borderColor: 'border-aspirado-primary',
    hoverColor: 'hover:border-aspirado-secondary',
    textColor: 'text-aspirado-primary',
    bgColor: 'bg-aspirado-primary/10'
  },
  {
    id: 'original',
    title: 'ORIGINAL',
    description: 'Veículos em configuração de fábrica',
    icon: <Settings className="w-12 h-12" />,
    gradient: 'from-original-primary via-original-secondary to-original-accent',
    borderColor: 'border-original-primary',
    hoverColor: 'hover:border-original-secondary',
    textColor: 'text-original-primary',
    bgColor: 'bg-original-primary/10'
  },
  {
    id: 'pista',
    title: 'PISTA',
    description: 'Preparações extremas para competição',
    icon: <Trophy className="w-12 h-12" />,
    gradient: 'from-pista-primary via-pista-secondary to-pista-accent',
    borderColor: 'border-pista-primary',
    hoverColor: 'hover:border-pista-secondary',
    textColor: 'text-pista-primary',
    bgColor: 'bg-pista-primary/10'
  }];


  return (
    <div className="min-h-screen bg-primary-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-black via-primary-gray to-primary-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto">

            <h1 className="font-bebas text-6xl md:text-8xl text-white mb-6 leading-tight">
              RACE<span className="text-primary-red">MARKET</span>BR
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-montserrat mb-8 leading-relaxed">
              O maior marketplace de veículos esportivos do Brasil
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Buscar por modelo ou marca do veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-14 pr-6 py-4 bg-primary-gray border border-gray-800 rounded-xl text-white font-montserrat text-lg focus:border-primary-red focus:outline-none transition-colors" />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-red hover:bg-turbo-dark text-white px-6 py-2 rounded-lg transition-colors font-montserrat font-600">

                  Buscar
                </button>
              </form>
              <p className="text-gray-400 text-sm mt-2 font-montserrat">
                Ex: Civic, Golf, WRX, M3, 911...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/anuncios"
                className="bg-primary-red hover:bg-turbo-dark text-white font-bebas text-xl px-8 py-4 rounded-lg transition-colors flex items-center space-x-3 group">

                <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>VER ANÚNCIOS</span>
              </Link>
              <Link
                to="/anuncie-seu-carro"
                className="border-2 border-primary-red text-primary-red hover:bg-primary-red hover:text-white font-bebas text-xl px-8 py-4 rounded-lg transition-colors flex items-center space-x-3 group">

                <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>ANUNCIAR GRÁTIS</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary-red/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-primary-black to-primary-gray">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">

            <h2 className="font-bebas text-4xl md:text-5xl text-white mb-4">
              CATEGORIAS
            </h2>
            <p className="text-gray-400 font-montserrat text-lg max-w-2xl mx-auto">
              Encontre o veículo perfeito para seu estilo de pilotagem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categorias.map((categoria, index) =>
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group">

                <Link
                to={`/anuncios?categoria=${categoria.id}`}
                className="block w-full">

                  <div className={`relative h-64 rounded-xl border-2 ${categoria.borderColor} ${categoria.hoverColor} ${categoria.bgColor} p-8 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoria.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                      <div className={`${categoria.textColor} mb-4 group-hover:scale-110 transition-transform`}>
                        {categoria.icon}
                      </div>
                      <h3 className="font-bebas text-2xl text-white mb-2">
                        {categoria.title}
                      </h3>
                      <p className="text-gray-400 font-montserrat mb-6">
                        {categoria.description}
                      </p>
                      <div className={`w-12 h-1 ${categoria.textColor.replace('text-', 'bg-')} rounded-full group-hover:w-16 transition-all`}></div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 &&
      <section className="py-16 bg-primary-gray">
          <div className="container mx-auto px-4">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">

              <h2 className="font-bebas text-4xl md:text-5xl text-white mb-4">
                ANÚNCIOS EM DESTAQUE
              </h2>
              <p className="text-gray-400 font-montserrat text-lg">
                Os melhores veículos selecionados especialmente para você
              </p>
            </motion.div>

            {isLoading ?
          <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
              </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) =>
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}>

                    <CarCard car={listing} />
                  </motion.div>
            )}
              </div>
          }

            <div className="text-center mt-12">
              <Link
              to="/anuncios"
              className="bg-primary-red hover:bg-turbo-dark text-white font-bebas text-xl px-8 py-4 rounded-lg transition-colors inline-flex items-center space-x-3">

                <Filter className="w-6 h-6" />
                <span>VER TODOS OS ANÚNCIOS</span>
              </Link>
            </div>
          </div>
        </section>
      }

      {/* Instagram Feed Section */}
      <InstagramFeed />

      {/* Recently Sold Section */}
      {recentSoldListings.length > 0 &&
      <section className="py-16 bg-gradient-to-b from-primary-gray to-primary-black">
          <div className="container mx-auto px-4">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12">

              <div className="flex justify-center items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="font-bebas text-4xl md:text-5xl text-white">
                  VENDIDOS RECENTEMENTE
                </h2>
              </div>
              <p className="text-gray-400 font-montserrat text-lg max-w-2xl mx-auto">
                Confira os veículos que foram vendidos com sucesso através da nossa plataforma
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {recentSoldListings.map((listing, index) =>
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group">

                  {/* Sold Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-montserrat font-600 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>VENDIDO</span>
                  </div>
                  
                  {/* Sold Date */}
                  {listing.sold_at &&
              <div className="absolute top-4 right-4 z-20 bg-primary-black/80 text-gray-300 px-3 py-1 rounded-full text-xs font-montserrat flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(listing.sold_at).toLocaleDateString()}</span>
                    </div>
              }
                  
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <CarCard car={listing} />
                  </div>
                </motion.div>
            )}
            </div>

            <div className="text-center">
              <Link
              to="/vendidos"
              className="bg-green-600 hover:bg-green-700 text-white font-bebas text-xl px-8 py-4 rounded-lg transition-colors inline-flex items-center space-x-3">

                <CheckCircle className="w-6 h-6" />
                <span>VER TODOS OS VENDIDOS</span>
              </Link>
            </div>
          </div>
        </section>
      }
    </div>);

};

export default Home;