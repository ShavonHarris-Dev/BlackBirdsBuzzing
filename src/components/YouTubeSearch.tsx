import { useState } from 'react'
import { audioService, type YouTubeSearchResult, type AudioTrack } from '../lib/audioService'

interface YouTubeSearchProps {
  songTitle: string
  artist: string
  onTrackSelect: (track: AudioTrack) => void
  onClose: () => void
}

export default function YouTubeSearch({ songTitle, artist, onTrackSelect, onClose }: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState(`${artist} ${songTitle}`)
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    try {
      const results = await audioService.searchYouTube(searchQuery.trim())
      setSearchResults(results)
      setHasSearched(true)
    } catch (error) {
      console.error('YouTube search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectResult = (result: YouTubeSearchResult) => {
    const track: AudioTrack = {
      id: result.id,
      title: result.title,
      artist: result.channelTitle,
      url: `https://youtube.com/watch?v=${result.id}`,
      type: 'youtube'
    }
    onTrackSelect(track)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Find Audio for Song</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for song audio..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Searching YouTube...</span>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && hasSearched && (
            <div className="text-center py-8 text-gray-500">
              No results found. Try different search terms.
            </div>
          )}

          {!isSearching && !hasSearched && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-gray-600 mb-4">
                Search YouTube for audio to accompany your song learning
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Tips for better results:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include the artist name and song title</li>
                  <li>• Try "official music video" or "audio only"</li>
                  <li>• Use original language for foreign songs</li>
                </ul>
              </div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-red-600 text-xl">▶️</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{result.channelTitle}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>{result.duration}</span>
                      {result.viewCount && <span>{result.viewCount}</span>}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                      ▶️
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              🎧 Audio will help you learn pronunciation and rhythm
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}