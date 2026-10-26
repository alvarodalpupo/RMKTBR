import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useSeo } from '../seo/useSeo';

/** Destino do link "Esqueci minha senha": o Supabase já abre a sessão pelo link. */
const NovaSenha = () => {
  useSeo({ caminho: '/nova-senha', titulo: 'RaceMarketBR', naoIndexar: true });
  const { updatePassword, isAuthenticated, ready } = useAuthStore();
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) return toast.error('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== confirmar) return toast.error('As senhas não são iguais.');
    setSalvando(true);
    const r = await updatePassword(senha);
    setSalvando(false);
    if (!r.ok) return toast.error(r.error!);
    toast.success('Senha alterada.');
    navigate('/painel', { replace: true });
  };

  const input =
    'w-full pl-11 pr-4 py-3 bg-bg border border-line-strong rounded-md text-ink placeholder:text-ink-muted focus:border-red focus:outline-none';

  return (
    <div className="pt-20 min-h-screen bg-bg flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface border border-line rounded-xl p-8 space-y-5">
        <h1 className="font-display text-4xl text-ink text-center">CRIAR SENHA NOVA</h1>
        {ready && !isAuthenticated ? (
          <p className="text-ink-muted text-center">
            Este link expirou ou já foi usado. Peça outro em "Esqueci minha senha" na tela de login.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="nova-senha" className="block text-sm font-600 text-ink mb-2">Senha nova</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                <input id="nova-senha" type="password" autoComplete="new-password" minLength={8} required
                  value={senha} onChange={(e) => setSenha(e.target.value)} className={input} />
              </div>
            </div>
            <div>
              <label htmlFor="confirmar-senha" className="block text-sm font-600 text-ink mb-2">Repita a senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted w-5 h-5" />
                <input id="confirmar-senha" type="password" autoComplete="new-password" minLength={8} required
                  value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={input} />
              </div>
            </div>
            <button type="submit" disabled={salvando} className="rm-btn rm-btn--primary w-full">SALVAR SENHA</button>
          </>
        )}
      </form>
    </div>
  );
};

export default NovaSenha;
