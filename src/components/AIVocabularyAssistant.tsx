import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import { aiService, type AITranslationResult } from '../lib/aiService'

interface AIVocabularyAssistantProps {
  onBack: () => void
}

export default function AIVocabularyAssistant({ onBack }: AIVocabularyAssistantProps) {
  const { currentLanguage, isInitialized } = useDatabaseContext()
  const [searchWord, setSearchWord] = useState('')
  const [translation, setTranslation] = useState<AITranslationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<AITranslationResult[]>([])

  if (!isInitialized || !currentLanguage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleTranslate = async () => {
    if (!searchWord.trim() || isLoading) return

    setIsLoading(true)
    try {
      const result = await aiService.translateWord(
        searchWord.trim(),
        currentLanguage.code,
        'en'
      )
      
      setTranslation(result)
      setRecentSearches(prev => {
        const updated = [result, ...prev.filter(r => r.word !== result.word)]
        return updated.slice(0, 10) // Keep last 10 searches
      })
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTranslate()
    }
  }

  const selectRecentSearch = (result: AITranslationResult) => {
    setSearchWord(result.word)
    setTranslation(result)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <span>←</span>
            <span>Back to Vocabulary</span>
          </button>
        </div>

        <div className="text-center">
          <div className="text-4xl mb-2">🤖📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Translation Assistant
          </h1>
          <p className="text-gray-600">
            Get instant translations and explanations for {currentLanguage.name} words
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Enter a ${currentLanguage.name} word to translate...`}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTranslate}
            disabled={!searchWord.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>

        {/* Translation Result */}
        {translation && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Word</h3>
                <p className="text-3xl font-bold text-blue-900 mb-2">{translation.word}</p>
                {translation.pronunciation && (
                  <p className="text-sm text-gray-600">Pronunciation: {translation.pronunciation}</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Translation</h3>
                <p className="text-2xl font-medium text-indigo-800 mb-2">{translation.translation}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${translation.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {Math.round(translation.confidence * 100)}% confident
                  </span>
                </div>
              </div>
            </div>
            
            {translation.example && (
              <div className="mt-6 pt-6 border-t border-white/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Example Usage</h3>
                <p className="text-gray-700 italic">{translation.example}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => selectRecentSearch(search)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{search.word}</div>
                <div className="text-sm text-gray-600">{search.translation}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {!translation && recentSearches.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              AI Translation Tips
            </h3>
            <div className="text-yellow-700 space-y-2">
              <p>• Enter any {currentLanguage.name} word to get instant translations</p>
              <p>• Get pronunciation guides and example sentences</p>
              <p>• See confidence levels for translation accuracy</p>
              <p>• Browse your recent searches for quick reference</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}