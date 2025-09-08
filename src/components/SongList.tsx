import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import SongLearning from './SongLearning'
import YouTubeSearch from './YouTubeSearch'
import { type AudioTrack } from '../lib/audioService'

export default function SongList() {
  const { currentLanguage, getSongsByLanguage, isInitialized, getUserProgress } = useDatabaseContext()
  const [learningSongId, setLearningSongId] = useState<number | null>(null)
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false)
  const [searchingSong, setSearchingSong] = useState<{ title: string; artist: string } | null>(null)
  
  if (!isInitialized || !currentLanguage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  const songs = getSongsByLanguage(currentLanguage.id)

  const handleSongClick = (songId: number) => {
    setLearningSongId(songId)
  }

  const handleFindAudio = (song: { title: string; artist: string }) => {
    setSearchingSong(song)
    setShowYouTubeSearch(true)
  }

  const handleTrackSelect = (track: AudioTrack) => {
    console.log('Selected track for song:', searchingSong, track)
    setShowYouTubeSearch(false)
    setSearchingSong(null)
    // Here you could save the track association to the song
  }

  if (learningSongId) {
    return (
      <SongLearning 
        songId={learningSongId} 
        onBack={() => setLearningSongId(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your {currentLanguage.name} Songs
          </h2>
          <div className="text-sm text-gray-600">
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {songs.length > 0 ? (
          <div className="space-y-4">
            {songs.map((song) => {
              const progress = getUserProgress(song.id)
              const lyrics = song.lyrics.split('\n').filter(line => line.trim())
              const totalLines = lyrics.length
              const completedLines = progress ? progress.current_line + 1 : 0
              const progressPercentage = totalLines > 0 ? Math.round((completedLines / totalLines) * 100) : 0
              const isCompleted = progress?.completed || false
              
              return (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song.id)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
                      <p className="text-gray-600">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isCompleted && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          ✓ Completed
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFindAudio({ title: song.title, artist: song.artist })
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        🎵 Audio
                      </button>
                      <span className="text-sm text-gray-600">
                        {totalLines} lines
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSongClick(song.id)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {progressPercentage === 0 ? 'Start' : isCompleted ? 'Review' : 'Continue'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {currentLanguage.name} songs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload your first song to start learning {currentLanguage.name} vocabulary!
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload Song
            </button>
          </div>
        )}
      </div>
      
      {songs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {songs.filter(song => {
                  const progress = getUserProgress(song.id)
                  return progress?.completed
                }).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {songs.reduce((total, song) => {
                  const lyrics = song.lyrics.split('\n').filter(line => line.trim())
                  const progress = getUserProgress(song.id)
                  return total + (progress ? progress.current_line + 1 : 0)
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Lines Learned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(songs.reduce((total, song) => {
                  const lyrics = song.lyrics.split('\n').filter(line => line.trim())
                  const progress = getUserProgress(song.id)
                  const percentage = lyrics.length > 0 ? ((progress ? progress.current_line + 1 : 0) / lyrics.length) * 100 : 0
                  return total + percentage
                }, 0) / songs.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Search Modal */}
      {showYouTubeSearch && searchingSong && (
        <YouTubeSearch
          songTitle={searchingSong.title}
          artist={searchingSong.artist}
          onTrackSelect={handleTrackSelect}
          onClose={() => {
            setShowYouTubeSearch(false)
            setSearchingSong(null)
          }}
        />
      )}
    </div>
  )
}