
import { InstagramPost } from '../types/instagram'

export const formatInstagramDate = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMilliseconds = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  } else if (diffInHours < 24) {
    return `${diffInHours}h`
  } else if (diffInDays < 7) {
    return `${diffInDays}d`
  } else {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }
}

export const truncateCaption = (caption: string, maxLength: number = 100): string => {
  if (!caption) return ''
  
  // Remover hashtags do final para melhor apresentação
  const cleanCaption = caption.replace(/#\w+/g, '').trim()
  
  if (cleanCaption.length <= maxLength) return cleanCaption
  
  // Truncar no último espaço antes do limite
  const truncated = cleanCaption.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...'
}

export const extractHashtags = (caption: string): string[] => {
  if (!caption) return []
  
  const hashtags = caption.match(/#\w+/g)
  return hashtags ? hashtags.map(tag => tag.substring(1)) : []
}

export const isValidInstagramUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com'
  } catch {
    return false
  }
}

export const generateMockEngagement = () => {
  return {
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 50) + 5
  }
}

export const filterValidPosts = (posts: InstagramPost[]): InstagramPost[] => {
  return posts.filter(post => 
    post.media_url && 
    post.id && 
    post.permalink &&
    isValidInstagramUrl(post.permalink) &&
    (post.media_type === 'IMAGE' || post.media_type === 'VIDEO')
  )
}

export const sortPostsByDate = (posts: InstagramPost[]): InstagramPost[] => {
  return [...posts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}
