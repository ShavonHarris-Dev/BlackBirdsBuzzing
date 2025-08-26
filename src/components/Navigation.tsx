interface NavigationProps {
  currentView: 'songs' | 'upload' | 'vocabulary' | 'practice'
  onViewChange: (view: 'songs' | 'upload' | 'vocabulary' | 'practice') => void
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'songs', label: 'Songs', icon: '🎵' },
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'practice', label: 'Practice', icon: '✏️' },
  ] as const

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <span className="text-2xl">🎤</span>
            <h1 className="text-xl font-bold text-gray-900">Language Songs</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}