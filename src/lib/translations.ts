// Basic translation dictionary for common words
// In a real app, this would use a translation API

interface TranslationDict {
  [language: string]: {
    [word: string]: string
  }
}

const commonTranslations: TranslationDict = {
  ko: {
    '사랑': 'love',
    '너': 'you',
    '나': 'I/me', 
    '우리': 'we/us',
    '마음': 'heart/mind',
    '시간': 'time',
    '안녕': 'hello/goodbye',
    '기뻐': 'happy/glad',
    '함께': 'together',
    '언제까지나': 'forever',
    '만나서': 'meeting/to meet'
  },
  es: {
    'amor': 'love',
    'corazón': 'heart',
    'vida': 'life',
    'hola': 'hello',
    'mucho': 'much/very',
    'siempre': 'always',
    'para': 'for',
    'contigo': 'with you',
    'quiero': 'I want/I love',
    'eres': 'you are',
    'mi': 'my'
  },
  fr: {
    'amour': 'love',
    'cœur': 'heart',
    'vie': 'life',
    'bonjour': 'hello',
    'toujours': 'always',
    'avec': 'with',
    'pour': 'for',
    'très': 'very',
    'mon': 'my',
    'tu': 'you',
    'je': 'I'
  },
  ja: {
    '愛': 'love',
    '心': 'heart',
    '君': 'you',
    '僕': 'I (male)',
    '私': 'I (female)',
    '時間': 'time',
    'こんにちは': 'hello',
    'いつも': 'always',
    '一緒': 'together',
    '大好き': 'love very much'
  },
  de: {
    'liebe': 'love',
    'herz': 'heart',
    'leben': 'life',
    'hallo': 'hello',
    'immer': 'always',
    'mit': 'with',
    'für': 'for',
    'sehr': 'very',
    'mein': 'my',
    'du': 'you',
    'ich': 'I'
  },
  it: {
    'amore': 'love',
    'cuore': 'heart',
    'vita': 'life',
    'ciao': 'hello/bye',
    'sempre': 'always',
    'con': 'with',
    'per': 'for',
    'molto': 'very',
    'mio': 'my',
    'tu': 'you',
    'io': 'I'
  },
  pt: {
    'amor': 'love',
    'coração': 'heart',
    'vida': 'life',
    'olá': 'hello',
    'sempre': 'always',
    'com': 'with',
    'para': 'for',
    'muito': 'very',
    'meu': 'my',
    'você': 'you',
    'eu': 'I'
  },
  zh: {
    '爱': 'love',
    '心': 'heart',
    '生活': 'life',
    '你好': 'hello',
    '总是': 'always',
    '和': 'with',
    '为': 'for',
    '很': 'very',
    '我的': 'my',
    '你': 'you',
    '我': 'I'
  },
  hi: {
    'प्रेम': 'love',
    'दिल': 'heart', 
    'जीवन': 'life',
    'नमस्ते': 'hello',
    'हमेशा': 'always',
    'साथ': 'with',
    'के लिए': 'for',
    'बहुत': 'very',
    'मेरा': 'my',
    'तुम': 'you',
    'मैं': 'I'
  },
  ar: {
    'حب': 'love',
    'قلب': 'heart',
    'حياة': 'life',
    'مرحبا': 'hello',
    'دائما': 'always',
    'مع': 'with',
    'لـ': 'for',
    'جدا': 'very',
    'لي': 'my',
    'أنت': 'you',
    'أنا': 'I'
  }
}

export function getTranslation(word: string, languageCode: string): string {
  const lang = commonTranslations[languageCode]
  if (!lang) return ''
  
  // Try exact match first
  const exactMatch = lang[word.toLowerCase()]
  if (exactMatch) return exactMatch
  
  // Try partial match for compound words
  for (const [key, value] of Object.entries(lang)) {
    if (word.toLowerCase().includes(key) || key.includes(word.toLowerCase())) {
      return value
    }
  }
  
  return ''
}

export function hasTranslation(word: string, languageCode: string): boolean {
  return getTranslation(word, languageCode) !== ''
}

export function getAvailableLanguages(): string[] {
  return Object.keys(commonTranslations)
}