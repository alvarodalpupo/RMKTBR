import { Link } from 'react-router-dom';
import { MessageCircleDashed as MessageCircle, Instagram, Mail } from 'lucide-react';
import Logo from './Logo';

const categorias = [
  { id: 'turbo', label: 'Turbo' },
  { id: 'aspirado', label: 'Aspirado' },
  { id: 'original', label: 'Original' },
  { id: 'pista', label: 'Pista' },
] as const;

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-line">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Marca */}
          <div className="space-y-4">
            <Logo height={28} />
            <p className="text-ink-muted font-sans max-w-sm">
              O classificado de quem vive de pista, preparação e originalidade.
            </p>
            <span className="rm-faixa" aria-hidden="true" />
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-ink">CONTATO</h3>
            <div className="space-y-3 text-ink-muted">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-red-text transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>(00) 0000-0000</span>
              </a>
              <a
                href="https://instagram.com/racemarketbr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-red-text transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>@racemarketbr</span>
              </a>
              <p className="flex items-center gap-3 select-all">
                <Mail className="w-5 h-5" />
                <span>contato@racemarketbr.com.br</span>
              </p>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-ink">CATEGORIAS</h3>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <Link key={c.id} to="/anuncios" className={`rm-badge rm-badge--${c.id} hover:opacity-90`}>
                  {c.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-sm text-ink-muted pt-2">
              <Link to="/termos" className="hover:text-ink">Termos de uso</Link>
              <Link to="/privacidade" className="hover:text-ink">Política de privacidade</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-line text-center">
          <p className="text-ink-muted font-sans text-sm">
            © {new Date().getFullYear()} RaceMarketBR. Todos os direitos reservados.
            <span className="block mt-2">A RaceMarketBR apenas divulga os anúncios e não intermedia as vendas.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
