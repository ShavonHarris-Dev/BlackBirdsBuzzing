import { useState, useEffect } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'

interface WritingPracticeProps {
  onBack: () => void
}

interface WritingExercise {
  id: number
  prompt: string
  targetWords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function WritingPractice({ onBack }: WritingPracticeProps) {
  const { currentLanguage, getVocabularyByLanguage, isInitialized } = useDatabaseContext()
  const [frequentWords, setFrequentWords] = useState<string[]>([])
  const [currentExercise, setCurrentExercise] = useState<WritingExercise | null>(null)
  const [userText, setUserText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    if (!currentLanguage) return
    
    const vocabulary = getVocabularyByLanguage(currentLanguage.id)
    // Use vocabulary that appears more than once and has translations
    const practicableWords = vocabulary
      .filter(word => word.frequency_count >= 2 && word.translation && word.translation.trim() !== '')
      .sort((a, b) => b.frequency_count - a.frequency_count) // Sort by most frequent first
      .map(word => word.word)
      .slice(0, 20)
    
    setFrequentWords(practicableWords)
    
    if (practicableWords.length > 0) {
      generateExercise(practicableWords)
    }
  }, [currentLanguage, getVocabularyByLanguage])

  const generateExercise = (words: string[]) => {
    if (words.length === 0) return

    const selectedWords = words.slice(0, Math.min(3, words.length))
    const exercises: WritingExercise[] = [
      {
        id: 1,
        prompt: `Write a sentence using these words: ${selectedWords.slice(0, 2).join(', ')}`,
        targetWords: selectedWords.slice(0, 2),
        difficulty: 'easy'
      },
      {
        id: 2,
        prompt: `Describe your daily routine using these words: ${selectedWords.join(', ')}`,
        targetWords: selectedWords,
        difficulty: 'medium'
      },
      {
        id: 3,
        prompt: `Write a short story (3-4 sentences) incorporating: ${selectedWords.join(', ')}`,
        targetWords: selectedWords,
        difficulty: 'hard'
      }
    ]

    const availableExercises = exercises.filter(ex => !completedExercises.has(ex.id))
    if (availableExercises.length > 0) {
      const randomExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)]
      setCurrentExercise(randomExercise)
      setUserText('')
      setFeedback(null)
      setShowHints(false)
    }
  }

  const checkWriting = () => {
    if (!currentExercise || !userText.trim()) return

    const usedWords = currentExercise.targetWords.filter(word => 
      userText.toLowerCase().includes(word.toLowerCase())
    )
    
    const missingWords = currentExercise.targetWords.filter(word => 
      !userText.toLowerCase().includes(word.toLowerCase())
    )

    let feedbackText = `Great work! You used ${usedWords.length} out of ${currentExercise.targetWords.length} target words.`
    
    if (missingWords.length > 0) {
      feedbackText += ` Try to include: ${missingWords.join(', ')}`
    } else {
      feedbackText += ' Perfect use of all target words!'
      setCompletedExercises(prev => new Set([...prev, currentExercise.id]))
    }

    setFeedback(feedbackText)
  }

  const nextExercise = () => {
    generateExercise(frequentWords)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  if (frequentWords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vocabulary available for writing practice
            </h3>
            <p className="text-gray-600 mb-4">
              Learn more songs to build vocabulary that appears multiple times with translations!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    )
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
            <span>Back to Practice</span>
          </button>
          <div className="text-sm text-gray-600">
            {completedExercises.size} exercises completed
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✍️ Writing Practice
          </h1>
          <p className="text-gray-600">
            Create sentences using your learned {currentLanguage.name} vocabulary
          </p>
        </div>
      </div>

      {/* Exercise */}
      {currentExercise && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Exercise</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentExercise.difficulty)}`}>
              {currentExercise.difficulty}
            </span>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-lg text-gray-800 mb-2">{currentExercise.prompt}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Target words:</span>
              {currentExercise.targetWords.map((word, index) => (
                <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your writing:
              </label>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start writing here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={checkWriting}
                disabled={!userText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Writing
              </button>
              
              <button
                onClick={() => setShowHints(!showHints)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {showHints ? 'Hide' : 'Show'} Hints
              </button>
            </div>

            {showHints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Writing Tips:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Try to use all the target words naturally</li>
                  <li>• Focus on correct word order for {currentLanguage.name}</li>
                  <li>• Don't worry about perfect grammar - focus on using the vocabulary</li>
                  <li>• Be creative and have fun with your sentences!</li>
                </ul>
              </div>
            )}

            {feedback && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{feedback}</p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={nextExercise}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Next Exercise
                  </button>
                  <button
                    onClick={() => {
                      setUserText('')
                      setFeedback(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vocabulary Reference */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📚 Your Vocabulary Bank ({frequentWords.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {frequentWords.map((word, index) => (
            <span
              key={index}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm text-center hover:bg-gray-200 cursor-pointer"
              onClick={() => setUserText(prev => prev + (prev ? ' ' : '') + word)}
            >
              {word}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click on any word to add it to your writing
        </p>
      </div>
    </div>
  )
}