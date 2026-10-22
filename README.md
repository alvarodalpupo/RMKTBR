# RaceMarketBR

Classificados de carros preparados — turbo, aspirado, original e pista.

Feito com React 18, TypeScript, Vite, Tailwind CSS e Zustand. O login e parte dos dados usam o [Lumi](https://lumi.new) como backend.

## Rodando no computador

Requisitos: Node.js 18+ e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # abre em http://localhost:5173
```

| Comando        | O que faz                                   |
| -------------- | ------------------------------------------- |
| `pnpm dev`     | Servidor de desenvolvimento                 |
| `pnpm build`   | Gera a versão de produção em `dist/`        |
| `pnpm preview` | Abre localmente o que foi gerado no build   |
| `pnpm lint`    | Verifica o código com ESLint                |
| `pnpm typecheck` | Verifica os tipos com TypeScript          |

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha o que for usar.

| Variável                       | Para quê                                  |
| ------------------------------ | ----------------------------------------- |
| `VITE_INSTAGRAM_ACCESS_TOKEN`  | Feed do Instagram na página inicial. Sem ela o feed fica oculto em produção. |

> **Atenção:** tudo que começa com `VITE_` vai junto no código que o navegador baixa, ou seja, qualquer visitante consegue ver. Use apenas um token de leitura do Instagram, nunca uma chave secreta.

## Login e administradores

O login acontece na janela segura do Lumi (`auth.lumi.new`), que cuida de cadastro, senha e recuperação de senha.

Quem é administrador é definido **no painel do Lumi**, não no site. Para dar acesso ao `/admin`, altere o papel do usuário para `ADMIN` no painel do projeto.

A verificação de admin no site só esconde telas. A proteção real dos dados vem das permissões de cada entidade configuradas no Lumi — revise-as antes de colocar dados reais.

## Estrutura

```
src/
  pages/        Uma página por rota (Home, Anuncios, Admin, Painel...)
  components/   Peças reutilizáveis (CarCard, Header, PowerTorqueBar...)
  stores/       Estado global com Zustand (anúncios, usuários, mensagens...)
  hooks/        Hooks de autenticação, perfil e sessões
  entities/     Esquemas das entidades do Lumi
  lib/lumi.ts   Cliente do Lumi
  utils/        Formatação de preço, telefone etc.
```

## O que ainda é demonstração

Estes dados ainda vivem só na memória do navegador e **somem ao recarregar a página**:

- Anúncios (`stores/listingsStore.ts`)
- Usuários exibidos no Admin (`stores/usersStore.ts`)
- Mensagens de contato (`stores/contactMessagesStore.ts`)
- Notificações (`stores/notificationsStore.ts`)

Para o site funcionar de verdade, o próximo passo é criar essas entidades no Lumi (como já existe para `site_customization`, `user_profiles` e `user_sessions`) e trocar os dados de exemplo por chamadas `lumi.entities.<nome>`.
