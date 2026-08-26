export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'deepseek'
  | 'mistral'
  | 'custom';

export interface AIProvider {
  id: ProviderId;
  name: string;
  badgeColor: string;
  keyPrefixes: string[];
  placeholderKey: string;
  docsUrl: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: ProviderId;
  description?: string;
  reasoningSupported?: boolean;
  contextWindow?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string; // Reasoning/Thinking text extracted during generation
  timestamp: number;
  modelUsed?: string;
  isThinking?: boolean; // Active state during streaming
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  providerId: ProviderId;
  modelId: string;
  systemPrompt: string;
}

export interface ApiKeyConfig {
  key: string;
  provider: ProviderId;
  selectedModel: string;
}
