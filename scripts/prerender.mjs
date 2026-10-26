#!/usr/bin/env node
// =====================================================================
// Gera, depois do `vite build`, o que o Google precisa para indexar o site:
//
//  * Uma cópia do index.html para cada página (dist/anuncios/index.html,
//    dist/carros-turbo/index.html, dist/anuncio/<id>/index.html...), já com
//    título, descrição, link canônico, Open Graph e dados estruturados.
//    Sem isso o GitHub Pages responde essas páginas com erro 404, e o Google
//    não indexa página 404.
//  * sitemap.xml com as páginas fixas e todos os anúncios publicados.
//  * robots.txt.
//
// Os anúncios vêm do Supabase (só os públicos: publicados e vendidos).
// Se o banco não responder, as páginas fixas são geradas mesmo assim.
// =====================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(raiz, 'dist')
const config = JSON.parse(fs.readFileSync(path.join(raiz, 'src/seo/paginas.json'), 'utf8'))
const SITE = config.site.url

// Mesmo projeto de src/lib/supabase.ts (chave pública)
const supabaseTs = fs.readFileSync(path.join(raiz, 'src/lib/supabase.ts'), 'utf8')
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || supabaseTs.match(/PROJETO_URL = '([^']+)'/)?.[1]
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || supabaseTs.match(/PROJETO_CHAVE_PUBLICA = '([^']+)'/)?.[1]

const base = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const absoluto = (p) => (p.startsWith('http') ? p : `${SITE}${p}`)

/** Troca as tags do <head> do index.html pelas da página. */
function htmlDaPagina({ rota, titulo, descricao, imagem, jsonLd, naoIndexar, corpo }) {
  const url = absoluto(rota === '/' ? '/' : rota)
  const img = absoluto(imagem || config.site.imagem)
  let html = base
  const trocar = (re, novo) => {
    if (!re.test(html)) throw new Error(`Tag não encontrada no index.html: ${re}`)
    html = html.replace(re, novo)
  }
  trocar(/<title>.*?<\/title>/s, `<title>${esc(titulo)}</title>`)
  trocar(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(descricao)}">`)
  trocar(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${naoIndexar ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`)
  trocar(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}">`)
  trocar(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(titulo)}">`)
  trocar(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(descricao)}">`)
  trocar(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(url)}">`)
  trocar(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(img)}">`)
  trocar(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(titulo)}">`)
  trocar(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(descricao)}">`)
  trocar(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(img)}">`)
  if (jsonLd) {
    const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c')
    html = html.replace('</head>', `  <script type="application/ld+json" id="seo-jsonld-pagina">${json}</script>\n  </head>`)
  }
  // Texto visível para robôs que não rodam JavaScript (o app substitui ao carregar)
  if (corpo) {
    html = html.replace(/<noscript>.*?<\/noscript>/s, `<noscript>${corpo}</noscript>`)
  }
  return html
}

// /carros-turbo -> carros-turbo.html: o GitHub Pages serve /carros-turbo direto (200),
// sem o redirecionamento para /carros-turbo/ que uma pasta causaria.
function gravar(rota, html) {
  const destino = rota === '/' ? path.join(dist, 'index.html') : path.join(dist, `${rota.replace(/^\//, '')}.html`)
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, html)
}

// ---------- Anúncios (mesma regra de src/seo/anuncio.ts) ----------
const CATEGORIA = { turbo: 'turbo', aspirado: 'aspirado', original: 'original', pista: 'de pista' }
const ROTA_CATEGORIA = { turbo: '/carros-turbo', aspirado: '/carros-aspirados', original: '/carros-originais', pista: '/carros-de-pista' }
const preco = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
const TRACAO = { dianteira: 'FrontWheelDriveConfiguration', traseira: 'RearWheelDriveConfiguration', integral: 'AllWheelDriveConfiguration' }

