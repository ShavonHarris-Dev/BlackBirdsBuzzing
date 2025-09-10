import { useState } from 'react'

interface ParallelTextLineProps {
  originalText: string
  translationText: string
  className?: string
}

export default function ParallelTextLine({ 
  originalText, 
  translationText, 
  className = '' 
}: ParallelTextLineProps) {
  const [showTranslation, setShowTranslation] = useState(false)

  return (
    <div className="space-y-3">
      <div className={`${className}`}>
        {originalText}
      </div>
      
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            showTranslation 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showTranslation ? '🙈 Hide Translation' : '🌍 Show Translation'}
        </button>
      </div>
      
      {showTranslation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
          <div className="text-lg text-green-800 font-medium">
            📖 {translationText}
          </div>
          <div className="text-xs text-green-600 mt-2">
            ✨ Human-translated parallel text
          </div>
        </div>
      )}
    </div>
  )
}