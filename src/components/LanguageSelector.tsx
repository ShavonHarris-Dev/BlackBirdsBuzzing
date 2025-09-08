import { useDatabaseContext } from '../hooks/useDatabase'

const languageFlags: Record<string, string> = {
  ko: '🇰🇷',
  es: '🇪🇸', 
  fr: '🇫🇷',
  ja: '🇯🇵',
  zh: '🇨🇳',
  it: '🇮🇹',
  pt: '🇧🇷',
  de: '🇩🇪',
  hi: '🇮🇳',
  ha: '🇳🇬',
  ar: '🇸🇦',
  sw: '🇹🇿'
}

export default function LanguageSelector() {
  const { languages, currentLanguage, setCurrentLanguage, isInitialized } = useDatabaseContext()
  
  if (!isInitialized || !currentLanguage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Learning Language</h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-xl">{languageFlags[currentLanguage.code] || '🌐'}</span>
            <span className="font-medium text-gray-800">{currentLanguage.name}</span>
          </div>
          
          <select
            value={currentLanguage.id}
            onChange={(e) => {
              const selectedId = parseInt(e.target.value)
              const selected = languages.find(lang => lang.id === selectedId)
              if (selected) setCurrentLanguage(selected)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {languageFlags[language.code] || '🌐'} {language.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}