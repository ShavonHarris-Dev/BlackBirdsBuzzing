import { useState } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'

export default function SongUpload() {
  const { currentLanguage, addSong, isInitialized } = useDatabaseContext()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

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
      setSubmitMessage('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      await addSong(title.trim(), artist.trim(), lyrics.trim())
      setSubmitMessage(`Song "${title}" saved successfully!`)
      
      // Reset form after short delay
      setTimeout(() => {
        setTitle('')
        setArtist('')
        setLyrics('')
        setSubmitMessage('')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to save song:', error)
      setSubmitMessage('Failed to save song. Please try again.')
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
              placeholder="e.g., Give Love"
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
              placeholder="e.g., AKMU"
              required
            />
          </div>

          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
              Lyrics ({currentLanguage.name})
            </label>
            <textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste the song lyrics here..."
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              Tip: Each line should be on its own row for best learning experience
            </p>
          </div>

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