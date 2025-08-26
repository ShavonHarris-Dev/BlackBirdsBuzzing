interface VocabularyBankProps {
  language: string
}

// Mock vocabulary data - in real app this would come from a database
const mockVocabulary = {
  korean: [
    { word: '사랑', translation: 'love', frequency: 5, fromSongs: ['Give Love', 'Spring Day'] },
    { word: '너', translation: 'you', frequency: 8, fromSongs: ['Give Love', 'DNA', 'Spring Day'] },
    { word: '나', translation: 'I/me', frequency: 12, fromSongs: ['Give Love', 'DNA', 'Spring Day', 'Fake Love'] },
    { word: '마음', translation: 'heart/mind', frequency: 3, fromSongs: ['Give Love', 'Spring Day'] },
    { word: '시간', translation: 'time', frequency: 4, fromSongs: ['Spring Day', 'DNA'] },
  ],
  spanish: [
    { word: 'amor', translation: 'love', frequency: 6, fromSongs: ['Despacito', 'Bailando'] },
    { word: 'corazón', translation: 'heart', frequency: 4, fromSongs: ['Despacito'] },
  ],
  french: [],
  japanese: [],
}

export default function VocabularyBank({ language }: VocabularyBankProps) {
  const vocabulary = mockVocabulary[language as keyof typeof mockVocabulary] || []
  
  const frequentWords = vocabulary.filter(word => word.frequency >= 2)
  const allWords = vocabulary

  return (
    <div className="space-y-6">
      {/* Frequent Words Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            🌟 Frequent Words ({frequentWords.length})
          </h2>
          <p className="text-sm text-gray-600">
            Words that appear 2+ times across songs
          </p>
        </div>
        
        {frequentWords.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frequentWords.map((word, index) => (
              <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">{word.word}</span>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    {word.frequency}x
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{word.translation}</p>
                <div className="text-xs text-gray-600">
                  From: {word.fromSongs.join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No frequent words yet. Keep learning songs to build your vocabulary bank!
          </p>
        )}
      </div>

      {/* All Words Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            📚 All Vocabulary ({allWords.length})
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Practice All
          </button>
        </div>
        
        {allWords.length > 0 ? (
          <div className="space-y-2">
            {allWords.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-medium text-gray-900">{word.word}</span>
                    <span className="text-gray-600">{word.translation}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    From: {word.fromSongs.join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    {word.frequency}x
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No vocabulary yet. Upload some songs to start building your {language} vocabulary!
          </p>
        )}
      </div>
    </div>
  )
}