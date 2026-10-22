import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Trophy, MapPin } from 'lucide-react';
import CarCard from '../components/CarCard';
import { useListingsStore } from '../stores/listingsStore';

const Vendidos = () => {
  const {
    filteredListings,
    setFilters,
    getSoldListings
  } = useListingsStore();

  // Configurar filtro para mostrar apenas vendidos
  useEffect(() => {
    setFilters({ showSoldOnly: true });

    // Cleanup: resetar filtro quando sair da página
    return () => {
      setFilters({ showSoldOnly: false });
    };
  }, [setFilters]);

  // Obter estatísticas dos vendidos
  const soldListings = getSoldListings();
  const totalSold = soldListings.length;
  const statesCount = new Set(soldListings.map((listing) => listing.uf)).size;

  const categoriesCount = soldListings.reduce((acc, listing) => {
    acc[listing.categoria] = (acc[listing.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1])[0]?.[0];


  return (
    <div className="min-h-screen bg-primary-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">

          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-bebas text-4xl md:text-6xl text-white mb-4">
            VEÍCULOS VENDIDOS
          </h1>
          <p className="text-gray-400 font-montserrat text-lg max-w-2xl mx-auto">
            Histórico de sucesso do RaceMarket BR - Veículos que encontraram seus novos donos
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Total Vendidos */}
          <div className="bg-primary-gray border border-gray-800 rounded-xl p-6 text-center">
            <Car className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="font-bebas text-4xl text-white">{totalSold}</div>
            <div className="text-gray-400 font-montserrat text-sm">Veículos vendidos</div>
          </div>

          {/* Estados */}
          <div className="bg-primary-gray border border-gray-800 rounded-xl p-6 text-center">
            <MapPin className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="font-bebas text-4xl text-white">{statesCount}</div>
            <div className="text-gray-400 font-montserrat text-sm">{statesCount === 1 ? 'Estado' : 'Estados'} com vendas</div>
          </div>

          {/* Categoria Mais Vendida */}
          <div className="bg-primary-gray border border-gray-800 rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="font-bebas text-4xl text-white uppercase">{topCategory ?? '—'}</div>
            <div className="text-gray-400 font-montserrat text-sm">Categoria mais vendida</div>
          </div>
        </motion.div>

        {/* Vehicles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}>

          {filteredListings.length > 0 ?
          <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bebas text-2xl text-white">
                  VEÍCULOS VENDIDOS ({filteredListings.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) =>
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>

                    <CarCard car={listing} />
                  </motion.div>
              )}
              </div>
            </> :

          <div className="text-center py-16">
              <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-gray border border-gray-800 rounded-xl p-8 max-w-2xl mx-auto">

                <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-white mb-4">
                  NENHUM VEÍCULO VENDIDO
                </h3>
                <p className="text-gray-400 font-montserrat text-lg">
                  Ainda não temos veículos vendidos para exibir. 
                  Em breve você verá aqui o histórico de sucessos da nossa plataforma.
                </p>
              </motion.div>
            </div>
          }
        </motion.div>

        {/* Categories Breakdown */}
        {totalSold > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12">
            <h2 className="font-bebas text-3xl text-white mb-6 text-center">VENDIDOS POR CATEGORIA</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoriesCount).map(([category, count]) =>
                <div
                  key={category}
                  className="bg-primary-gray border border-gray-800 rounded-xl p-6 text-center">
                  <div className="font-bebas text-4xl text-primary-red">{count}</div>
                  <div className="text-gray-400 font-montserrat text-sm uppercase tracking-wide">{category}</div>
                </div>
              )}
            </div>
          </motion.div>
        }
      </div>
    </div>);

};

export default Vendidos;