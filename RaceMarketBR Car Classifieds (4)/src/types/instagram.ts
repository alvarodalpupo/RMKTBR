
export interface InstagramPost {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  caption?: string
  permalink: string
  timestamp: string
  username?: string
}

export interface InstagramApiResponse {
  data: InstagramPost[]
  paging?: {
    cursors: {
      before: string
      after: string
    }
    next?: string
  }
}

export interface InstagramError {
  error: {
    message: string
    type: string
    code: number
  }
}

export interface InstagramStore {
  posts: InstagramPost[]
  isLoading: boolean
  error: string | null
  lastFetch: number | null
  fetchPosts: () => Promise<void>
  clearError: () => void
}
