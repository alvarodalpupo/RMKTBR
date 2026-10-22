
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, loginWithGoogle, loginWithFacebook, forgotPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/painel';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate(from, { replace: true });
      } else {
        toast.error('E-mail ou senha incorretos');
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'E-mail ou senha incorretos';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de e-mail inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success('Login com Google realizado com sucesso!');
        navigate(from, { replace: true });
      } else {
        toast.error('Erro ao fazer login com Google');
      }
    } catch (error) {
      toast.error('Não foi possível logar com o Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithFacebook();
      if (success) {
        toast.success('Login com Facebook realizado com sucesso!');
        navigate(from, { replace: true });
      } else {
        toast.error('Erro ao fazer login com Facebook');
      }
    } catch (error) {
      toast.error('Não foi possível logar com o Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error('Por favor, insira seu e-mail');
      return;
    }

    setResetLoading(true);
    try {
      const success = await forgotPassword(resetEmail);
      if (success) {
        toast.success(`Link de redefinição enviado para ${resetEmail}`);
        setShowResetModal(false);
        setResetEmail('');
      } else {
        toast.error('Erro ao enviar e-mail de redefinição');
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao enviar e-mail de redefinição';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de e-mail inválido';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhuma conta encontrada com este e-mail';
      }
      
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-primary-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-primary-gray border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-bebas text-4xl text-white mb-2">
                ENTRAR
              </h1>
              <p className="text-gray-400 font-montserrat">
                Acesse sua conta no RaceMarketBR
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
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
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-red bg-primary-black border-gray-800 rounded focus:ring-primary-red focus:ring-2"
                  />
                  <span className="ml-2 text-gray-400 font-montserrat text-sm">
                    Lembrar de mim
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-primary-red hover:text-turbo-secondary font-montserrat text-sm transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-t border-gray-600" />
              <span className="mx-4 text-gray-400 text-sm font-montserrat">ou</span>
              <hr className="flex-grow border-t border-gray-600" />
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-montserrat py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Entrar com Google</span>
              </button>

              <button
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-montserrat py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Entrar com Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 font-montserrat">
                Ainda não tem conta?{' '}
                <Link
                  to="/cadastro"
                  className="text-primary-red hover:text-turbo-secondary font-600 transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-gray p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Recuperar Senha</h3>
              <p className="text-gray-400 text-sm">
                Informe seu e-mail para receber um link de redefinição de senha.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-primary-black border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-primary-red focus:outline-none transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="w-full bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Enviar Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetEmail('');
                  }}
                  className="w-full py-2 rounded-lg text-gray-400 font-montserrat bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
