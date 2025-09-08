import initSqlJs, { Database } from 'sql.js';

export interface Language {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  language_id: number;
  lyrics: string;
  created_at: string;
}

export interface Vocabulary {
  id: number;
  word: string;
  translation: string;
  language_id: number;
  frequency_count: number;
  first_learned_from_song_id: number;
  created_at: string;
}

export interface UserProgress {
  id: number;
  song_id: number;
  current_line: number;
  completed: boolean;
  practice_sessions: number;
  last_accessed: string;
}

export interface LearningSession {
  id: number;
  song_id: number;
  vocabulary_learned: string;
  session_date: string;
  duration_minutes: number;
}

class DatabaseManager {
  private db: Database | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });

      const savedData = localStorage.getItem('languageSongsDB');
      if (savedData) {
        const data = new Uint8Array(JSON.parse(savedData));
        this.db = new SQL.Database(data);
      } else {
        this.db = new SQL.Database();
        this.createTables();
        this.seedInitialData();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        language_id INTEGER NOT NULL,
        lyrics TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (language_id) REFERENCES languages (id)
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        translation TEXT,
        language_id INTEGER NOT NULL,
        frequency_count INTEGER DEFAULT 1,
        first_learned_from_song_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (language_id) REFERENCES languages (id),
        FOREIGN KEY (first_learned_from_song_id) REFERENCES songs (id),
        UNIQUE(word, language_id)
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        song_id INTEGER NOT NULL,
        current_line INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        practice_sessions INTEGER DEFAULT 0,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (song_id) REFERENCES songs (id),
        UNIQUE(song_id)
      );

      CREATE TABLE IF NOT EXISTS learning_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        song_id INTEGER NOT NULL,
        vocabulary_learned TEXT,
        session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration_minutes INTEGER DEFAULT 0,
        FOREIGN KEY (song_id) REFERENCES songs (id)
      );

      CREATE INDEX idx_songs_language ON songs(language_id);
      CREATE INDEX idx_vocabulary_language ON vocabulary(language_id);
      CREATE INDEX idx_vocabulary_word ON vocabulary(word);
      CREATE INDEX idx_user_progress_song ON user_progress(song_id);
    `);
  }

  private seedInitialData(): void {
    if (!this.db) return;

    const languages = [
      { name: 'Korean', code: 'ko' },
      { name: 'Spanish', code: 'es' },
      { name: 'French', code: 'fr' },
      { name: 'Japanese', code: 'ja' },
      { name: 'German', code: 'de' },
      { name: 'Italian', code: 'it' },
      { name: 'Portuguese', code: 'pt' },
      { name: 'Chinese', code: 'zh' },
      { name: 'Hindi', code: 'hi' },
      { name: 'Hausa', code: 'ha' },
      { name: 'Arabic', code: 'ar' },
      { name: 'Swahili', code: 'sw' }
    ];

    languages.forEach(lang => {
      this.db!.run('INSERT OR IGNORE INTO languages (name, code) VALUES (?, ?)', [lang.name, lang.code]);
    });

    // Add some sample songs for testing
    this.addSampleSongs();

    this.save();
  }

  private addSampleSongs(): void {
    if (!this.db) return;

    // Check if sample songs already exist
    const existingSongs = this.db.exec('SELECT COUNT(*) as count FROM songs');
    if (existingSongs[0] && existingSongs[0].values[0] && Number(existingSongs[0].values[0][0]) > 0) {
      return; // Sample songs already added
    }

    // Get language IDs
    const koreanId = this.db.exec("SELECT id FROM languages WHERE code = 'ko'")[0]?.values[0][0];
    const spanishId = this.db.exec("SELECT id FROM languages WHERE code = 'es'")[0]?.values[0][0];

    if (koreanId) {
      // Korean sample song
      const koreanLyrics = `안녕 내 사랑 (Hello my love)
