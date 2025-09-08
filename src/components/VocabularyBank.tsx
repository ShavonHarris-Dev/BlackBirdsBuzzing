import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import VocabularyPractice from './VocabularyPractice'
import AIVocabularyAssistant from './AIVocabularyAssistant'

export default function VocabularyBank() {
  const { currentLanguage, getVocabularyByLanguage, isInitialized } = useDatabaseContext()
  const [showPractice, setShowPractice] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  if (!isInitialized || !currentLanguage) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const vocabulary = getVocabularyByLanguage(currentLanguage.id)
  
  const frequentWords = vocabulary.filter(word => word.frequency_count >= 2)
  const allWords = vocabulary

  if (showPractice) {
    return <VocabularyPractice onBack={() => setShowPractice(false)} />
  }

  if (showAIAssistant) {
    return <AIVocabularyAssistant onBack={() => setShowAIAssistant(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Frequent Words Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            🌟 Frequent Words ({frequentWords.length})
          </h2>
          <p className="text-sm text-gray-600">
            Words that appear 2+ times across songs
          </p>
        </div>
        
        {frequentWords.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frequentWords.map((word) => (
              <div key={word.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">{word.word}</span>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    {word.frequency_count}x
                  </span>
                </div>
                <p className="text-gray-700 mb-2">
                  {word.translation || 'No translation yet'}
                </p>
                <div className="text-xs text-gray-600">
                  Added: {new Date(word.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No frequent words yet. Keep learning songs to build your vocabulary bank!
          </p>
        )}
      </div>

      {/* All Words Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            📚 All Vocabulary ({allWords.length})
          </h2>
          <div className="space-x-2">
            <button 
              onClick={() => setShowAIAssistant(true)}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              🤖 AI Translate
            </button>
            <button 
              onClick={() => setShowPractice(true)}
              disabled={allWords.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Practice All ({allWords.length})
            </button>
          </div>
        </div>
        
        {allWords.length > 0 ? (
          <div className="space-y-2">
            {allWords.map((word) => (
              <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-medium text-gray-900">{word.word}</span>
                    <span className="text-gray-600">
                      {word.translation || 'No translation yet'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Added: {new Date(word.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    {word.frequency_count}x
                  </span>
                  <button 
                    onClick={() => setShowPractice(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No vocabulary yet. Upload some songs to start building your {currentLanguage.name} vocabulary!
          </p>
        )}
      </div>
    </div>
  )
}