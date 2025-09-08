// AI Service for language learning assistance
// This would typically integrate with OpenAI API, but for demo purposes, 
// we'll create a mock service that could be easily replaced

export interface AIConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface AITranslationResult {
  word: string
  translation: string
  pronunciation?: string
  example?: string
  confidence: number
}

export interface AIConversationContext {
  language: string
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  vocabulary: string[]
  topic?: string
}

// Mock AI responses for demonstration - in production, replace with actual API calls
const mockResponses = {
  korean: {
    greetings: [
      "안녕하세요! 한국어 연습을 도와드리겠습니다. (Hello! I'll help you practice Korean.)",
      "반갑습니다! 오늘은 어떤 주제로 이야기할까요? (Nice to meet you! What topic shall we talk about today?)",
      "좋은 하루예요! 한국어 실력이 어느 정도인가요? (Good day! What's your Korean level?)"
    ],
    responses: [
      "네, 잘 했어요! (Yes, well done!)",
      "좋은 표현이네요! (That's a good expression!)",
      "더 연습해봐요. (Let's practice more.)",
      "정확합니다! (That's correct!)",
      "한국어가 늘고 있어요! (Your Korean is improving!)"
    ]
  },
  spanish: {
    greetings: [
      "¡Hola! Vamos a practicar español juntos. (Hello! Let's practice Spanish together.)",
      "¡Bienvenido! ¿De qué quieres hablar hoy? (Welcome! What do you want to talk about today?)",
      "¡Qué tal! ¿Cómo está tu español? (How's it going! How is your Spanish?)"
    ],
    responses: [
      "¡Muy bien! (Very good!)",
      "¡Excelente! (Excellent!)",
      "¡Sigue practicando! (Keep practicing!)",
      "¡Correcto! (Correct!)",
      "Tu español está mejorando. (Your Spanish is improving.)"
    ]
  },
  french: {
    greetings: [
      "Bonjour! Je vais vous aider avec le français. (Hello! I'm going to help you with French.)",
      "Salut! De quoi voulez-vous parler? (Hi! What do you want to talk about?)",
      "Comment allez-vous? Pratiquons le français! (How are you? Let's practice French!)"
    ],
    responses: [
      "Très bien! (Very good!)",
      "Parfait! (Perfect!)",
      "Continuez! (Continue!)",
      "C'est correct! (That's correct!)",
      "Votre français s'améliore! (Your French is improving!)"
    ]
  }
}

class AIService {
  private conversationHistory: Map<string, AIConversationMessage[]> = new Map()

  async startConversation(context: AIConversationContext): Promise<AIConversationMessage> {
    const sessionId = this.generateSessionId()
    const language = context.language.toLowerCase()
    
    // Get appropriate greeting based on language
    const greetings = mockResponses[language as keyof typeof mockResponses]?.greetings || [
      "Hello! Let's practice together!",
      "Welcome! Ready to practice?",
      "Hi there! Let's start learning!"
    ]
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    
    const message: AIConversationMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: greeting,
      timestamp: Date.now()
    }
    
