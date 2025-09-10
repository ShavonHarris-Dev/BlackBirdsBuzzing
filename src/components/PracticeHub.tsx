import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import VocabularyPractice from './VocabularyPractice'
import AIConversation from './AIConversation'
import WritingPractice from './WritingPractice'
import SongReview from './SongReview'

type PracticeMode = 'hub' | 'vocabulary' | 'ai-conversation' | 'writing' | 'song-review'

export default function PracticeHub() {
  const { currentLanguage, getVocabularyByLanguage, getSongsByLanguage, getUserProgress, isInitialized } = useDatabaseContext()
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
  const completedSongs = songs.filter(song => {
    const progress = getUserProgress(song.id)
    return progress && progress.completed
  })

  if (currentMode === 'vocabulary') {
    return <VocabularyPractice onBack={() => setCurrentMode('hub')} />
  }

  if (currentMode === 'ai-conversation') {
    return <AIConversation onBack={() => setCurrentMode('hub')} />
  }

  if (currentMode === 'writing') {
    return <WritingPractice onBack={() => setCurrentMode('hub')} />
  }

  if (currentMode === 'song-review') {
    return <SongReview onBack={() => setCurrentMode('hub')} />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
          Practice {currentLanguage.name}
        </h1>
        <p className="text-white/90 text-lg">
          Choose a practice mode to level up your language skills! 🚀
        </p>
        <div className="flex justify-center mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 border border-white/30">
            <span className="text-white font-semibold">
              {vocabulary.length + songs.length} learning resources available
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vocabulary Practice */}
        <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Vocabulary Flashcards
              </h3>
              <p className="text-gray-700 mb-4">
                Test your knowledge with flashcard practice
              </p>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-blue-300">
                <div className="text-3xl font-bold text-blue-600">{vocabulary.length}</div>
                <div className="text-sm text-gray-700 font-medium">words available</div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentMode('vocabulary')}
              disabled={vocabulary.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-blue-500/25"
            >
              {vocabulary.length > 0 ? '🚀 Start Vocabulary Practice' : 'No vocabulary yet'}
            </button>
          </div>
        </div>

        {/* Song Review */}
        <div className="group bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 transform group-hover:rotate-12 transition-transform duration-300">🎵</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Song Review
              </h3>
              <p className="text-gray-700 mb-4">
                Review lyrics line by line from your learned songs
              </p>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-green-300">
                <div className="text-3xl font-bold text-green-600">{completedSongs.length}</div>
                <div className="text-sm text-gray-700 font-medium">songs available</div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentMode('song-review')}
              disabled={completedSongs.length === 0}
              className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-green-500/25"
            >
              {completedSongs.length > 0 ? '🎤 Start Song Review' : 'Complete songs first'}
            </button>
          </div>
        </div>

        {/* Writing Practice */}
        <div className="group bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">✍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Writing Practice
              </h3>
              <p className="text-gray-700 mb-4">
                Create sentences using your learned vocabulary
              </p>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-300">
                <div className="text-3xl font-bold text-purple-600">
                  {vocabulary.filter(w => w.frequency_count >= 2 && w.translation && w.translation.trim() !== '').length}
                </div>
                <div className="text-sm text-gray-700 font-medium">words with translations</div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentMode('writing')}
              disabled={vocabulary.filter(w => w.frequency_count >= 2 && w.translation && w.translation.trim() !== '').length === 0}
              className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-purple-500/25"
            >
              {vocabulary.filter(w => w.frequency_count >= 2 && w.translation && w.translation.trim() !== '').length > 0 ? '📝 Start Writing Practice' : 'Need vocabulary first'}
            </button>
          </div>
        </div>

        {/* AI Conversation */}
        <div className="group bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-orange-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 transform group-hover:bounce transition-transform duration-500">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Conversation
              </h3>
              <p className="text-gray-700 mb-4">
                Practice conversations with an AI tutor using your vocabulary
              </p>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-orange-300">
                <div className="text-3xl font-bold text-orange-600">{vocabulary.length}</div>
                <div className="text-sm text-gray-700 font-medium">words ready for chat</div>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentMode('ai-conversation')}
              disabled={vocabulary.length === 0}
              className="w-full py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-orange-500/25"
            >
              {vocabulary.length > 0 ? '💬 Start AI Conversation' : 'Need vocabulary first'}
            </button>
          </div>
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