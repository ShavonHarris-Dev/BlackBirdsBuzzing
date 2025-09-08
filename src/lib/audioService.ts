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
    // Mock YouTube search results - in production, use YouTube API
    const mockResults: YouTubeSearchResult[] = [
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockResults
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
        
        await this.currentAudio.load()
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