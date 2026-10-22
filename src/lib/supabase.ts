import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Cliente do Supabase. Fica `null` quando as chaves não foram configuradas:
 * nesse caso o site roda em **modo demonstração**, com anúncios de exemplo
 * na memória do navegador (nada é salvo).
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

export const isDemoMode = supabase === null

if (isDemoMode && import.meta.env.DEV) {
  console.info('[RaceMarketBR] Supabase não configurado: rodando em modo demonstração.')
}

/** Nome do bucket de fotos (ver supabase/migrations). */
export const FOTOS_BUCKET = 'anuncios'

/** Mensagem amigável para erros do Supabase. */
export const mensagemDeErro = (error: unknown, padrao = 'Algo deu errado. Tente de novo.'): string => {
  const msg = (error as { message?: string })?.message ?? ''
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/Email not confirmed/i.test(msg)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
  if (/User already registered/i.test(msg)) return 'Já existe uma conta com este e-mail.'
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
  if (/row-level security|permission denied/i.test(msg)) return 'Você não tem permissão para fazer isso.'
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'Sem conexão com o servidor. Verifique sua internet.'
  return padrao
}

/**
 * Dispara uma chamada ao Supabase sem esperar a resposta.
 * Importante: as consultas do supabase-js só são enviadas quando alguém
 * "espera" por elas (then/await); `void consulta` sozinho não envia nada.
 */
export const enviarSemEsperar = (
  consulta: PromiseLike<{ error: unknown }>,
  aoFalhar?: (error: unknown) => void,
): void => {
  consulta.then(
    ({ error }) => {
      if (error) (aoFalhar ?? ((e) => console.warn('[Supabase]', e)))(error)
    },
    (e) => (aoFalhar ?? ((x) => console.warn('[Supabase]', x)))(e),
  )
}
