import { useState } from 'react'
import { translationService } from '../lib/translationService'

interface TranslatableLineProps {
  text: string
  fromLanguage: string
  className?: string
}

interface WordTranslation {
  word: string
  translation: string
  loading: boolean
}

export default function TranslatableLine({ text, fromLanguage, className = '' }: TranslatableLineProps) {
  const [wordTranslations, setWordTranslations] = useState<Map<string, WordTranslation>>(new Map())
  const [showLineTranslation, setShowLineTranslation] = useState(false)
  const [lineTranslation, setLineTranslation] = useState<string>('')
  const [loadingLineTranslation, setLoadingLineTranslation] = useState(false)

  // Split text into words while preserving punctuation
  const tokenizeText = (text: string): Array<{ word: string; isWord: boolean }> => {
    return text.split(/(\s+|[^\w\s'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿāēīōūăĕĭŏŭąęųįų]+)/g)
      .filter(token => token.length > 0)
      .map(token => ({
        word: token,
        isWord: /\w/.test(token) && token.trim().length > 1
      }))
  }

  const handleWordHover = async (word: string) => {
    const cleanWord = word.toLowerCase().trim()
    
    if (wordTranslations.has(cleanWord) || !cleanWord || cleanWord.length < 2) {
      return
    }

    // Set loading state
    setWordTranslations(prev => new Map(prev).set(cleanWord, {
      word: cleanWord,
      translation: '',
      loading: true
    }))

    try {
      const result = await translationService.translateWord(cleanWord, fromLanguage)
      setWordTranslations(prev => new Map(prev).set(cleanWord, {
        word: cleanWord,
        translation: result.translation,
        loading: false
      }))
    } catch (error) {
      console.error('Translation failed:', error)
      setWordTranslations(prev => new Map(prev).set(cleanWord, {
        word: cleanWord,
        translation: 'Translation unavailable',
        loading: false
      }))
    }
  }

  const handleLineTranslation = async () => {
    if (lineTranslation) {
      setShowLineTranslation(!showLineTranslation)
      return
    }

    setLoadingLineTranslation(true)
    try {
      const result = await translationService.translateWord(text, fromLanguage)
      setLineTranslation(result.translation)
      setShowLineTranslation(true)
    } catch (error) {
      console.error('Line translation failed:', error)
      setLineTranslation('Translation unavailable')
      setShowLineTranslation(true)
    } finally {
      setLoadingLineTranslation(false)
    }
  }

  const tokens = tokenizeText(text)

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main line with hoverable words */}
      <div className="leading-relaxed">
        {tokens.map((token, index) => {
          if (!token.isWord) {
            return <span key={index}>{token.word}</span>
          }

          const cleanWord = token.word.toLowerCase().trim()
          const translation = wordTranslations.get(cleanWord)

          return (
            <span key={index} className="relative inline-block group">
              <span
                className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 px-1 py-0.5 rounded transition-colors relative"
                onMouseEnter={() => handleWordHover(token.word)}
              >
                {token.word}
                
                {/* Tooltip */}
                {translation && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                    {translation.loading ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>...</span>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{translation.translation}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </>
                    )}
                  </div>
                )}
              </span>
            </span>
          )
        })}
      </div>

      {/* Line translation toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleLineTranslation}
          disabled={loadingLineTranslation}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 flex items-center space-x-1"
        >
          {loadingLineTranslation ? (
            <>
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Translating...</span>
            </>
          ) : (
            <>
              <span>🌐</span>
              <span>{showLineTranslation ? 'Hide' : 'Show'} full translation</span>
            </>
          )}
        </button>
      </div>

      {/* Full line translation */}
      {showLineTranslation && lineTranslation && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
          <div className="text-sm text-blue-800 font-medium">Translation:</div>
          <div className="text-blue-900 italic mt-1">{lineTranslation}</div>
        </div>
      )}
    </div>
  )
}