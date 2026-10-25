import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { isDemoMode } from '../lib/supabase';

interface LoginProps {
  mode?: 'login' | 'cadastro';
}

interface LocationState {
  from?: { pathname?: string };
}

const inputClass =
  'w-full pl-11 pr-4 py-3 bg-bg border border-line-strong rounded-md text-ink font-sans placeholder:text-ink-muted focus:border-red focus:outline-none transition-colors';


const Login = ({ mode = 'login' }: LoginProps) => {
  const isSignup = mode === 'cadastro';
  const { login, register, forgotPassword, loginDemo, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname || '/painel';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'form' | 'esqueci' | 'confirmar'>('form');

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      if (nome.trim().length < 2) return toast.error('Informe seu nome.');
      if (password.length < 8) return toast.error('A senha precisa ter pelo menos 8 caracteres.');
      const r = await register(nome, email, password);
      if (!r.ok) return toast.error(r.error!);
      if (r.needsConfirmation) return setView('confirmar');
      toast.success('Conta criada. Bem-vindo ao RaceMarketBR!');
    } else {
      const r = await login(email, password);
      if (!r.ok) return toast.error(r.error!);
      toast.success('Login realizado.');
    }
    navigate(from, { replace: true });
  };


  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await forgotPassword(email);
    if (!r.ok) return toast.error(r.error!);
    toast.success(`Enviamos o link para ${email}.`);
    setView('form');
  };

  const card = 'bg-surface border border-line rounded-xl p-8 shadow-card';

  return (
    <div className="pt-20 min-h-screen bg-bg flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {view === 'confirmar' ? (
            <div className={`${card} text-center`}>
              <Mail className="w-10 h-10 text-red mx-auto mb-4" />
              <h1 className="font-display text-4xl text-ink mb-3">CONFIRME SEU E-MAIL</h1>
              <p className="text-ink-muted">
                Enviamos um link para <strong className="text-ink">{email}</strong>. Abra o e-mail e clique no link
                para ativar sua conta.
              </p>
              <Link to="/login" onClick={() => setView('form')} className="inline-block mt-6 text-red-text font-600">
                Voltar para o login
              </Link>
            </div>
          ) : view === 'esqueci' ? (
            <form onSubmit={handleForgot} className={card}>
              <h1 className="font-display text-4xl text-ink mb-2 text-center">RECUPERAR SENHA</h1>
              <p className="text-ink-muted text-center mb-6">Informe seu e-mail e enviaremos um link para criar uma senha nova.</p>
              <label htmlFor="email-reset" className="block text-sm font-600 text-ink mb-2">E-mail</label>
              <div className="relative mb-6">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                <input id="email-reset" type="email" required autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" />
              </div>
              <button type="submit" className="rm-btn rm-btn--primary w-full">ENVIAR LINK</button>
              <button type="button" onClick={() => setView('form')} className="w-full mt-4 text-ink-muted hover:text-ink">
                Cancelar
              </button>
            </form>
          ) : (
            <div className={card}>
              <div className="text-center mb-8">
                <h1 className="font-display text-5xl text-ink mb-2">{isSignup ? 'CRIAR CONTA' : 'ENTRAR'}</h1>
                <p className="text-ink-muted">
                  {isSignup ? 'Cadastre-se para anunciar e acompanhar seus anúncios.' : 'Acesse sua conta no RaceMarketBR.'}
                </p>
              </div>

              {isDemoMode && (
                <div className="mb-6 rounded-md border border-warning/40 bg-warning/10 p-4 text-sm text-ink">
                  <p className="font-600 mb-3">Modo demonstração: o banco de dados ainda não foi ligado.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rm-btn rm-btn--outline rm-btn--sm" onClick={() => loginDemo('user')}>
                      ENTRAR COMO USUÁRIO
                    </button>
                    <button type="button" className="rm-btn rm-btn--outline rm-btn--sm" onClick={() => loginDemo('admin')}>
                      ENTRAR COMO ADMIN
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignup && (
                  <div>
                    <label htmlFor="nome" className="block text-sm font-600 text-ink mb-2">Nome</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                      <input id="nome" required autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)}
                        className={inputClass} placeholder="Seu nome" />
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-600 text-ink mb-2">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                    <input id="email" type="email" required autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="senha" className="block text-sm font-600 text-ink">Senha</label>
                    {!isSignup && (
                      <button type="button" onClick={() => setView('esqueci')} className="text-sm text-red-text hover:underline">
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                    <input id="senha" type={showPassword ? 'text' : 'password'} required minLength={isSignup ? 8 : undefined}
                      autoComplete={isSignup ? 'new-password' : 'current-password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`}
                      placeholder={isSignup ? 'Mínimo de 8 caracteres' : 'Sua senha'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="rm-btn rm-btn--primary w-full">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-on-red border-t-transparent rounded-full animate-spin" />
                  ) : isSignup ? (
                    <><UserPlus className="w-5 h-5" />CRIAR CONTA</>
                  ) : (
                    <><LogIn className="w-5 h-5" />ENTRAR</>
                  )}
                </button>
              </form>

              {isSignup && (
                <p className="mt-4 text-xs text-ink-muted flex gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-success" />
                  <span>
                    Ao criar a conta você concorda com os <Link to="/termos" className="underline">Termos de uso</Link> e a{' '}
                    <Link to="/privacidade" className="underline">Política de privacidade</Link>.
                  </span>
                </p>
              )}

              <p className="mt-8 text-center text-ink-muted">
                {isSignup ? 'Já tem conta? ' : 'Ainda não tem conta? '}
                <Link to={isSignup ? '/login' : '/cadastro'} state={location.state} className="text-red-text font-600 hover:underline">
                  {isSignup ? 'Entrar' : 'Cadastre-se'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
