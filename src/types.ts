// Cloud Functions Input/Output Types

export interface ChatWithLexiRequest {
  message: string;
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userId: string;
  unitId?: string;
}

export interface ChatWithLexiResponse {
  response: string;
  timestamp: number;
  sessionId: string;
}

// Message interface for chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// User session interface
export interface UserSession {
  userId: string;
  unitId: string;
  messages: ChatMessage[];
  score?: number;
  completedAt?: number;
}
