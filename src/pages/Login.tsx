
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/painel';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate(from, { replace: true });
      } else {
        toast.error('E-mail ou senha incorretos');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto">

          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="font-bebas text-4xl text-white mb-2">
                ENTRAR
              </h1>
              <p className="text-gray-400 font-montserrat">
                Acesse sua conta no RaceMarketBR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                    required />

                </div>
              </div>

              <div>
                <label className="block text-white font-montserrat font-600 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                    placeholder="Sua senha"
                    required />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">

                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-red bg-primary-black border-gray-800 rounded focus:ring-primary-red focus:ring-2" />

                  <span className="ml-2 text-gray-400 font-montserrat text-sm">
                    Lembrar de mim
                  </span>
                </label>
                <Link
                  to="/esqueci-senha"
                  className="text-primary-red hover:text-turbo-secondary font-montserrat text-sm transition-colors">

                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">

                {isLoading ?
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                  </>
                }
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 font-montserrat">
                Ainda não tem conta?{' '}
                <Link
                  to="/cadastro"
                  className="text-primary-red hover:text-turbo-secondary font-600 transition-colors">

                  Cadastre-se
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            








          </div>
        </motion.div>
      </div>
    </div>);

};

export default Login;