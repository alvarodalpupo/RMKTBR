import { useEffect } from 'react'
import config from './paginas.json'

export interface SeoProps {
  titulo?: string
  descricao?: string
  /** Caminho canônico (sem domínio). Padrão: a rota atual. */
  caminho?: string
  /** Imagem para compartilhamento (WhatsApp, Facebook). URL absoluta ou caminho. */
  imagem?: string
  /** Dados estruturados (schema.org) desta página. */
  jsonLd?: Record<string, unknown> | null
  /** Páginas privadas (login, painel, admin) não devem aparecer no Google. */
  naoIndexar?: boolean
}

const absoluto = (caminho: string) => (caminho.startsWith('http') ? caminho : `${config.site.url}${caminho}`)

const setMeta = (atributo: 'name' | 'property', chave: string, valor: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${chave}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(atributo, chave)
    document.head.appendChild(el)
  }
  el.content = valor
}

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/** Dados de SEO de uma rota fixa (título, descrição, texto de categoria). */
export const paginaSeo = (rota: string) => config.paginas.find((p) => p.rota === rota)

/**
 * Atualiza título, descrição, link canônico, Open Graph e dados estruturados
 * da página atual. O Google executa o JavaScript e lê estes valores; as
 * versões pré-geradas (scripts/prerender.mjs) já saem com eles no HTML.
 */
export function useSeo({ titulo, descricao, caminho, imagem, jsonLd, naoIndexar }: SeoProps) {
  // Texto em vez do objeto: um objeto novo a cada render refaria tudo sem motivo
  const jsonLdTexto = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const path = caminho ?? window.location.pathname
    const fixa = paginaSeo(path)
    const t = titulo ?? fixa?.titulo ?? config.site.nome
    const d = descricao ?? fixa?.descricao ?? config.site.descricaoPadrao
    const img = absoluto(imagem ?? config.site.imagem)
    const url = absoluto(path === '/' ? '/' : path.replace(/\/$/, ''))

    document.title = t
    setMeta('name', 'description', d)
    setMeta('name', 'robots', naoIndexar ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setLink('canonical', url)
    setMeta('property', 'og:title', t)
    setMeta('property', 'og:description', d)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:title', t)
    setMeta('name', 'twitter:description', d)
    setMeta('name', 'twitter:image', img)

    const id = 'seo-jsonld-pagina'
    document.getElementById(id)?.remove()
    if (jsonLdTexto) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.id = id
      s.textContent = jsonLdTexto
      document.head.appendChild(s)
    }
  }, [titulo, descricao, caminho, imagem, jsonLdTexto, naoIndexar])
}

export default useSeo
