
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {Menu, X, User, LogOut, Settings, CheckCircle} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Início' },
    { path: '/anuncios', label: 'Anúncios' },
    { path: '/vendidos', label: 'Vendidos', icon: CheckCircle },
    { path: '/anuncie-seu-carro', label: 'Anunciar' },
    { path: '/contato', label: 'Contato' }
  ];


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="font-bebas text-2xl text-white">
              RACE<span className="text-primary-red">MARKET</span>BR
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-montserrat font-500 transition-colors flex items-center space-x-1 ${
                  isActive(item.path)
                    ? 'text-primary-red'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu / Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <div className="flex items-center space-x-1">
                    <span className="font-montserrat">{user.nome}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-primary-gray border border-gray-700 rounded-lg shadow-xl py-2"
                    >
                      {/* User Info */}
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-white font-montserrat font-600 text-sm">{user.nome}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>

                      <Link
                        to="/painel"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Painel</span>
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-montserrat transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-primary-red hover:bg-turbo-dark text-white px-4 py-2 rounded-lg font-montserrat transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-800 py-4"
            >
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`font-montserrat font-500 transition-colors flex items-center space-x-2 ${
                      isActive(item.path)
                        ? 'text-primary-red'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {user ? (
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center space-x-2 text-gray-300 mb-4">
                      <User className="w-5 h-5" />
                      <div>
                        <span className="font-montserrat block">{user.nome}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/painel"
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Painel</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-800 flex flex-col space-y-2">
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white font-montserrat transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      className="bg-primary-red hover:bg-turbo-dark text-white px-4 py-2 rounded-lg font-montserrat transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
