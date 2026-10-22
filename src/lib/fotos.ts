import { supabase, FOTOS_BUCKET } from './supabase'

const LADO_MAXIMO = 1600
const QUALIDADE = 0.85

/**
 * Reduz a foto para no máximo 1600px no lado maior e converte para WebP
 * (fica bem abaixo do limite de 5 MB do bucket e carrega rápido no celular).
 */
export async function prepararFoto(dataUrl: string): Promise<Blob> {
  const img = new Image()
  img.decoding = 'async'
  img.src = dataUrl
  await img.decode()

  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * escala)
  canvas.height = Math.round(img.naturalHeight * escala)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALIDADE))
  if (blob) return blob
  // Navegador sem WebP: JPEG
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Não foi possível ler a foto'))), 'image/jpeg', QUALIDADE),
  )
}

/**
 * Envia as fotos para o Supabase Storage e devolve as URLs públicas.
 * Fotos que já são URLs (anúncio sendo editado) passam direto.
 */
export async function enviarFotos(imagens: string[], userId: string | null): Promise<string[]> {
  if (!supabase) return imagens
  const pasta = userId ?? 'visitantes'
  const urls: string[] = []

  for (const imagem of imagens) {
    if (!imagem.startsWith('data:')) {
      urls.push(imagem)
      continue
    }
    const blob = await prepararFoto(imagem)
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    const caminho = `${pasta}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(FOTOS_BUCKET).upload(caminho, blob, {
      contentType: blob.type,
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) throw error
    urls.push(supabase.storage.from(FOTOS_BUCKET).getPublicUrl(caminho).data.publicUrl)
  }
  return urls
}

/** Apaga do Storage as fotos que pertencem ao bucket (melhor esforço). */
export async function apagarFotos(urls: string[]): Promise<void> {
  if (!supabase) return
  const marcador = `/storage/v1/object/public/${FOTOS_BUCKET}/`
  const caminhos = urls
    .map((u) => (u.includes(marcador) ? decodeURIComponent(u.split(marcador)[1]) : null))
    .filter((c): c is string => !!c)
  if (caminhos.length) await supabase.storage.from(FOTOS_BUCKET).remove(caminhos)
}
