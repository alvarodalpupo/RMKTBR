
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Star, Flame, Zap, CheckCircle, Flag, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../stores/listingsStore';
import PowerTorqueBar from './PowerTorqueBar';

interface CarCardProps {
  car: Listing;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const getCategoryIcon = () => {
    switch (car.categoria) {
      case 'turbo':
        return <Flame className="w-4 h-4" />;
      case 'aspirado':
        return <Zap className="w-4 h-4" />;
      case 'original':
        return <CheckCircle className="w-4 h-4" />;
      case 'pista':
        return <Flag className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (car.categoria) {
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

  const getCategoryGradient = () => {
    switch (car.categoria) {
      case 'turbo':
        return 'bg-gradient-turbo';
      case 'aspirado':
        return 'bg-gradient-aspirado';
      case 'original':
        return 'bg-gradient-original';
      case 'pista':
        return 'bg-gradient-pista';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  const getTractionLabel = () => {
    switch (car.tracao) {
      case 'dianteira':
        return 'Dianteira';
      case 'traseira':
        return 'Traseira';
      case 'integral':
        return 'Integral';
      default:
        return 'N/A';
    }
  };

  const getTractionIcon = () => {
    switch (car.tracao) {
      case 'dianteira':
        return '🚗';
      case 'traseira':
        return '🏎️';
      case 'integral':
        return '🚙';
      default:
        return '🚗';
    }
  };

  // Determinar se o veículo está vendido
  const isSold = car.status === 'vendido';

  return (
    <motion.div
      whileHover={{ y: isSold ? 0 : -5 }}
      className={`group relative bg-primary-gray border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
      isSold ?
      'opacity-90 border-green-500/30' :
      'hover:border-primary-red'}`
      }>

      <Link to={`/anuncio/${car.id}`}>
        {/* Sold Badge - Prioridade máxima */}
        {isSold &&
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-montserrat font-600">
            <CheckCircle className="w-3 h-3 fill-current" />
            <span>VENDIDO</span>
          </div>
        }

        {/* Featured Badge */}
        {car.destaque && !isSold &&
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-1 bg-primary-red text-white px-3 py-1 rounded-full text-sm font-montserrat font-600">
            <Star className="w-3 h-3 fill-current" />
            <span>Destaque</span>
          </div>
        }

        {/* Aceita Troca Badge */}
        {car.aceita_troca && !isSold &&
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-montserrat font-600"
        style={{ top: car.destaque ? '3.5rem' : '1rem' }}>
            <RefreshCw className="w-3 h-3" />
            <span>Aceita Troca</span>
          </div>
        }

        {/* Category Badge */}
        <div className={`absolute top-4 right-4 z-10 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-montserrat font-600 border ${getCategoryColor()}`}>
          {getCategoryIcon()}
          <span className="capitalize">{car.categoria}</span>
        </div>

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={car.images?.[0] || 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'}
            alt={car.titulo}
            className={`w-full h-full object-cover transition-transform duration-500 ${
            isSold ? '' : 'group-hover:scale-110'}`
            } />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Sold Overlay */}
          {isSold &&
          <div className="absolute inset-0 bg-black/20"></div>
          }
          
          {/* Category Gradient Line */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          isSold ? 'bg-green-500' : getCategoryGradient()}`
          }></div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className={`font-montserrat font-bold text-lg text-white mb-2 transition-colors line-clamp-1 ${
          isSold ? '' : 'group-hover:text-primary-red'}`
          }>
            {car.titulo}
          </h3>
          
          <div className="flex items-center space-x-4 text-gray-400 text-sm mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{car.ano}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{car.cidade} - {car.uf}</span>
            </div>
          </div>

          {/* Traction Info */}
          <div className="flex items-center space-x-1 text-gray-400 text-sm mb-4">
            <span>{getTractionIcon()}</span>
            <span>Tração {getTractionLabel()}</span>
          </div>

          {/* Power and Torque Bars */}
          <div className="mb-4 space-y-1">
            <PowerTorqueBar
              value={car.power_whp}
              unit="whp"
              icon="⚡"
              color="#FF3B3B"
              size="small"
              category={car.categoria} />

            <PowerTorqueBar
              value={car.torque_kgfm}
              unit="kgfm"
              icon="🔧"
              color="#3B7BFF"
              size="small"
              category={car.categoria} />

          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <span className={`font-bebas text-2xl ${
            isSold ? 'text-green-500' : 'text-primary-red'}`
            }>
              {car.preco}
            </span>
            <span className={`font-montserrat font-600 transition-transform ${
            isSold ?
            'text-green-500' :
            'text-primary-red group-hover:translate-x-1'}`
            }>
              {isSold ? 'Vendido ✓' : 'Ver detalhes →'}
            </span>
          </div>

          {/* Sold Date */}
          {isSold && car.sold_at &&
          <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Vendido em {new Date(car.sold_at).toLocaleDateString()}</span>
              </div>
            </div>
          }
        </div>
      </Link>
    </motion.div>);

};

export default CarCard;