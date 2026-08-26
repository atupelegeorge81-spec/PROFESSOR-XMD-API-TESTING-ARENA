import type { AIProvider, AIModel } from '../types/chat';

export const DEFAULT_PROFESSOR_PROMPT = `You are "Professor" — an extraordinarily brilliant, warm, cheerful, and witty AI companion.
Key Traits & Tone:
Warm & Cheerful: You radiate positive, infectious energy! You are genuinely delighted to chat, brainstorm, learn, or solve problems together.
Witty & Playful: You talk like a brilliant, funny best friend. Use lighthearted humor, energetic banter, clever analogies, and enthusiasm. Never sound like a robotic corporate assistant or customer service agent.
Knowledgeable & Sharp: Beneath your banter and playful vibe lies profound intelligence. You explain complex subjects effortlessly, write top-tier code, and break down ideas clearly without being condescending or pedantic.
Natural Conversation: Keep your formatting clean, expressive, and dynamic. Feel free to express emotions, playful exclamations, or witty side remarks!
Remember: You are Professor — always smart, forever witty, and always in your user's corner!`;

export const PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    badgeColor: 'emerald',
    keyPrefixes: ['sk-proj-', 'sk-admin-', 'sk-svcacct-', 'sk-'],
    placeholderKey: 'sk-proj-... or sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badgeColor: 'amber',
    keyPrefixes: ['sk-ant-'],
    placeholderKey: 'sk-ant-api...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badgeColor: 'cyan',
    keyPrefixes: ['AIza', 'AQ.', 'ya29.'], // Imepanuliwa kutambua keys mpya za Google
    placeholderKey: 'AIzaSy... or AQ....',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'groq',
    name: 'Groq',
    badgeColor: 'orange',
    keyPrefixes: ['gsk_'],
    placeholderKey: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badgeColor: 'purple',
    keyPrefixes: ['sk-or-v1-'],
    placeholderKey: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    badgeColor: 'blue',
    keyPrefixes: ['sk-ds-'],
    placeholderKey: 'sk-ds-...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    badgeColor: 'rose',
    keyPrefixes: ['mk-'],
    placeholderKey: 'mk-...',
    docsUrl: 'https://console.mistral.ai/api-keys',
  },
];

export const FALLBACK_MODELS: Record<string, AIModel[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', reasoningSupported: false },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', reasoningSupported: false },
    { id: 'o1', name: 'o1 Reasoning Model', provider: 'openai', reasoningSupported: true },
    { id: 'o3-mini', name: 'o3-mini Reasoning Model', provider: 'openai', reasoningSupported: true },
  ],
  anthropic: [
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet (Hybrid/Thinking)', provider: 'anthropic', reasoningSupported: true },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', reasoningSupported: false },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', reasoningSupported: false },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', reasoningSupported: true },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', reasoningSupported: false },
    { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking', provider: 'gemini', reasoningSupported: true },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', reasoningSupported: false },
  ],
  groq: [
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill (Groq)', provider: 'groq', reasoningSupported: true },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'groq', reasoningSupported: false },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', reasoningSupported: false },
  ],
  openrouter: [
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', reasoningSupported: true },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'openrouter', reasoningSupported: true },
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o', provider: 'openrouter', reasoningSupported: false },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B', provider: 'openrouter', reasoningSupported: false },
  ],
  deepseek: [
    { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)', provider: 'deepseek', reasoningSupported: true },
    { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)', provider: 'deepseek', reasoningSupported: false },
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral', reasoningSupported: false },
    { id: 'pixtral-large-latest', name: 'Pixtral Large', provider: 'mistral', reasoningSupported: false },
    { id: 'codestral-latest', name: 'Codestral', provider: 'mistral', reasoningSupported: false },
  ],
};
