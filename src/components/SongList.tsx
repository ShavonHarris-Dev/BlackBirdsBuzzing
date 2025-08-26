interface SongListProps {
  language: string
}

// Mock song data - in real app this would come from a database
const mockSongs = {
  korean: [
    { 
      id: 1, 
      title: 'Give Love', 
      artist: 'AKMU', 
      progress: 0,
      vocabularyCount: 15,
      isCompleted: false 
    },
    { 
      id: 2, 
      title: 'Spring Day', 
      artist: 'BTS', 
      progress: 75,
      vocabularyCount: 23,
      isCompleted: false 
    },
    { 
      id: 3, 
      title: 'DNA', 
      artist: 'BTS', 
      progress: 100,
      vocabularyCount: 18,
      isCompleted: true 
    },
  ],
  spanish: [
    { 
      id: 4, 
      title: 'Despacito', 
      artist: 'Luis Fonsi', 
      progress: 30,
      vocabularyCount: 12,
      isCompleted: false 
    },
  ],
  french: [],
  japanese: [],
}

export default function SongList({ language }: SongListProps) {
  const songs = mockSongs[language as keyof typeof mockSongs] || []

  const handleSongClick = (songId: number) => {
    // TODO: Navigate to song learning view
    console.log('Opening song:', songId)
    alert('Song learning view coming soon!')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your {language.charAt(0).toUpperCase() + language.slice(1)} Songs
          </h2>
          <div className="text-sm text-gray-600">
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {songs.length > 0 ? (
          <div className="space-y-4">
            {songs.map((song) => (
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
                    {song.isCompleted && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        ✓ Completed
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      {song.vocabularyCount} words
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{song.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          song.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${song.progress}%` }}
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
                    {song.progress === 0 ? 'Start' : song.progress === 100 ? 'Review' : 'Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {language} songs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload your first song to start learning {language} vocabulary!
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
                {songs.filter(s => s.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {songs.reduce((sum, s) => sum + s.vocabularyCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Words Learned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(songs.reduce((sum, s) => sum + s.progress, 0) / songs.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}