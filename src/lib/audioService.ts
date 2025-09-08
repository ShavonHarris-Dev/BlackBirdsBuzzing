// Audio service for song playback and YouTube integration

export interface AudioTrack {
  id: string
  title: string
  artist: string
  url: string
  duration?: number
  type: 'file' | 'youtube' | 'url'
}

export interface YouTubeSearchResult {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration: string
  viewCount?: string
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null
  private isPlaying = false
  private currentTrack: AudioTrack | null = null
  private listeners: Set<(isPlaying: boolean, currentTime: number) => void> = new Set()

  async searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
    
    if (!apiKey) {
      console.warn('YouTube API key not configured, using mock data')
      return this.getMockResults(query)
    }

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` + new URLSearchParams({
        part: 'snippet',
        q: query,
        key: apiKey,
        type: 'video',
        maxResults: '6',
        safeSearch: 'moderate',
        videoEmbeddable: 'true',
        fields: 'items(id(videoId),snippet(title,channelTitle,thumbnails(medium(url))))'
      })

      const response = await fetch(searchUrl)
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Get video details for duration and view count
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',')
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` + new URLSearchParams({
        part: 'contentDetails,statistics',
        id: videoIds,
        key: apiKey,
        fields: 'items(id,contentDetails(duration),statistics(viewCount))'
      })

      const detailsResponse = await fetch(detailsUrl)
      const detailsData = await detailsResponse.json()
      const videoDetails = new Map()
      
      detailsData.items?.forEach((item: any) => {
        videoDetails.set(item.id, {
          duration: this.formatDuration(item.contentDetails.duration),
          viewCount: this.formatViewCount(item.statistics.viewCount)
        })
      })

      return data.items.map((item: any) => {
        const details = videoDetails.get(item.id.videoId) || { duration: 'N/A', viewCount: '' }
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || '/placeholder-music.jpg',
          duration: details.duration,
          viewCount: details.viewCount
        }
      })
    } catch (error) {
      console.error('YouTube search failed:', error)
      return this.getMockResults(query)
    }
  }

  private getMockResults(query: string): YouTubeSearchResult[] {
    return [
      {
        id: 'mock1',
        title: `${query} - Official Music Video`,
        channelTitle: 'Official Artist',
        thumbnail: '/placeholder-music.jpg',
        duration: '3:45',
        viewCount: '1.2M views'
      },
      {
        id: 'mock2', 
        title: `${query} (Audio)`,
        channelTitle: 'Music Channel',
        thumbnail: '/placeholder-music.jpg',
        duration: '3:32',
        viewCount: '850K views'
      },
      {
        id: 'mock3',
        title: `${query} - Karaoke Version`,
        channelTitle: 'Karaoke Master',
        thumbnail: '/placeholder-music.jpg',
        duration: '3:41',
        viewCount: '320K views'
      }
    ]
  }

  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return 'N/A'
    
    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private formatViewCount(count: string): string {
    const num = parseInt(count)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`
    }
    return `${num} views`
  }

  async loadTrack(track: AudioTrack): Promise<boolean> {
    try {
      this.stop() // Stop any current playback
      
      if (track.type === 'youtube') {
        // In production, you'd use YouTube iframe API or similar
        console.log('YouTube playback would start here:', track.id)
        this.currentTrack = track
        return true
      }
      
      if (track.type === 'file' || track.type === 'url') {
        this.currentAudio = new Audio(track.url)
        this.currentAudio.addEventListener('timeupdate', this.handleTimeUpdate.bind(this))
        this.currentAudio.addEventListener('ended', this.handleEnded.bind(this))
        this.currentAudio.addEventListener('error', this.handleError.bind(this))
        
        this.currentAudio.load()
        this.currentTrack = track
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to load audio track:', error)
      return false
    }
  }

  async play(): Promise<boolean> {
    if (!this.currentAudio) return false
    
    try {
      await this.currentAudio.play()
      this.isPlaying = true
      this.notifyListeners()
      return true
    } catch (error) {
      console.error('Failed to play audio:', error)
      return false
    }
  }

  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.isPlaying = false
      this.notifyListeners()
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.isPlaying = false
      this.notifyListeners()
    }
  }

  seekTo(timeInSeconds: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = timeInSeconds
    }
  }

  getCurrentTime(): number {
    return this.currentAudio?.currentTime || 0
  }

  getDuration(): number {
    return this.currentAudio?.duration || 0
  }

  getVolume(): number {
    return this.currentAudio?.volume || 1
  }

  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack
  }

  addListener(callback: (isPlaying: boolean, currentTime: number) => void): void {
    this.listeners.add(callback)
  }

  removeListener(callback: (isPlaying: boolean, currentTime: number) => void): void {
    this.listeners.delete(callback)
  }

  private handleTimeUpdate(): void {
    this.notifyListeners()
  }

  private handleEnded(): void {
    this.isPlaying = false
    this.notifyListeners()
  }

  private handleError(error: Event): void {
    console.error('Audio playback error:', error)
    this.isPlaying = false
    this.notifyListeners()
  }

  private notifyListeners(): void {
    const currentTime = this.getCurrentTime()
    this.listeners.forEach(callback => callback(this.isPlaying, currentTime))
  }

  // Text-to-Speech for pronunciation help
  async speakText(text: string, languageCode: string = 'en'): Promise<void> {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = this.mapLanguageCodeToSpeechLang(languageCode)
      utterance.rate = 0.8
      utterance.pitch = 1
      
      speechSynthesis.speak(utterance)
    }
  }

  private mapLanguageCodeToSpeechLang(code: string): string {
    const langMap: Record<string, string> = {
      'ko': 'ko-KR',
      'es': 'es-ES', 
      'fr': 'fr-FR',
      'ja': 'ja-JP',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'zh': 'zh-CN',
      'hi': 'hi-IN',
      'ar': 'ar-SA'
    }
    return langMap[code] || 'en-US'
  }

  dispose(): void {
    this.stop()
    if (this.currentAudio) {
      this.currentAudio.removeEventListener('timeupdate', this.handleTimeUpdate.bind(this))
      this.currentAudio.removeEventListener('ended', this.handleEnded.bind(this))
      this.currentAudio.removeEventListener('error', this.handleError.bind(this))
      this.currentAudio = null
    }
    this.listeners.clear()
  }
}

export const audioService = new AudioService()