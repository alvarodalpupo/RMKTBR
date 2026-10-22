import logoEscuro from '../assets/brand/logo-escuro.svg';
import logoClaro from '../assets/brand/logo-claro.svg';
import simbolo from '../assets/brand/simbolo.svg';

interface LogoProps {
  /** 'escuro' = para fundos escuros (padrão do site); 'claro' = para fundos brancos. */
  variant?: 'escuro' | 'claro';
  /** Altura em px. Largura mínima da marca: 120px (≈ 17px de altura). */
  height?: number;
  className?: string;
}

/** Logotipo RACEMARKETBR (letras em contorno, não depende da fonte). */
export const Logo = ({ variant = 'escuro', height = 24, className = '' }: LogoProps) => (
  <img
    src={variant === 'escuro' ? logoEscuro : logoClaro}
    alt="RaceMarketBR"
    height={height}
    width={Math.round((height * 495) / 70)}
    className={`block ${className}`}
    style={{ height, width: 'auto' }}
  />
);

/** Símbolo RM com a faixa de largada. Tamanho mínimo: 24px. */
export const Simbolo = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <img src={simbolo} alt="" aria-hidden="true" width={size} height={size} className={`block ${className}`} />
);

export default Logo;
