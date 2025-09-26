
import React from 'react';
import { MessageCircleDashed as MessageCircle, Instagram, Mail, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-primary-gray border-t border-primary-red/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4">

            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-primary-red" />
              <span className="font-bebas text-2xl text-white">
                RaceMarket<span className="text-primary-red">BR</span>
              </span>
            </div>
            <p className="text-gray-400 font-montserrat">Classificado de carros turbos, aspirados, originais e preparados para pista do Brasil. 
              Encontre seu carro dos sonhos ou anuncie o seu!

            </p>
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4">

            <h3 className="font-bebas text-xl text-white">Contato</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-400 hover:text-primary-red transition-colors group">

                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-montserrat">(00) 0000-0000</span>
              </a>
              <a
                href="https://instagram.com/racemarketbr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-400 hover:text-primary-red transition-colors group">

                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-montserrat">@racemarketbr</span>
              </a>
              <a
                href="mailto:contato@racemarketbr.com.br"
                className="flex items-center space-x-3 text-gray-400 hover:text-primary-red transition-colors group">

                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-montserrat">contato@racemarketbr.com.br</span>
              </a>
            </div>
          </motion.div>

          {/* Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4">

            <h3 className="font-bebas text-xl text-white">Categorias</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-turbo rounded-full"></div>
                <span className="font-montserrat text-gray-400">Carros Turbos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-aspirado rounded-full"></div>
                <span className="font-montserrat text-gray-400">Carros Aspirados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-original rounded-full"></div>
                <span className="font-montserrat text-gray-400">Carros Originais</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                <span className="font-montserrat text-gray-400">Carros de Pista</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Aviso Legal */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-8 border-t border-primary-red/20 text-center">

          <p className="text-gray-500 font-montserrat text-sm">
            © 2024 RaceMarketBR. Todos os direitos reservados. 
            <span className="block mt-2">
              A RaceMarketBR apenas divulga os anúncios e não intermedia as vendas.
            </span>
          </p>
        </motion.div>
      </div>
    </footer>);

};

export default Footer;