function seoDoAnuncio(l) {
  const vendido = l.status === 'vendido'
  const ficha = [l.power_whp && `${Number(l.power_whp)} whp`, l.torque_kgfm && `${Number(l.torque_kgfm)} kgfm`].filter(Boolean).join(', ')
  const titulo = vendido
    ? `${l.titulo} ${l.ano} (vendido) | RaceMarketBR`
    : `${l.titulo} ${l.ano} à venda em ${l.cidade}-${l.uf} — ${preco(l.preco)} | RaceMarketBR`
  const descricao = (vendido
    ? `${l.titulo} ${l.ano}, carro ${CATEGORIA[l.categoria]} vendido pelo RaceMarketBR em ${l.cidade}-${l.uf}.`
    : `${l.titulo} ${l.ano}, carro ${CATEGORIA[l.categoria]} à venda em ${l.cidade}-${l.uf} por ${preco(l.preco)}.` +
      (ficha ? ` ${ficha}.` : '') + (l.aceita_troca ? ' Aceita troca.' : '') + ' Fale com o dono pelo WhatsApp.'
  ).slice(0, 300)
  const url = `${SITE}/anuncio/${l.id}`
  const imagens = (l.images || []).filter((i) => i.startsWith('http'))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${l.titulo} ${l.ano}`,
    description: l.descricao || descricao,
    url,
    image: imagens.slice(0, 5),
    vehicleModelDate: String(l.ano),
    ...(l.tracao ? { driveWheelConfiguration: TRACAO[l.tracao] } : {}),
    ...(l.power_whp ? { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: Number(l.power_whp), unitText: 'whp' } } } : {}),
    ...(!vendido ? { offers: { '@type': 'Offer', price: Number(l.preco), priceCurrency: 'BRL', availability: 'https://schema.org/InStock', url, areaServed: `${l.cidade}, ${l.uf}` } } : {}),
  }
  const corpo =
    `<h1>${esc(`${l.titulo} ${l.ano}`)}</h1><p>${esc(descricao)}</p>` +
    (l.descricao ? `<p>${esc(l.descricao)}</p>` : '') +
    `<p><a href="${ROTA_CATEGORIA[l.categoria]}">Mais carros ${esc(CATEGORIA[l.categoria])}</a></p>`
  return { titulo, descricao, imagem: imagens[0], jsonLd, corpo }
}

async function buscarAnuncios() {
  if (process.env.VITE_DEMO === '1' || !SUPABASE_URL || !SUPABASE_KEY) return []
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?select=id,titulo,categoria,ano,preco,cidade,uf,descricao,power_whp,torque_kgfm,tracao,status,aceita_troca,images,updated_at&status=in.(publicado,vendido)&order=created_at.desc&limit=5000`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, signal: AbortSignal.timeout(20000) },
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } catch (e) {
    console.warn(`[prerender] Não foi possível buscar os anúncios (${e.message}). Gerando só as páginas fixas.`)
    return []
  }
}

// ---------- Geração ----------
const hoje = new Date().toISOString().slice(0, 10)
const urls = []

for (const p of config.paginas) {
  const corpo =
    `<h1>${esc(p.h1 || p.titulo)}</h1><p>${esc(p.intro || p.descricao)}</p>` +
    `<nav><a href="/carros-turbo">Carros turbo</a> · <a href="/carros-aspirados">Carros aspirados</a> · ` +
    `<a href="/carros-originais">Carros originais</a> · <a href="/carros-de-pista">Carros de pista</a> · ` +
    `<a href="/anuncie-seu-carro">Vender meu carro</a></nav>`
  const jsonLd = p.rota === '/' ? null : { '@context': 'https://schema.org', '@type': 'WebPage', name: p.titulo, description: p.descricao, url: absoluto(p.rota) }
  gravar(p.rota, htmlDaPagina({ ...p, jsonLd, corpo }))
  urls.push({ loc: absoluto(p.rota === '/' ? '/' : p.rota), lastmod: hoje, changefreq: p.frequencia, priority: p.prioridade })
}

for (const rota of config.naoIndexar) {
  gravar(rota, htmlDaPagina({ rota, titulo: 'RaceMarketBR', descricao: config.site.descricaoPadrao, naoIndexar: true }))
}

const anuncios = await buscarAnuncios()
for (const l of anuncios) {
  const rota = `/anuncio/${l.id}`
  gravar(rota, htmlDaPagina({ rota, ...seoDoAnuncio(l) }))
  urls.push({
    loc: absoluto(rota),
    lastmod: (l.updated_at || hoje).slice(0, 10),
    changefreq: l.status === 'vendido' ? 'monthly' : 'weekly',
    priority: l.status === 'vendido' ? 0.3 : 0.7,
  })
}

// Endereços desconhecidos: o app mostra "Página não encontrada" com status 404 de verdade
fs.writeFileSync(
  path.join(dist, '404.html'),
  htmlDaPagina({ rota: '/404', titulo: 'Página não encontrada | RaceMarketBR', descricao: config.site.descricaoPadrao, naoIndexar: true }),
)

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${Number(u.priority).toFixed(1)}</priority></url>`)
    .join('\n') +
  '\n</urlset>\n'
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)

fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  ['User-agent: *', 'Allow: /', ...config.naoIndexar.map((r) => `Disallow: ${r}`), '', `Sitemap: ${SITE}/sitemap.xml`, ''].join('\n'),
)

console.log(`[prerender] ${config.paginas.length} páginas fixas, ${anuncios.length} anúncios, sitemap com ${urls.length} endereços.`)
