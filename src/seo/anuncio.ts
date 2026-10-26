import type { Listing } from '../stores/listingsStore'
import { extrairValorNumerico } from '../utils/formatters'

const CATEGORIA: Record<Listing['categoria'], string> = {
  turbo: 'turbo',
  aspirado: 'aspirado',
  original: 'original',
  pista: 'de pista',
}

/**
 * Título, descrição e dados estruturados (schema.org/Car) de um anúncio.
 * A mesma regra existe em scripts/prerender.mjs, que gera o HTML de cada
 * anúncio para o Google; mantenha os dois iguais.
 */
export function seoDoAnuncio(l: Listing | undefined) {
  if (!l) return { titulo: undefined, descricao: undefined, imagem: undefined, jsonLd: null }

  const vendido = l.status === 'vendido'
  const potencia = l.power_whp ? `${l.power_whp} whp` : ''
  const torque = l.torque_kgfm ? `${l.torque_kgfm} kgfm` : ''
  const ficha = [potencia, torque].filter(Boolean).join(', ')

  const titulo = vendido
    ? `${l.titulo} ${l.ano} (vendido) | RaceMarketBR`
    : `${l.titulo} ${l.ano} à venda em ${l.cidade}-${l.uf} — ${l.preco} | RaceMarketBR`

  const descricao = (
    vendido
      ? `${l.titulo} ${l.ano}, carro ${CATEGORIA[l.categoria]} vendido pelo RaceMarketBR em ${l.cidade}-${l.uf}.`
      : `${l.titulo} ${l.ano}, carro ${CATEGORIA[l.categoria]} à venda em ${l.cidade}-${l.uf} por ${l.preco}.` +
        (ficha ? ` ${ficha}.` : '') +
        (l.aceita_troca ? ' Aceita troca.' : '') +
        ' Fale com o dono pelo WhatsApp.'
  ).slice(0, 300)

  const url = `https://racemarketbr.com.br/anuncio/${l.id}`
  const preco = extrairValorNumerico(l.preco)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${l.titulo} ${l.ano}`,
    description: l.descricao || descricao,
    url,
    image: l.images.filter((i) => i.startsWith('http')).slice(0, 5),
    vehicleModelDate: String(l.ano),
    ...(l.tracao ? { driveWheelConfiguration: { dianteira: 'FrontWheelDriveConfiguration', traseira: 'RearWheelDriveConfiguration', integral: 'AllWheelDriveConfiguration' }[l.tracao] } : {}),
    ...(l.power_whp ? { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: l.power_whp, unitText: 'whp' } } } : {}),
    ...(!vendido && preco > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: preco,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url,
            areaServed: `${l.cidade}, ${l.uf}`,
          },
        }
      : {}),
  }

  return { titulo, descricao, imagem: l.images.find((i) => i.startsWith('http')), jsonLd }
}
