import { useState } from 'react'
import Navigation from './components/Navigation'
import SongUpload from './components/SongUpload'
import LanguageSelector from './components/LanguageSelector'
import VocabularyBank from './components/VocabularyBank'
import SongList from './components/SongList'

type View = 'songs' | 'upload' | 'vocabulary' | 'practice'

function App() {
  const [currentView, setCurrentView] = useState<View>('songs')
  const [selectedLanguage, setSelectedLanguage] = useState('korean')

  const renderView = () => {
    switch (currentView) {
      case 'songs':
        return <SongList language={selectedLanguage} />
      case 'upload':
        return <SongUpload language={selectedLanguage} />
      case 'vocabulary':
        return <VocabularyBank language={selectedLanguage} />
      case 'practice':
        return <div className="p-6 text-center">Practice Mode - Coming Soon!</div>
      default:
        return <SongList language={selectedLanguage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
        
        {renderView()}
      </main>
    </div>
  )
}

export default App