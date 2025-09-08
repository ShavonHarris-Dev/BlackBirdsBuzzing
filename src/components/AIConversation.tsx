import { useState, useEffect, useRef } from 'react'
import { useDatabaseContext } from '../hooks/useDatabase'
import { aiService, type AIConversationMessage, type AIConversationContext } from '../lib/aiService'

interface AIConversationProps {
  onBack: () => void
}

export default function AIConversation({ onBack }: AIConversationProps) {
  const { currentLanguage, getVocabularyByLanguage, isInitialized } = useDatabaseContext()
  const [messages, setMessages] = useState<AIConversationMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [isStarted, setIsStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!isInitialized || !currentLanguage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const vocabulary = getVocabularyByLanguage(currentLanguage.id)

  const startConversation = async () => {
    setIsLoading(true)
    try {
      const context: AIConversationContext = {
        language: currentLanguage.name,
        userLevel: 'beginner', // Could be user-configurable
        vocabulary: vocabulary.map(v => v.word).slice(0, 20)
      }

      const greeting = await aiService.startConversation(context)
      setMessages([greeting])
      setSessionId(greeting.id) // Using message ID as session ID for simplicity
      setIsStarted(true)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      const context: AIConversationContext = {
        language: currentLanguage.name,
        userLevel: 'beginner',
        vocabulary: vocabulary.map(v => v.word).slice(0, 20)
      }

      const response = await aiService.sendMessage(sessionId, userMessage, context)
      
      // Add user message first, then AI response
      setMessages(prev => [
        ...prev,
        {
          id: 'user_' + Date.now(),
          role: 'user',
          content: userMessage,
          timestamp: Date.now()
        },
        response
      ])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        id: 'error_' + Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    setIsStarted(false)
    setSessionId('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <span>←</span>
            <span>Back to Practice</span>
          </button>
          {isStarted && (
            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              New Conversation
            </button>
          )}
        </div>

        <div className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Conversation Practice
          </h1>
          <p className="text-gray-600">
            Practice {currentLanguage.name} with an AI tutor using your learned vocabulary
          </p>
        </div>
      </div>

      {!isStarted ? (
        /* Start Screen */
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to start your {currentLanguage.name} conversation?
            </h2>
            <p className="text-gray-600 mb-6">
              The AI will help you practice using your vocabulary from songs you've learned.
              Don't worry about making mistakes - that's how we learn!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Your Vocabulary Ready:</h3>
              <div className="text-2xl font-bold text-blue-600">{vocabulary.length}</div>
              <div className="text-sm text-gray-600">words from your songs</div>
            </div>

            <button
              onClick={startConversation}
              disabled={isLoading || vocabulary.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Starting...' : 'Start Conversation'}
            </button>

            {vocabulary.length === 0 && (
              <p className="text-amber-600 text-sm mt-4">
                Upload some {currentLanguage.name} songs first to build vocabulary for conversation!
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Conversation Interface */
        <div className="bg-white rounded-lg shadow-md flex flex-col h-96">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message in ${currentLanguage.name}...`}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Try using words from your vocabulary! Press Enter to send.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}