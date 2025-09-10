import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { db } from '../lib/database';
import type { Language, Song, Vocabulary, UserProgress } from '../lib/database';

interface DatabaseContextType {
  isInitialized: boolean;
  languages: Language[];
  currentLanguage: Language | null;
  setCurrentLanguage: (language: Language) => void;
  addSong: (title: string, artist: string, lyrics: string) => Promise<number>;
  getSongsByLanguage: (languageId: number) => Song[];
  addVocabulary: (word: string, translation: string, songId?: number) => void;
  getVocabularyByLanguage: (languageId: number) => Vocabulary[];
  updateUserProgress: (songId: number, currentLine: number, completed?: boolean) => void;
  getUserProgress: (songId: number) => UserProgress | null;
  updateVocabularyPracticeCount: (vocabularyId: number) => void;
  refreshData: () => void;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguageState] = useState<Language | null>(null);
  const [, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.initialize();
        const langs = db.getLanguages();
        setLanguages(langs);
        
        const savedLanguageId = localStorage.getItem('currentLanguageId');
        if (savedLanguageId && langs.length > 0) {
          const saved = langs.find(lang => lang.id === parseInt(savedLanguageId));
          setCurrentLanguageState(saved || langs[0]);
        } else if (langs.length > 0) {
          setCurrentLanguageState(langs[0]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDatabase();

    return () => {
      db.close();
    };
  }, []);

  const setCurrentLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem('currentLanguageId', language.id.toString());
  };

  const addSong = async (title: string, artist: string, lyrics: string): Promise<number> => {
    if (!currentLanguage) throw new Error('No language selected');
    
    const songId = db.addSong(title, artist, currentLanguage.id, lyrics);
    
    // Extract vocabulary from lyrics and add basic translations
    const { getUniqueWords } = await import('../lib/textAnalysis');
    const { getTranslation } = await import('../lib/translations');
    const words = getUniqueWords(lyrics);
    
    // Add vocabulary words to database with basic translations
    words.slice(0, 50).forEach(word => {
      const translation = getTranslation(word, currentLanguage.code);
      db.addVocabulary(word, translation, currentLanguage.id, songId);
    });
    
    return songId;
  };

  const getSongsByLanguage = (languageId: number): Song[] => {
    return db.getSongsByLanguage(languageId);
  };

  const addVocabulary = (word: string, translation: string, songId?: number): void => {
    if (!currentLanguage) return;
    db.addVocabulary(word, translation, currentLanguage.id, songId);
  };

  const getVocabularyByLanguage = (languageId: number): Vocabulary[] => {
    return db.getVocabularyByLanguage(languageId);
  };

  const updateUserProgress = (songId: number, currentLine: number, completed: boolean = false): void => {
    db.updateUserProgress(songId, currentLine, completed);
    setRefreshTrigger(prev => prev + 1); // Trigger re-render
  };

  const getUserProgress = (songId: number): UserProgress | null => {
    return db.getUserProgress(songId);
  };

  const updateVocabularyPracticeCount = (vocabularyId: number): void => {
    db.updateVocabularyPracticeCount(vocabularyId);
    setRefreshTrigger(prev => prev + 1); // Trigger re-render
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const contextValue: DatabaseContextType = {
    isInitialized,
    languages,
    currentLanguage,
    setCurrentLanguage,
    addSong,
    getSongsByLanguage,
    addVocabulary,
    getVocabularyByLanguage,
    updateUserProgress,
    getUserProgress,
    updateVocabularyPracticeCount,
    refreshData,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};