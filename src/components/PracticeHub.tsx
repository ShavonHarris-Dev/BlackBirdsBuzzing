import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import VocabularyPractice from './VocabularyPractice'
import AIConversation from './AIConversation'

type PracticeMode = 'hub' | 'vocabulary' | 'ai-conversation' | 'writing' | 'listening'

export default function PracticeHub() {
  const { currentLanguage, getVocabularyByLanguage, getSongsByLanguage, isInitialized } = useDatabaseContext()
  const [currentMode, setCurrentMode] = useState<PracticeMode>('hub')

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

  const vocabulary = getVocabularyByLanguage(currentLanguage.id)
  const songs = getSongsByLanguage(currentLanguage.id)

  if (currentMode === 'vocabulary') {
    return <VocabularyPractice onBack={() => setCurrentMode('hub')} />
  }

  if (currentMode === 'ai-conversation') {
    return <AIConversation onBack={() => setCurrentMode('hub')} />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Practice {currentLanguage.name}
        </h1>
        <p className="text-gray-600">
          Choose a practice mode to improve your language skills
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vocabulary Practice */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Vocabulary Flashcards
            </h3>
            <p className="text-gray-600 mb-4">
              Test your knowledge with flashcard practice
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-2xl font-bold text-blue-600">{vocabulary.length}</div>
              <div className="text-sm text-gray-600">words available</div>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentMode('vocabulary')}
            disabled={vocabulary.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {vocabulary.length > 0 ? 'Start Vocabulary Practice' : 'No vocabulary yet'}
          </button>
        </div>

        {/* Song Review */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Song Review
            </h3>
            <p className="text-gray-600 mb-4">
              Review lyrics line by line from your learned songs
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-2xl font-bold text-green-600">{songs.length}</div>
              <div className="text-sm text-gray-600">songs available</div>
            </div>
          </div>
          
          <button
            disabled
            className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* Writing Practice */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Writing Practice
            </h3>
            <p className="text-gray-600 mb-4">
              Create sentences using your learned vocabulary
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-2xl font-bold text-purple-600">
                {vocabulary.filter(w => w.frequency_count >= 2).length}
              </div>
              <div className="text-sm text-gray-600">frequent words</div>
            </div>
          </div>
          
          <button
            disabled
            className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* AI Conversation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Conversation
            </h3>
            <p className="text-gray-600 mb-4">
              Practice conversations with an AI tutor using your vocabulary
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-2xl font-bold text-orange-600">{vocabulary.length}</div>
              <div className="text-sm text-gray-600">words ready for chat</div>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentMode('ai-conversation')}
            disabled={vocabulary.length === 0}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {vocabulary.length > 0 ? 'Start AI Conversation' : 'Need vocabulary first'}
          </button>
        </div>
      </div>

      {vocabulary.length === 0 && songs.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <div className="text-center">
            <div className="text-4xl mb-2">💡</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Get Started with Practice
            </h3>
            <p className="text-yellow-700">
              Upload some {currentLanguage.name} songs first to build your vocabulary and enable practice modes!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}