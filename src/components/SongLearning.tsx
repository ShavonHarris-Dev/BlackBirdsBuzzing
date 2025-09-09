import { useState, useEffect } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import type { Song } from '../lib/database'
import AudioPlayer from './AudioPlayer'
import YouTubeSearch from './YouTubeSearch'
import TranslatableLine from './TranslatableLine'
import { audioService, type AudioTrack } from '../lib/audioService'

interface SongLearningProps {
  songId: number
  onBack: () => void
}

export default function SongLearning({ songId, onBack }: SongLearningProps) {
  const { getSongsByLanguage, currentLanguage, updateUserProgress, getUserProgress } = useDatabaseContext()
  const [song, setSong] = useState<Song | null>(null)
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set())
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false)

  useEffect(() => {
    if (!currentLanguage) return

    const songs = getSongsByLanguage(currentLanguage.id)
    const foundSong = songs.find(s => s.id === songId)
    
    if (foundSong) {
      setSong(foundSong)
      const lyricsLines = foundSong.lyrics.split('\n').filter(line => line.trim())
      setLines(lyricsLines)
      
      // Load existing progress
      const progress = getUserProgress(songId)
      if (progress) {
        setCurrentLine(progress.current_line)
        setCompletedLines(new Set(Array.from({ length: progress.current_line }, (_, i) => i)))
      }
    }
  }, [songId, currentLanguage, getSongsByLanguage, getUserProgress])

  const handleLineComplete = () => {
    const newCompletedLines = new Set(completedLines)
    newCompletedLines.add(currentLine)
    setCompletedLines(newCompletedLines)

    if (currentLine < lines.length - 1) {
      const nextLine = currentLine + 1
      setCurrentLine(nextLine)
      updateUserProgress(songId, nextLine, nextLine === lines.length - 1)
    } else {
      // Song completed
      updateUserProgress(songId, lines.length - 1, true)
    }
  }

  const goToLine = (lineIndex: number) => {
    setCurrentLine(lineIndex)
    updateUserProgress(songId, lineIndex)
  }

  const handleTrackSelect = (track: AudioTrack) => {
    setCurrentTrack(track)
    setShowYouTubeSearch(false)
  }

  const speakCurrentLine = async () => {
    if (song && currentLanguage && lines[currentLine]) {
      await audioService.speakText(lines[currentLine], currentLanguage.code)
    }
  }

  if (!song) {
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

  const progressPercentage = Math.round((completedLines.size / lines.length) * 100)

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
            <span>Back to Songs</span>
          </button>
          <div className="text-sm text-gray-600">
            Progress: {progressPercentage}%
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{song.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{song.artist}</p>
          
          {/* Audio Controls */}
          <div className="mb-4">
            {currentTrack ? (
              <div className="text-sm text-green-600 mb-2">🎵 Audio ready</div>
            ) : (
              <button
                onClick={() => setShowYouTubeSearch(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm mb-2"
              >
                🎵 Add Audio from YouTube
              </button>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {currentTrack && (
        <div className="mb-6">
          <AudioPlayer track={currentTrack} />
        </div>
      )}

      {/* Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Line Focus */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Line {currentLine + 1} of {lines.length}
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <TranslatableLine
                  text={lines[currentLine]}
                  fromLanguage={currentLanguage?.code || 'en'}
                  className="text-2xl font-medium text-gray-900"
                />
                <button
                  onClick={speakCurrentLine}
                  className="mt-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  🔊 Speak Line
                </button>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => goToLine(Math.max(0, currentLine - 1))}
                disabled={currentLine === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous Line
              </button>
              
              <button
                onClick={handleLineComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {completedLines.has(currentLine) ? 'Review Again' : 'I understand this line'}
              </button>
              
              <button
                onClick={() => goToLine(Math.min(lines.length - 1, currentLine + 1))}
                disabled={currentLine === lines.length - 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Line
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Song Progress</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lines.map((line, index) => (
              <div
                key={index}
                onClick={() => goToLine(index)}
                className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                  index === currentLine
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : completedLines.has(index)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 min-w-[2rem]">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">
                    {line}
                  </span>
                  {completedLines.has(index) && (
                    <span className="text-green-600">✓</span>
                  )}
                  {index === currentLine && (
                    <span className="text-blue-600">▶</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {completedLines.size === lines.length && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mt-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Congratulations!
          </h3>
          <p className="text-green-700">
            You've completed learning "{song.title}" by {song.artist}!
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Songs
          </button>
        </div>
      )}

      {/* YouTube Search Modal */}
      {showYouTubeSearch && song && (
        <YouTubeSearch
          songTitle={song.title}
          artist={song.artist}
          onTrackSelect={handleTrackSelect}
          onClose={() => setShowYouTubeSearch(false)}
        />
      )}
    </div>
  )
}