import type { ProviderId, AIModel, Message } from '../types/chat';
import { PROVIDERS, FALLBACK_MODELS } from '../constants/prompts';

export function detectProviderFromKey(key: string): ProviderId | null {
  const cleanKey = key.trim();
  if (!cleanKey) return null;

  // 1. Angalia prefixes maalum kwanza
  for (const provider of PROVIDERS) {
    for (const prefix of provider.keyPrefixes) {
      if (cleanKey.startsWith(prefix)) {
        return provider.id;
      }
    }
  }

  // 2. Smart fallbacks kwa keys za jumla
  if (cleanKey.startsWith('sk-')) {
    if (cleanKey.includes('or-v1')) return 'openrouter';
    if (cleanKey.includes('ds-')) return 'deepseek';
    return 'openai'; // Default kwa sk- nyingine
  }
  
  // 3. Tambua tokens za Google zinazoweza kuanza na AQ. au ya29.
  if (cleanKey.startsWith('AQ.') || cleanKey.startsWith('ya29.')) {
    return 'gemini';
  }

  // 4. Rudisha null badala ya kulazimisha OpenAI. Mtumiaji atachagua manual.
  return null;
}

export async function fetchModelsForProvider(provider: ProviderId, apiKey: string): Promise<AIModel[]> {
  const cleanKey = apiKey.trim();
  const fallbacks = FALLBACK_MODELS[provider] || [];

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${cleanKey}` } });
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data)) {
          return data.data.filter((m: { id: string }) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3'))
            .map((m: { id: string }) => ({ id: m.id, name: m.id, provider: 'openai' as ProviderId, reasoningSupported: m.id.startsWith('o1') || m.id.startsWith('o3') }));
        }
      }
    } else if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${cleanKey}` } });
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data)) {
          return data.data.slice(0, 40).map((m: { id: string; name?: string }) => ({
            id: m.id, name: m.name || m.id, provider: 'openrouter' as ProviderId,
            reasoningSupported: m.id.includes('r1') || m.id.includes('thinking') || m.id.includes('o1') || m.id.includes('3.7'),
          }));
        }
      }
    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${cleanKey}` } });
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data)) {
          return data.data.map((m: { id: string }) => ({ id: m.id, name: m.id, provider: 'groq' as ProviderId, reasoningSupported: m.id.includes('r1') }));
        }
      }
    } else if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.models && Array.isArray(data.models)) {
          return data.models.filter((m: { name: string }) => m.name.includes('gemini'))
            .map((m: { name: string; displayName?: string }) => {
              const id = m.name.replace('models/', '');
              return { id, name: m.displayName || id, provider: 'gemini' as ProviderId, reasoningSupported: id.includes('thinking') || id.includes('2.5') };
            });
        }
      }
    }
  } catch (err) {
    console.warn('Dynamic model fetch failed, using fallback list:', err);
  }
  return fallbacks;
}

interface StreamCallbacks {
  onChunk: (chunkText: string) => void;
  onReasoningChunk?: (reasoningText: string) => void;
  onError: (error: Error) => void;
  onFinish: () => void;
  signal?: AbortSignal;
}

export async function streamAIResponse(provider: ProviderId, apiKey: string, model: string, messages: Message[], systemPrompt: string, callbacks: StreamCallbacks) {
  const { onChunk, onReasoningChunk, onError, onFinish, signal } = callbacks;
  try {
    if (provider === 'openai' || provider === 'groq' || provider === 'openrouter' || provider === 'deepseek') {
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({ model, messages: [...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), ...messages.map((m) => ({ role: m.role, content: m.content }))], stream: true }),
        signal,
      });
      if (!res.ok) throw new Error(`API Error [${res.status}]: ${await res.text()}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Response body stream unreadable');
      const decoder = new TextDecoder();
      let buffer = '';
      let isInThinkBlock = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':') || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta;
              if (!delta) continue;
              if (delta.reasoning_content && onReasoningChunk) onReasoningChunk(delta.reasoning_content);
              if (delta.content) {
                let contentStr = delta.content;
                if (contentStr.includes('<think>')) {
                  isInThinkBlock = true;
                  const parts = contentStr.split('<think>');
                  if (parts[0]) onChunk(parts[0]);
                  contentStr = parts[1] || '';
                }
                if (isInThinkBlock) {
                  if (contentStr.includes('</think>')) {
                    isInThinkBlock = false;
                    const parts = contentStr.split('</think>');
                    if (parts[0] && onReasoningChunk) onReasoningChunk(parts[0]);
                    if (parts[1]) onChunk(parts[1]);
                  } else {
                    if (onReasoningChunk) onReasoningChunk(contentStr);
                  }
                } else {
                  onChunk(contentStr);
                }
              }
            } catch { /* Ignore partial JSON */ }
          }
        }
      }
      onFinish();
      return;
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey.trim(), 'anthropic-version': '2023-06-01', 'dangerously-allow-browser': 'true' },
        body: JSON.stringify({ model, system: systemPrompt, messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })), max_tokens: 4096, stream: true }),
        signal,
      });
      if (!res.ok) throw new Error(`Anthropic API Error [${res.status}]: ${await res.text()}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Response body stream unreadable');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.type === 'content_block_delta') {
                if (json.delta?.type === 'text_delta') onChunk(json.delta.text);
                else if (json.delta?.type === 'thinking_delta' && onReasoningChunk) onReasoningChunk(json.delta.thinking);
              }
            } catch { /* Ignore partial chunk */ }
          }
        }
      }
      onFinish();
      return;
    }

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        }),
        signal,
      });
      if (!res.ok) throw new Error(`Gemini API Error [${res.status}]: ${await res.text()}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Response body stream unreadable');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) onChunk(text);
            } catch { /* Ignore partial chunk */ }
          }
        }
      }
      onFinish();
      return;
    }

    throw new Error(`Provider ${provider} streaming is not supported`);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      onFinish();
    } else {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
