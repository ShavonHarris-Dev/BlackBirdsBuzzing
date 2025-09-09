// Translation service using free APIs with Korean optimization

export interface TranslationResult {
  word: string
  translation: string
  pronunciation?: string
  partOfSpeech?: string
  example?: string
  confidence: number
}


class TranslationService {
  private cache = new Map<string, TranslationResult>()
  
  // Language code mapping for Wiktionary
  private getWiktionaryLangCode(langCode: string): string {
    const mapping: Record<string, string> = {
      'ko': 'Korean',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'hi': 'Hindi',
      'ar': 'Arabic'
    }
    return mapping[langCode] || 'Korean'
  }

  async translateWord(word: string, fromLanguage: string): Promise<TranslationResult> {
    const cacheKey = `${word.toLowerCase()}-${fromLanguage}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Check if this is a full sentence (has spaces) or single word
      const isFullSentence = word.trim().includes(' ') && word.length > 10
      
      if (isFullSentence) {
        // Use MyMemory for full sentence translation
        const result = await this.fetchFromMyMemory(word, fromLanguage)
        this.cache.set(cacheKey, result)
        return result
      }

      // Single word - try Wiktionary first
      const result = await this.fetchFromWiktionary(word, fromLanguage)
      
      if (result.confidence > 0.5) {
        this.cache.set(cacheKey, result)
        return result
      }

      // Fallback to MyMemory API for better coverage
      const fallbackResult = await this.fetchFromMyMemory(word, fromLanguage)
      this.cache.set(cacheKey, fallbackResult)
      return fallbackResult

    } catch (error) {
      console.error('Translation failed:', error)
      
      // Final fallback - simple mock with indication it's not real
      const mockResult: TranslationResult = {
        word,
        translation: `[${word}]`,
        confidence: 0.1
      }
      
      return mockResult
    }
  }

  private async fetchFromWiktionary(word: string, fromLanguage: string): Promise<TranslationResult> {
    const langName = this.getWiktionaryLangCode(fromLanguage)
    
    // Use English Wiktionary API - it has the best coverage
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Wiktionary API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Parse Wiktionary response
      const translation = this.parseWiktionaryResponse(data, langName)
      
      return {
        word,
        translation: translation || word,
        confidence: translation ? 0.8 : 0.3
      }
      
    } catch (error) {
      // Try alternative Wiktionary endpoint
      return this.fetchFromWiktionaryParse(word, fromLanguage)
    }
  }

  private async fetchFromWiktionaryParse(word: string, fromLanguage: string): Promise<TranslationResult> {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      // Look for definitions
      if (data && data[fromLanguage]) {
        const definitions = data[fromLanguage]
        if (definitions.length > 0 && definitions[0].definitions) {
          const firstDef = definitions[0].definitions[0]
          return {
            word,
            translation: this.cleanDefinition(firstDef),
            partOfSpeech: definitions[0].partOfSpeech,
            confidence: 0.7
          }
        }
      }
      
      throw new Error('No definition found')
    } catch (error) {
      throw error
    }
  }

  private async fetchFromMyMemory(word: string, fromLanguage: string): Promise<TranslationResult> {
    const langMap: Record<string, string> = {
      'ko': 'ko-KR',
      'es': 'es-ES',
      'fr': 'fr-FR', 
      'de': 'de-DE',
      'ja': 'ja-JP',
      'it': 'it-IT'
    }
    
    const sourceLang = langMap[fromLanguage] || 'ko-KR'
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|en-US`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translation = data.responseData.translatedText
        
        // Filter out poor quality translations
        if (translation.toLowerCase() === word.toLowerCase() || 
            translation.includes('[')) {
          throw new Error('Poor quality translation')
        }
        
        return {
          word,
          translation: this.cleanTranslation(translation),
          confidence: 0.6
        }
      }
      
      throw new Error('MyMemory API failed')
    } catch (error) {
      throw error
    }
  }

  private parseWiktionaryResponse(data: any, _targetLanguage: string): string | null {
    try {
      // Try to extract translation from various Wiktionary formats
      if (data && typeof data === 'object') {
        // Look for translations section
        const text = JSON.stringify(data).toLowerCase()
        
        // Simple pattern matching for common translation patterns
        const patterns = [
          /translation[s]?[:\s]+([^.,;]+)/i,
          /english[:\s]+([^.,;]+)/i,
          /meaning[:\s]+([^.,;]+)/i
        ]
        
        for (const pattern of patterns) {
          const match = text.match(pattern)
          if (match && match[1]) {
            return this.cleanTranslation(match[1])
          }
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  private cleanDefinition(definition: string): string {
    return definition
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove wiki links
      .replace(/\{\{[^}]+\}\}/g, '') // Remove templates
      .replace(/\([^)]*\)/g, '') // Remove parenthetical notes
      .trim()
      .split('.')[0] // Take first sentence only
      .substring(0, 100) // Limit length
  }

  private cleanTranslation(translation: string): string {
    return translation
      .replace(/[[\]{}]/g, '') // Remove brackets
      .trim()
      .split(',')[0] // Take first meaning
      .substring(0, 50) // Limit length
  }

  // For Korean specifically - handle romanization
  async translateKoreanWord(hangul: string): Promise<TranslationResult> {
    try {
      // First try the general translation
      const result = await this.translateWord(hangul, 'ko')
      
      if (result.confidence > 0.5) {
        return result
      }
      
      // Korean-specific fallback using Naver Dictionary (if we implement it)
      return this.fetchKoreanSpecific(hangul)
      
    } catch (error) {
      return this.translateWord(hangul, 'ko')
    }
  }

  private async fetchKoreanSpecific(word: string): Promise<TranslationResult> {
    // Placeholder for Korean-specific dictionary
    // Could integrate with:
    // - TOPIK word lists
    // - Korean Wiktionary
    // - Naver Dictionary API
    
    return {
      word,
      translation: `[Korean: ${word}]`,
      confidence: 0.2
    }
  }

  // Get cached translations count (for debugging)
  getCacheSize(): number {
    return this.cache.size
  }

  // Clear cache (for memory management)
  clearCache(): void {
    this.cache.clear()
  }
}

export const translationService = new TranslationService()