너를 만나서 기뻐 (Happy to meet you)
우리 함께 해 (Let's be together)
사랑해 사랑해 (I love you, I love you)
언제까지나 (Forever and ever)
너와 함께 할게 (I'll be with you)`;

      this.db.run('INSERT INTO songs (title, artist, language_id, lyrics) VALUES (?, ?, ?, ?)', 
        ['Hello My Love', 'Sample Artist', koreanId, koreanLyrics]);
    }

    if (spanishId) {
      // Spanish sample song  
      const spanishLyrics = `Hola mi amor (Hello my love)
Te quiero mucho (I love you so much)
Eres mi vida (You are my life)
Mi corazón (My heart)
Siempre contigo (Always with you)
Para siempre (Forever)`;

      this.db.run('INSERT INTO songs (title, artist, language_id, lyrics) VALUES (?, ?, ?, ?)',
        ['Mi Amor', 'Artista Ejemplo', spanishId, spanishLyrics]);
    }
  }

  save(): void {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      localStorage.setItem('languageSongsDB', JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  getLanguages(): Language[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM languages ORDER BY name');
    const results: Language[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as number,
        name: row.name as string,
        code: row.code as string,
        created_at: row.created_at as string
      });
    }
    
    stmt.free();
    return results;
  }

  addSong(title: string, artist: string, languageId: number, lyrics: string): number {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('INSERT INTO songs (title, artist, language_id, lyrics) VALUES (?, ?, ?, ?)');
    stmt.run([title, artist, languageId, lyrics]);
    stmt.free();
    
    const songId = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0] as number;
    this.save();
    
    return songId;
  }

  getSongsByLanguage(languageId: number): Song[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM songs WHERE language_id = ? ORDER BY created_at DESC');
    stmt.bind([languageId]);
    
    const results: Song[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as number,
        title: row.title as string,
        artist: row.artist as string,
        language_id: row.language_id as number,
        lyrics: row.lyrics as string,
        created_at: row.created_at as string
      });
    }
    
    stmt.free();
    return results;
  }

  addVocabulary(word: string, translation: string, languageId: number, songId?: number): void {
    if (!this.db) throw new Error('Database not initialized');
    
    const existingStmt = this.db.prepare('SELECT id, frequency_count FROM vocabulary WHERE word = ? AND language_id = ?');
    existingStmt.bind([word, languageId]);
    
    if (existingStmt.step()) {
      const existing = existingStmt.getAsObject() as { id: number; frequency_count: number };
      const updateStmt = this.db.prepare('UPDATE vocabulary SET frequency_count = ? WHERE id = ?');
      updateStmt.run([existing.frequency_count + 1, existing.id]);
      updateStmt.free();
    } else {
      const insertStmt = this.db.prepare('INSERT INTO vocabulary (word, translation, language_id, first_learned_from_song_id) VALUES (?, ?, ?, ?)');
      insertStmt.run([word, translation || '', languageId, songId || null]);
      insertStmt.free();
    }
    
    existingStmt.free();
    this.save();
  }

  getVocabularyByLanguage(languageId: number): Vocabulary[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM vocabulary WHERE language_id = ? ORDER BY frequency_count DESC, word ASC');
    stmt.bind([languageId]);
    
    const results: Vocabulary[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as number,
        word: row.word as string,
        translation: row.translation as string,
        language_id: row.language_id as number,
        frequency_count: row.frequency_count as number,
        first_learned_from_song_id: row.first_learned_from_song_id as number,
        created_at: row.created_at as string
      });
    }
    
    stmt.free();
    return results;
  }

  updateUserProgress(songId: number, currentLine: number, completed: boolean = false): void {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_progress (song_id, current_line, completed, practice_sessions, last_accessed)
      VALUES (?, ?, ?, COALESCE((SELECT practice_sessions FROM user_progress WHERE song_id = ?), 0) + 1, CURRENT_TIMESTAMP)
    `);
    stmt.run([songId, currentLine, completed ? 1 : 0, songId]);
    stmt.free();
    this.save();
  }

  getUserProgress(songId: number): UserProgress | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE song_id = ?');
    stmt.bind([songId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const result: UserProgress = {
        id: row.id as number,
        song_id: row.song_id as number,
        current_line: row.current_line as number,
        completed: Boolean(row.completed),
        practice_sessions: row.practice_sessions as number,
        last_accessed: row.last_accessed as string
      };
      stmt.free();
      return result;
    }
    
    stmt.free();
    return null;
  }

  close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const db = new DatabaseManager();