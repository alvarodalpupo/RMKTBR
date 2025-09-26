
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Eye, MessageCircleDashed as MessageCircle, ArrowLeft, Share2, Heart, Flame, Zap, CheckCircle, Flag, Phone, Star, Settings } from 'lucide-react';
import { useListingsStore } from '../stores/listingsStore';
import PowerTorqueBar from '../components/PowerTorqueBar';
import toast from 'react-hot-toast';

const AnuncioDetalhes = () => {
  const { id } = useParams<{id: string;}>();
  const { listings, incrementViews, incrementWhatsAppClicks } = useListingsStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const viewsIncrementedRef = useRef(false);

  const listing = listings.find((l) => l.id === id);

  useEffect(() => {
    // Só incrementa as visualizações uma vez por sessão
    if (listing && !viewsIncrementedRef.current) {
      incrementViews(listing.id);
      viewsIncrementedRef.current = true;
    }
  }, [listing?.id]); // Dependência apenas do ID do listing

  if (!listing) {
    return (
      <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-bebas text-4xl text-white mb-4">ANÚNCIO NÃO ENCONTRADO</h1>
          <Link to="/anuncios" className="text-primary-red hover:text-turbo-secondary font-montserrat font-600">
            ← Voltar aos anúncios
          </Link>
        </div>
      </div>);

  }

  const getCategoryIcon = () => {
    switch (listing.categoria) {
      case 'turbo':
        return <Flame className="w-5 h-5" />;
      case 'aspirado':
        return <Zap className="w-5 h-5" />;
      case 'original':
        return <CheckCircle className="w-5 h-5" />;
      case 'pista':
        return <Flag className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (listing.categoria) {
      case 'turbo':
        return 'text-turbo-primary bg-turbo-primary/10 border-turbo-primary/20';
      case 'aspirado':
        return 'text-aspirado-primary bg-aspirado-primary/10 border-aspirado-primary/20';
      case 'original':
        return 'text-original-primary bg-original-primary/10 border-original-primary/20';
      case 'pista':
        return 'text-pista-primary bg-pista-primary/10 border-pista-primary/20';
      default:
        return 'text-gray-400';
    }
  };

  const getTractionInfo = () => {
    switch (listing.tracao) {
      case 'dianteira':
        return {
          label: 'Tração Dianteira',
          icon: '🚗',
          description: 'Motor transfere força para as rodas dianteiras'
        };
      case 'traseira':
        return {
          label: 'Tração Traseira',
          icon: '🏎️',
          description: 'Motor transfere força para as rodas traseiras'
        };
      case 'integral':
        return {
          label: 'Tração Integral',
          icon: '🚙',
          description: 'Motor transfere força para todas as rodas'
        };
      default:
        return {
          label: 'Não informado',
          icon: '🚗',
          description: 'Tipo de tração não especificado'
        };
    }
  };

  const handleWhatsAppClick = () => {
    if (listing.telefone) {
      incrementWhatsAppClicks(listing.id);
      const message = encodeURIComponent(`Olá! Tenho interesse no seu ${listing.titulo} anunciado no RaceMarketBR por ${listing.preco}.`);
      window.open(`https://wa.me/55${listing.telefone}?text=${message}`, '_blank');
    } else {
      toast.error('Telefone não disponível');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.titulo,
        text: `Confira este ${listing.titulo} por ${listing.preco}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const tractionInfo = getTractionInfo();

  return (
    <div className="pt-20 min-h-screen bg-primary-black">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6">

          <Link
            to="/anuncios"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-primary-red transition-colors font-montserrat">

            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos anúncios</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2">

            <div className="bg-primary-gray rounded-2xl overflow-hidden border border-gray-800">
              {/* Main Image */}
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.titulo}
                  className="w-full h-full object-cover" />

                
                {/* Featured Badge */}
                {listing.destaque &&
                <div className="absolute top-4 left-4 flex items-center space-x-1 bg-primary-red text-white px-3 py-1 rounded-full text-sm font-montserrat font-600">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Destaque</span>
                  </div>
                }

                {/* Category Badge */}
                <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-montserrat font-600 border ${getCategoryColor()}`}>
                  {getCategoryIcon()}
                  <span className="capitalize">{listing.categoria}</span>
                </div>

                {/* Image Navigation */}
                {listing.images.length > 1 &&
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {listing.images.map((_, index) =>
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-primary-red' : 'bg-white/50'}`
                    } />

                  )}
                  </div>
                }
              </div>

              {/* Thumbnail Strip */}
              {listing.images.length > 1 &&
              <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {listing.images.map((image, index) =>
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary-red' : 'border-transparent'}`
                    }>

                        <img
                      src={image}
                      alt={`${listing.titulo} ${index + 1}`}
                      className="w-full h-full object-cover" />

                      </button>
                  )}
                  </div>
                </div>
              }
            </div>
          </motion.div>

          {/* Details Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">

            {/* Main Info */}
            <div className="bg-primary-gray rounded-2xl p-6 border border-gray-800">
              <h1 className="font-bebas text-3xl md:text-4xl text-white mb-4">
                {listing.titulo}
              </h1>
              
              <div className="flex items-center space-x-4 text-gray-400 text-sm mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{listing.ano}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.cidade} - {listing.uf}</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-bebas text-4xl text-primary-red">
                  {listing.preco}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-montserrat font-bold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2">

                  <MessageCircle className="w-5 h-5" />
                  <span>Chamar no WhatsApp</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShare}
                    className="bg-primary-black hover:bg-gray-900 text-white font-montserrat font-600 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">

                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  
                  <button
                    onClick={handleFavorite}
                    className={`font-montserrat font-600 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isFavorited ?
                    'bg-primary-red text-white' :
                    'bg-primary-black hover:bg-gray-900 text-white'}`
                    }>

                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    <span>Favoritar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Traction Info */}
            <div className="bg-primary-gray rounded-2xl p-6 border border-gray-800">
              <h3 className="font-bebas text-xl text-white mb-4">TRAÇÃO</h3>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{tractionInfo.icon}</span>
                <div>
                  <div className="font-montserrat font-bold text-white">{tractionInfo.label}</div>
                  <div className="text-gray-400 text-sm font-montserrat">{tractionInfo.description}</div>
                </div>
              </div>
            </div>

            {/* Performance Data - Agora com escalas dinâmicas */}
            <div className="bg-primary-gray rounded-2xl p-6 border border-gray-800">
              <h3 className="font-bebas text-xl text-white mb-4">PERFORMANCE</h3>
              <PowerTorqueBar
                value={listing.power_whp}
                unit="whp"
                icon="⚡"
                color="#FF3B3B"
                size="large"
                category={listing.categoria} />

              <PowerTorqueBar
                value={listing.torque_kgfm}
                unit="kgfm"
                icon="🔧"
                color="#3B7BFF"
                size="large"
                category={listing.categoria} />

            </div>

            {/* Stats */}
            



















            {/* Description */}
            {listing.descricao &&
            <div className="bg-primary-gray rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bebas text-xl text-white mb-4">DESCRIÇÃO</h3>
                <p className="text-gray-300 font-montserrat leading-relaxed">
                  {listing.descricao}
                </p>
              </div>
            }

            {/* Contact Info */}
            



















          </motion.div>
        </div>
      </div>
    </div>);

};

export default AnuncioDetalhes;