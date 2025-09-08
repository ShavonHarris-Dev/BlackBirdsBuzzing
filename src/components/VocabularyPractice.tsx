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
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Practice Complete!
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{vocabulary.length}</div>
                  <div className="text-sm text-gray-600">Total Cards</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={restartPractice}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Practice Again
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Back to Vocabulary
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
            className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-12 cursor-pointer hover:from-blue-100 hover:to-indigo-200 transition-all min-h-[300px] flex items-center justify-center"
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
                <div className="space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markCorrect()
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✓ I knew it
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markIncorrect()
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ✗ I didn't know
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