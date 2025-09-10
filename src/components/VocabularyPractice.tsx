import { useState, useEffect } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import type { Vocabulary } from '../lib/database'

interface VocabularyPracticeProps {
  onBack: () => void
}

interface PracticeCard {
  vocabulary: Vocabulary
  isFlipped: boolean
}

export default function VocabularyPractice({ onBack }: VocabularyPracticeProps) {
  const { currentLanguage, getVocabularyByLanguage, isInitialized } = useDatabaseContext()
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [card, setCard] = useState<PracticeCard | null>(null)
  const [, setStudiedCards] = useState<Set<number>>(new Set())
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!currentLanguage) return
    
    const vocab = getVocabularyByLanguage(currentLanguage.id)
    const practiceableWords = vocab.filter(word => word.word.length > 1)
    
    if (practiceableWords.length > 0) {
      // Shuffle vocabulary for varied practice
      const shuffled = [...practiceableWords].sort(() => Math.random() - 0.5)
      setVocabulary(shuffled)
      setCard({
        vocabulary: shuffled[0],
        isFlipped: false
      })
    }
  }, [currentLanguage, getVocabularyByLanguage])

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

  if (vocabulary.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vocabulary to practice yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload some {currentLanguage.name} songs to build your vocabulary bank!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Vocabulary
            </button>
          </div>
        </div>
      </div>
    )
  }

  const flipCard = () => {
    if (card) {
      setCard({ ...card, isFlipped: !card.isFlipped })
    }
  }

  const markCorrect = () => {
    if (card) {
      setCorrectAnswers(prev => prev + 1)
      setStudiedCards(prev => new Set([...prev, card.vocabulary.id]))
      nextCard()
    }
  }

  const markIncorrect = () => {
    if (card) {
      setStudiedCards(prev => new Set([...prev, card.vocabulary.id]))
      nextCard()
    }
  }

  const nextCard = () => {
    if (currentCardIndex < vocabulary.length - 1) {
      const nextIndex = currentCardIndex + 1
      setCurrentCardIndex(nextIndex)
      setCard({
        vocabulary: vocabulary[nextIndex],
        isFlipped: false
      })
    } else {
      setShowResults(true)
    }
  }

  const restartPractice = () => {
    setCurrentCardIndex(0)
    setStudiedCards(new Set())
    setCorrectAnswers(0)
    setShowResults(false)
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
    setVocabulary(shuffled)
    setCard({
      vocabulary: shuffled[0],
      isFlipped: false
    })
  }

  if (showResults) {
    const percentage = Math.round((correctAnswers / vocabulary.length) * 100)
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl shadow-2xl p-8 border-4 border-yellow-200">
          <div className="text-center py-12">
            <div className="text-8xl mb-6 animate-bounce">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Practice Complete!
            </h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 text-center transform hover:scale-105 transition-transform shadow-lg">
                <div className="text-4xl font-bold text-blue-700">{vocabulary.length}</div>
                <div className="text-sm font-semibold text-blue-600 mt-2">Total Cards</div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 text-center transform hover:scale-105 transition-transform shadow-lg">
                <div className="text-4xl font-bold text-green-700">{correctAnswers}</div>
                <div className="text-sm font-semibold text-green-600 mt-2">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 text-center transform hover:scale-105 transition-transform shadow-lg">
                <div className="text-4xl font-bold text-purple-700">{percentage}%</div>
                <div className="text-sm font-semibold text-purple-600 mt-2">Score</div>
              </div>
            </div>
            <div className="space-x-6">
              <button
                onClick={restartPractice}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-blue-500/50"
              >
                🔄 Practice Again
              </button>
              <button
                onClick={onBack}
                className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transform hover:scale-110 transition-all duration-200 font-bold text-lg shadow-xl"
              >
                ← Back to Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!card) return null

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
          <div className="text-sm text-gray-600">
            {currentCardIndex + 1} of {vocabulary.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentCardIndex + 1) / vocabulary.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vocabulary Practice - {currentLanguage.name}
          </h2>
          
          <div
            onClick={flipCard}
            className={`relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-12 cursor-pointer hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 min-h-[300px] flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${card.isFlipped ? 'animate-pulse' : ''}`}
          >
            {!card.isFlipped ? (
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 mb-4">
                  {card.vocabulary.word}
                </p>
                <p className="text-gray-600">
                  Click to reveal translation
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Appears {card.vocabulary.frequency_count} time{card.vocabulary.frequency_count > 1 ? 's' : ''} in songs
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-3xl font-medium text-indigo-800 mb-4">
                  {card.vocabulary.translation || 'No translation available'}
                </p>
                <p className="text-gray-600 mb-4">
                  Did you know this word?
                </p>
                <div className="space-x-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markCorrect()
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-110 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-green-500/50"
                  >
                    ✓ I knew it!
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markIncorrect()
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transform hover:scale-110 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-red-500/50"
                  >
                    ✗ I need practice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {card.isFlipped ? 'Mark your answer above' : 'Click the card to see the translation'}
          </p>
        </div>
      </div>
    </div>
  )
}