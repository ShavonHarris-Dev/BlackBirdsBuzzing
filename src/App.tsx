import { useState } from 'react'
import { DatabaseProvider } from './contexts/DatabaseContext'
import Navigation from './components/Navigation'
import SongUpload from './components/SongUpload'
import LanguageSelector from './components/LanguageSelector'
import VocabularyBank from './components/VocabularyBank'
import SongList from './components/SongList'
import PracticeHub from './components/PracticeHub'
import SongWriter from './components/SongWriter'

type View = 'songs' | 'upload' | 'vocabulary' | 'practice' | 'write'

function App() {
  const [currentView, setCurrentView] = useState<View>('songs')

  const renderView = () => {
    switch (currentView) {
      case 'songs':
        return <SongList onNavigate={setCurrentView} />
      case 'upload':
        return <SongUpload />
      case 'vocabulary':
        return <VocabularyBank />
      case 'practice':
        return <PracticeHub />
      case 'write':
        return <SongWriter />
      default:
        return <SongList onNavigate={setCurrentView} />
    }
  }

  return (
    <DatabaseProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <LanguageSelector />
          </div>
          
          {renderView()}
        </main>
      </div>
    </DatabaseProvider>
  )
}

export default App