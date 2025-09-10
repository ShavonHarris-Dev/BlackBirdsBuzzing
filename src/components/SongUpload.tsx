import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'

export default function SongUpload() {
  const { currentLanguage, addSong, isInitialized } = useDatabaseContext()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [englishTranslation, setEnglishTranslation] = useState('')
  const [includeTranslation, setIncludeTranslation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Language-specific placeholders
  const getPlaceholders = () => {
    const placeholders: Record<string, { title: string; artist: string }> = {
      'Korean': { title: 'Give Love', artist: 'AKMU' },
      'Spanish': { title: 'Despacito', artist: 'Luis Fonsi' },
      'French': { title: 'La Vie En Rose', artist: 'Édith Piaf' },
      'German': { title: 'Du Hast', artist: 'Rammstein' },
      'Japanese': { title: 'Sukiyaki', artist: 'Kyu Sakamoto' },
      'Italian': { title: 'Con Te Partirò', artist: 'Andrea Bocelli' },
      'Portuguese': { title: 'Garota de Ipanema', artist: 'Tom Jobim' },
      'Chinese': { title: '月亮代表我的心', artist: 'Teresa Teng' },
      'Hindi': { title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam' },
      'Arabic': { title: 'Ya Msafer', artist: 'Mohammed Abdu' },
      'Swahili': { title: 'Malaika', artist: 'Miriam Makeba' },
      'Hausa': { title: 'Barauniya', artist: 'Ali Jita' }
    }
    return placeholders[currentLanguage?.name || 'Korean'] || placeholders['Korean']
  }

  const placeholders = getPlaceholders()

  if (!isInitialized || !currentLanguage) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !artist.trim() || !lyrics.trim()) {
      setSubmitMessage('Please fill in all required fields')
      return
    }

    if (includeTranslation && !englishTranslation.trim()) {
      setSubmitMessage('Please provide English translation or disable the translation option')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const translationToSave = includeTranslation ? englishTranslation.trim() : undefined
      await addSong(title.trim(), artist.trim(), lyrics.trim(), translationToSave)
      
      const successMsg = includeTranslation 
        ? `Song "${title}" saved with English translation!`
        : `Song "${title}" saved successfully!`
      setSubmitMessage(successMsg)
      
      // Reset form after short delay
      setTimeout(() => {
        setTitle('')
        setArtist('')
        setLyrics('')
        setEnglishTranslation('')
        setIncludeTranslation(false)
        setSubmitMessage('')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to save song:', error)
      setSubmitMessage(`Failed to save song: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upload New {currentLanguage.name} Song
        </h2>
        
        {submitMessage && (
          <div className={`mb-4 p-3 rounded-md ${
            submitMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {submitMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Song Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`e.g., ${placeholders.title}`}
              required
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
              Artist
            </label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`e.g., ${placeholders.artist}`}
              required
            />
          </div>

          {/* Translation Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="includeTranslation"
              checked={includeTranslation}
              onChange={(e) => setIncludeTranslation(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeTranslation" className="flex items-center cursor-pointer">
              <span className="text-sm font-medium text-gray-900 ml-2">
                🌟 Include English Translation (Recommended!)
              </span>
            </label>
          </div>
          
          {includeTranslation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 text-sm font-medium">💡 Pro Tip:</span>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                Adding an English translation will give you much more accurate line-by-line translations and better vocabulary learning!
              </p>
            </div>
          )}

          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
              Lyrics ({currentLanguage.name}) *
            </label>
            <textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={includeTranslation ? 8 : 12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste the song lyrics here..."
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              Tip: Each line should be on its own row for best learning experience
            </p>
          </div>

          {includeTranslation && (
            <div>
              <label htmlFor="englishTranslation" className="block text-sm font-medium text-gray-700 mb-2">
                English Translation *
              </label>
              <textarea
                id="englishTranslation"
                value={englishTranslation}
                onChange={(e) => setEnglishTranslation(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Paste the English translation here..."
                required={includeTranslation}
              />
              <p className="mt-2 text-sm text-purple-600">
                💯 Make sure each line matches the corresponding line in the original lyrics above
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Song'}
          </button>
        </form>
      </div>
    </div>
  )
}