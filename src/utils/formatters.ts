
export const formatarPreco = (valor: string): string => {
  // Remove tudo que não é número
  const numeroLimpo = valor.replace(/\D/g, '')
  
  if (!numeroLimpo) return ''
  
  // Converte para número e formata
  const numero = parseInt(numeroLimpo)
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero / 100)
}

export const extrairValorNumerico = (precoFormatado: string): number => {
  // Remove símbolos de moeda e converte para número
  const numeroLimpo = precoFormatado.replace(/[R$\s.]/g, '').replace(',', '.')
  return parseFloat(numeroLimpo) || 0
}

export const formatarTelefone = (valor: string): string => {
  // Remove tudo que não é número
  const numeroLimpo = valor.replace(/\D/g, '')
  
  if (numeroLimpo.length <= 2) return numeroLimpo
  if (numeroLimpo.length <= 7) return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2)}`
  if (numeroLimpo.length <= 11) {
    return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`
  }
  
  // Limita a 11 dígitos
  return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7, 11)}`
}

export const validarPreco = (preco: string): boolean => {
  const valor = extrairValorNumerico(preco)
  return valor > 0 && valor <= 10000000 // Máximo 10 milhões
}

export const validarTelefone = (telefone: string): boolean => {
  const numeroLimpo = telefone.replace(/\D/g, '')
  return numeroLimpo.length >= 10 && numeroLimpo.length <= 11
}
