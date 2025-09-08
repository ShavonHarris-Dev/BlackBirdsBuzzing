import { useState, useEffect } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import type { Vocabulary } from '../lib/database'

export default function SongWriter() {
  const { currentLanguage, getVocabularyByLanguage, isInitialized } = useDatabaseContext()
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [songTitle, setSongTitle] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [showVocabulary, setShowVocabulary] = useState(true)

  useEffect(() => {
    if (!currentLanguage) return
    const vocab = getVocabularyByLanguage(currentLanguage.id)
    setVocabulary(vocab.sort((a, b) => b.frequency_count - a.frequency_count))
  }, [currentLanguage, getVocabularyByLanguage])

  if (!isInitialized || !currentLanguage) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const addWordToLyrics = (word: string) => {
    setLyrics(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + word)
    setSelectedWords(prev => new Set([...prev, word]))
  }

  const clearLyrics = () => {
    setLyrics('')
    setSelectedWords(new Set())
  }

  const exportSong = () => {
    if (!songTitle.trim() || !lyrics.trim()) {
      alert('Please add a title and some lyrics first!')
      return
    }

    const songContent = `Title: ${songTitle}\nLanguage: ${currentLanguage.name}\n\n${lyrics}`
    const blob = new Blob([songContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${songTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const frequentWords = vocabulary.filter(w => w.frequency_count >= 2)
  const allWords = vocabulary

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Song Writer - {currentLanguage.name}
        </h1>
        <p className="text-gray-600">
          Create your own songs using vocabulary you've learned
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Writing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="Enter your song title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lyrics Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lyrics</h3>
              <div className="space-x-2">
                <button
                  onClick={clearLyrics}
                  className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Clear
                </button>
                <button
                  onClick={exportSong}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Export
                </button>
              </div>
            </div>
            
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Start writing your lyrics here... or click words from your vocabulary to add them!"
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg leading-relaxed"
            />
            
            <div className="mt-4 text-sm text-gray-600">
              <strong>Tips:</strong>
              • Click vocabulary words to add them to your lyrics
              • Each line should tell part of your story
              • Use repeated words to create a chorus effect
            </div>
          </div>

          {/* Stats */}
          {lyrics && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Song Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {lyrics.split('\n').filter(line => line.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">Lines</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {lyrics.split(/\s+/).filter(word => word.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedWords.size}
                  </div>
                  <div className="text-sm text-gray-600">From Vocabulary</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vocabulary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Vocabulary</h3>
              <button
                onClick={() => setShowVocabulary(!showVocabulary)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showVocabulary ? 'Hide' : 'Show'}
              </button>
            </div>

            {showVocabulary && (
              <>
                {vocabulary.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-gray-600 text-sm">
                      Upload some songs first to build your {currentLanguage.name} vocabulary!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Frequent Words */}
                    {frequentWords.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          🌟 Frequent Words ({frequentWords.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {frequentWords.map(word => (
                            <button
                              key={word.id}
                              onClick={() => addWordToLyrics(word.word)}
                              className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedWords.has(word.word)
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-green-50 hover:bg-green-100 text-green-700'
                              }`}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">{word.word}</span>
                                <span className="text-xs">{word.frequency_count}x</span>
                              </div>
                              {word.translation && (
                                <div className="text-xs text-green-600">{word.translation}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Words */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        📝 All Words ({allWords.length})
                      </h4>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {allWords.map(word => (
                          <button
                            key={word.id}
                            onClick={() => addWordToLyrics(word.word)}
                            className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedWords.has(word.word)
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-50 hover:bg-blue-50 text-gray-700'
                            }`}
                          >
                            <div className="flex justify-between">
                              <span>{word.word}</span>
                              <span className="text-xs text-gray-500">{word.frequency_count}x</span>
                            </div>
                            {word.translation && (
                              <div className="text-xs text-gray-500">{word.translation}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}