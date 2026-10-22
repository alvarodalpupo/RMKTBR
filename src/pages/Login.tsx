import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface LoginProps {
  /** 'cadastro' muda apenas os textos; o fluxo do Lumi cobre login e cadastro. */
  mode?: 'login' | 'cadastro';
}

interface LocationState {
  from?: { pathname?: string };
}

const Login = ({ mode = 'login' }: LoginProps) => {
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from?.pathname || '/painel';
  const isSignup = mode === 'cadastro';

  // Já logado? Vai direto para o destino.
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleAuth = async () => {
    const ok = await login();
    if (ok) {
      toast.success(isSignup ? 'Conta pronta! Bem-vindo ao RaceMarketBR.' : 'Login realizado com sucesso!');
      navigate(from, { replace: true });
    } else {
      toast.error('Login não concluído. Se nenhuma janela abriu, permita pop-ups para este site.');
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
            <div className="text-center mb-8">
              <h1 className="font-bebas text-4xl text-white mb-2">
                {isSignup ? 'CRIAR CONTA' : 'ENTRAR'}
              </h1>
              <p className="text-gray-400 font-montserrat">
                {isSignup
                  ? 'Cadastre-se para anunciar e acompanhar seus anúncios'
                  : 'Acesse sua conta no RaceMarketBR'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full bg-primary-red hover:bg-turbo-dark text-white font-montserrat font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>{isSignup ? 'Criar minha conta' : 'Entrar'}</span>
                </>
              )}
            </button>

            <div className="mt-6 flex items-start space-x-3 bg-primary-black/60 border border-gray-800 rounded-lg p-4">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 font-montserrat text-sm">
                Uma janela segura será aberta para você {isSignup ? 'criar sua conta' : 'entrar'}.
                Lá também é possível recuperar a senha. Nós nunca vemos sua senha.
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 font-montserrat">
                {isSignup ? 'Já tem conta? ' : 'Ainda não tem conta? '}
                <Link
                  to={isSignup ? '/login' : '/cadastro'}
                  state={location.state}
                  className="text-red-text hover:text-turbo-secondary font-600 transition-colors"
                >
                  {isSignup ? 'Entrar' : 'Cadastre-se'}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