    this.conversationHistory.set(sessionId, [message])
    return message
  }

  async sendMessage(
    sessionId: string, 
    userMessage: string, 
    context: AIConversationContext
  ): Promise<AIConversationMessage> {
    const history = this.conversationHistory.get(sessionId) || []
    
    // Add user message to history
    const userMsg: AIConversationMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }
    history.push(userMsg)
    
    // Generate AI response (mock implementation)
    const aiResponse = await this.generateAIResponse(userMessage, context, history)
    history.push(aiResponse)
    
    this.conversationHistory.set(sessionId, history)
    return aiResponse
  }

  async translateWord(word: string, fromLanguage: string, toLanguage: string = 'en'): Promise<AITranslationResult> {
    // Mock translation service - in production, use actual translation API
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    
    // Simple mock translations
    const mockTranslations: Record<string, Record<string, string>> = {
      ko: {
        '사랑': 'love',
        '마음': 'heart/mind',
        '시간': 'time',
        '친구': 'friend',
        '학교': 'school'
      },
      es: {
        'amor': 'love',
        'corazón': 'heart',
        'tiempo': 'time',
        'amigo': 'friend',
        'escuela': 'school'
      }
    }
    
    const translation = mockTranslations[fromLanguage]?.[word.toLowerCase()] || `[Translation for ${word}]`
    
    return {
      word,
      translation,
      pronunciation: `[${word}]`,
      example: `Example: ${word} in a sentence.`,
      confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
    }
  }

  async generateWritingPrompt(vocabulary: string[], language: string): Promise<string> {
    const prompts = [
      `Write a short story using these words: ${vocabulary.slice(0, 5).join(', ')}`,
      `Create a song verse with: ${vocabulary.slice(0, 3).join(', ')}`,
      `Describe your day using: ${vocabulary.slice(0, 4).join(', ')}`,
      `Write about your dreams with: ${vocabulary.slice(0, 3).join(', ')}`
    ]
    
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  private async generateAIResponse(
    userMessage: string, 
    context: AIConversationContext,
    history: AIConversationMessage[]
  ): Promise<AIConversationMessage> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    const language = context.language.toLowerCase()
    const responses = mockResponses[language as keyof typeof mockResponses]?.responses || [
      "Great! Keep practicing!",
      "That's good!",
      "Nice work!",
      "Let's continue!",
      "You're doing well!"
    ]
    
    // Simple response logic
    let response = responses[Math.floor(Math.random() * responses.length)]
    
    // Add contextual responses based on user input
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      response = language === 'ko' ? '안녕하세요! 어떻게 지내세요?' :
                 language === 'es' ? '¡Hola! ¿Cómo estás?' :
                 language === 'fr' ? 'Bonjour! Comment ça va?' :
                 'Hello! How are you?'
    } else if (userMessage.toLowerCase().includes('thank')) {
      response = language === 'ko' ? '천만에요! (You\'re welcome!)' :
                 language === 'es' ? '¡De nada! (You\'re welcome!)' :
                 language === 'fr' ? 'De rien! (You\'re welcome!)' :
                 'You\'re welcome!'
    } else if (userMessage.length > 50) {
      response = language === 'ko' ? '와! 긴 문장이네요. 잘 했어요!' :
                 language === 'es' ? '¡Wow! Esa es una oración larga. ¡Bien hecho!' :
                 language === 'fr' ? 'Wow! C\'est une longue phrase. Bien fait!' :
                 'Wow! That\'s a long sentence. Well done!'
    }
    
    // Add a follow-up question sometimes
    if (Math.random() > 0.6) {
      const questions = language === 'ko' ? [
        ' 더 말해보세요! (Tell me more!)',
        ' 어떻게 생각하세요? (What do you think?)',
        ' 다른 예시가 있나요? (Do you have another example?)'
      ] : language === 'es' ? [
        ' ¡Cuéntame más! (Tell me more!)',
        ' ¿Qué piensas? (What do you think?)',
        ' ¿Tienes otro ejemplo? (Do you have another example?)'
      ] : language === 'fr' ? [
        ' Dites-moi plus! (Tell me more!)',
        ' Qu\'en pensez-vous? (What do you think?)',
        ' Avez-vous un autre exemple? (Do you have another example?)'
      ] : [
        ' Tell me more!',
        ' What do you think?',
        ' Do you have another example?'
      ]
      
      response += questions[Math.floor(Math.random() * questions.length)]
    }
    
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private generateMessageId(): string {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  getConversationHistory(sessionId: string): AIConversationMessage[] {
    return this.conversationHistory.get(sessionId) || []
  }

  clearConversation(sessionId: string): void {
    this.conversationHistory.delete(sessionId)
  }
}

export const aiService = new AIService()