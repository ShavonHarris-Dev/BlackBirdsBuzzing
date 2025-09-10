import { useState, useEffect } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import type { Song } from '../lib/database'
import TranslatableLine from './TranslatableLine'
import { audioService } from '../lib/audioService'

interface SongReviewProps {
  onBack: () => void
}

interface ReviewSession {
  song: Song
  lines: string[]
  currentLineIndex: number
  reviewedLines: Set<number>
  score: number
}

export default function SongReview({ onBack }: SongReviewProps) {
  const { currentLanguage, getSongsByLanguage, getUserProgress, isInitialized } = useDatabaseContext()
  const [completedSongs, setCompletedSongs] = useState<Song[]>([])
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  useEffect(() => {
    if (!currentLanguage) return
    
    const songs = getSongsByLanguage(currentLanguage.id)
    const completed = songs.filter(song => {
      const progress = getUserProgress(song.id)
      return progress && progress.completed
    })
    
    setCompletedSongs(completed)
  }, [currentLanguage, getSongsByLanguage, getUserProgress])

  const startReview = (song: Song) => {
    const lines = song.lyrics.split('\n').filter(line => line.trim())
    const shuffledLineIndexes = Array.from({ length: lines.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, lines.length)) // Review up to 10 random lines
    
    setCurrentSession({
      song,
      lines,
      currentLineIndex: 0,
      reviewedLines: new Set(),
      score: 0
    })
    setShowTranslation(false)
    setSessionComplete(false)
  }

  const handleKnowLine = () => {
    if (!currentSession) return
    
    const newReviewedLines = new Set(currentSession.reviewedLines)
    newReviewedLines.add(currentSession.currentLineIndex)
    
    const newScore = currentSession.score + 1
    
    if (currentSession.currentLineIndex < currentSession.lines.length - 1) {
      setCurrentSession({
        ...currentSession,
        currentLineIndex: currentSession.currentLineIndex + 1,
        reviewedLines: newReviewedLines,
        score: newScore
      })
      setShowTranslation(false)
    } else {
      setCurrentSession({
        ...currentSession,
        reviewedLines: newReviewedLines,
        score: newScore
      })
      setSessionComplete(true)
    }
  }

  const handleDontKnowLine = () => {
    if (!currentSession) return
    
    const newReviewedLines = new Set(currentSession.reviewedLines)
    newReviewedLines.add(currentSession.currentLineIndex)
    
    if (currentSession.currentLineIndex < currentSession.lines.length - 1) {
      setCurrentSession({
        ...currentSession,
        currentLineIndex: currentSession.currentLineIndex + 1,
        reviewedLines: newReviewedLines
      })
      setShowTranslation(false)
    } else {
      setCurrentSession({
        ...currentSession,
        reviewedLines: newReviewedLines
      })
      setSessionComplete(true)
    }
  }

  const speakCurrentLine = async () => {
    if (currentSession && currentLanguage) {
      const currentLine = currentSession.lines[currentSession.currentLineIndex]
      await audioService.speakText(currentLine, currentLanguage.code)
    }
  }

  const restartSession = () => {
    if (currentSession) {
      startReview(currentSession.song)
    }
  }

  const endSession = () => {
    setCurrentSession(null)
    setSessionComplete(false)
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

  if (completedSongs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No completed songs to review
            </h3>
            <p className="text-gray-600 mb-4">
              Complete some {currentLanguage.name} songs first to unlock song review practice!
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

  if (currentSession && sessionComplete) {
    const percentage = Math.round((currentSession.score / currentSession.lines.length) * 100)
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🌟' : percentage >= 60 ? '👏' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Review Complete!
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{currentSession.lines.length}</div>
                  <div className="text-sm text-gray-600">Lines Reviewed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{currentSession.score}</div>
                  <div className="text-sm text-gray-600">Lines Known</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Retention</div>
                </div>
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={restartSession}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Review Again
              </button>
              <button
                onClick={endSession}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Choose Different Song
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Back to Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentSession) {
    const currentLine = currentSession.lines[currentSession.currentLineIndex]
    const progress = ((currentSession.currentLineIndex) / currentSession.lines.length) * 100
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={endSession}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <span>←</span>
              <span>Back to Song Selection</span>
            </button>
            <div className="text-sm text-gray-600">
              Line {currentSession.currentLineIndex + 1} of {currentSession.lines.length}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Reviewing: {currentSession.song.title}
            </h1>
            <p className="text-lg text-gray-600">{currentSession.song.artist}</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Review Interface */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-4">
              Do you remember this line?
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-6">
              <div className="text-2xl font-medium text-gray-900 mb-4">
                {currentLine}
              </div>
              
              <div className="space-x-4 mb-4">
                <button
                  onClick={speakCurrentLine}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  🔊 Play Audio
                </button>
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  {showTranslation ? 'Hide' : 'Show'} Translation
                </button>
              </div>
              
              {showTranslation && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <TranslatableLine
                    text={currentLine}
                    fromLanguage={currentLanguage.code}
                    className="text-lg text-gray-700"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-6">
              <button
                onClick={handleKnowLine}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ✓ I remember this line
              </button>
              <button
                onClick={handleDontKnowLine}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                ✗ I need to review this
              </button>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Score: {currentSession.score}/{currentSession.reviewedLines.size + 1}
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
            {completedSongs.length} songs available
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎵 Song Review
          </h1>
          <p className="text-gray-600">
            Review lyrics line by line from your completed {currentLanguage.name} songs
          </p>
        </div>
      </div>

      {/* Song Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Choose a Song to Review
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {completedSongs.map((song) => (
            <div
              key={song.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => startReview(song)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{song.title}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Completed
                </span>
              </div>
              <p className="text-gray-600 mb-2">{song.artist}</p>
              <div className="text-sm text-gray-500">
                {song.lyrics.split('\n').filter(line => line.trim()).length} lines
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}