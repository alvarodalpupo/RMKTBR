# RaceMarketBR

Classificados de carros preparados: turbo, aspirado, original e pista. Publicado em **racemarketbr.com.br**.

Feito com React 18, TypeScript, Vite, Tailwind CSS e Zustand. Banco de dados, login e fotos ficam no [Supabase](https://supabase.com) (PostgreSQL). O site é publicado automaticamente no GitHub Pages a cada atualização da branch `main`.

## Como o site guarda os dados

| O quê | Onde |
| --- | --- |
| Anúncios, mensagens de contato, notificações, configurações | Tabelas PostgreSQL no Supabase |
| Contas e login (e-mail/senha e Google) | Supabase Auth |
| Fotos dos anúncios e de perfil | Supabase Storage, bucket `anuncios` (reduzidas para WebP antes de enviar) |

Quem pode o quê é garantido **pelo banco** (Row Level Security), não pelo site:

- Visitantes veem só anúncios publicados ou vendidos.
- Qualquer pessoa pode enviar anúncio ou mensagem; o anúncio entra "em revisão".
- Só o admin aprova, rejeita, destaca, lê mensagens e gerencia usuários.
- O dono edita, arquiva ou marca o próprio anúncio como vendido. Se editar um anúncio publicado, ele volta para revisão.
- Ninguém consegue se promover a admin pelo site.
- O e-mail de quem anuncia sem conta fica numa tabela separada, visível só ao admin.
- Contas banidas não publicam.

Tudo isso está em `supabase/migrations/20261022000000_inicial.sql`.

Sem as chaves do Supabase, o site roda em **modo demonstração**: mostra anúncios de exemplo, nada é salvo e a tela de login oferece "entrar como usuário/admin" só para conhecer as telas.

## 1. Criar o banco no Supabase (uma vez)

1. Crie uma conta em supabase.com e um projeto novo (região **São Paulo**).
2. No projeto, abra **SQL Editor → New query**, cole todo o conteúdo de `supabase/migrations/20261022000000_inicial.sql` e clique em **Run**. Pode rodar de novo sem quebrar nada.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Em **Authentication → URL Configuration**:
   - **Site URL**: `https://racemarketbr.com.br`
   - **Redirect URLs**: adicione `https://racemarketbr.com.br/**` e `http://localhost:5173/**`
5. (Opcional) Login com Google: **Authentication → Providers → Google**, cole o Client ID e o Secret criados no Google Cloud Console.

### Tornar-se administrador

Crie sua conta pelo site normalmente. Depois, no **SQL Editor** do Supabase, rode:

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

## 2. Publicar no GitHub Pages (uma vez)

1. No repositório: **Settings → Secrets and variables → Actions → aba Variables → New repository variable**:
   - `VITE_SUPABASE_URL` = Project URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon public key
2. **Settings → Pages → Source**: escolha **GitHub Actions**.
3. Ainda em **Pages**, em **Custom domain**: `racemarketbr.com.br`. Depois que o domínio funcionar, marque **Enforce HTTPS**.

A cada `push` na `main`, a ação **Publicar site** (aba Actions) confere o código, gera o site e publica. Leva uns 2 minutos.

### DNS do domínio

O DNS de `racemarketbr.com.br` está no **Netlify** (servidores `dns*.p03.nsone.net`). Lá, em **Domains → racemarketbr.com.br → DNS records**:

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | `racemarketbr.com.br` | `185.199.108.153` |
| A | `racemarketbr.com.br` | `185.199.109.153` |
| A | `racemarketbr.com.br` | `185.199.110.153` |
| A | `racemarketbr.com.br` | `185.199.111.153` |
| CNAME | `www` | `alvarodalpupo.github.io` |

Apague o `www` que aponta para o Lumi e qualquer outro A/ALIAS do domínio principal.

## Rodar no computador

Requisitos: Node.js 18+ e [pnpm](https://pnpm.io).

```bash
cp .env.example .env   # preencha com as chaves do Supabase (ou deixe vazio para o modo demonstração)
pnpm install
pnpm dev               # http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Gera o site em `dist/` |
| `pnpm typecheck` | Confere os tipos (TypeScript) |
| `pnpm lint` | Confere o código (ESLint) |
| `pnpm check` | Os três acima |

## Estrutura

```
supabase/migrations/  Banco: tabelas, regras de segurança, fotos
src/
  lib/supabase.ts     Cliente do Supabase e modo demonstração
  lib/fotos.ts        Redução e envio de fotos
  stores/             Estado (anúncios, login, usuários, mensagens, notificações, configurações)
  pages/              Uma página por rota
  components/         Peças reutilizáveis (CarCard, Header, Logo...)
  assets/             Logos e fontes da identidade visual
.github/workflows/    Publicação automática no GitHub Pages
```

## Limites conhecidos

- **Excluir usuário** no Admin bloqueia a conta e tira da lista. Para apagar o login de vez: Supabase → Authentication → Users (exige a chave secreta, que não pode ficar no site).
- **Sessões**: o painel mostra este aparelho e permite "sair de todos os outros aparelhos". O Supabase não lista os aparelhos para o site.
- O plano grátis do Supabase pausa o projeto após 7 dias sem nenhum acesso. Com o site no ar e recebendo visitas, isso não acontece.
