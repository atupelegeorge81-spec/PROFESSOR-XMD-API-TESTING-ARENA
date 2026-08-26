import { useState, useEffect, useRef } from 'react';
import type { ProviderId, ChatSession } from './types/chat';
import { DEFAULT_PROFESSOR_PROMPT } from './constants/prompts';
import { ApiKeySetup } from './components/ApiKeySetup';
import { ChatInterface } from './components/ChatInterface';
import { SystemPromptModal } from './components/SystemPromptModal';
import { SavedChatsSidebar } from './components/SavedChatsSidebar';

export function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('professor_xmd_api_key') || '');
  const [provider, setProvider] = useState<ProviderId>(() => (localStorage.getItem('professor_xmd_provider') as ProviderId) || 'openai');
  const [model, setModel] = useState<string>(() => localStorage.getItem('professor_xmd_model') || 'gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState<string>(() => localStorage.getItem('professor_xmd_prompt') || DEFAULT_PROFESSOR_PROMPT);
  
  const [isConfigured, setIsConfigured] = useState<boolean>(() => localStorage.getItem('professor_xmd_configured') === 'true');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(() => localStorage.getItem('professor_xmd_prompt_modal') === 'true');
  const [isSavedChatsOpen, setIsSavedChatsOpen] = useState<boolean>(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('professor_xmd_chat_sessions');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => localStorage.getItem('professor_xmd_current_session') || '');

  const isPromptModalOpenRef = useRef(isPromptModalOpen);
  const isSavedChatsOpenRef = useRef(isSavedChatsOpen);

  useEffect(() => { isPromptModalOpenRef.current = isPromptModalOpen; }, [isPromptModalOpen]);
  useEffect(() => { isSavedChatsOpenRef.current = isSavedChatsOpen; }, [isSavedChatsOpen]);

  // Save to LocalStorage
  useEffect(() => { if (apiKey) localStorage.setItem('professor_xmd_api_key', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('professor_xmd_provider', provider); }, [provider]);
  useEffect(() => { localStorage.setItem('professor_xmd_model', model); }, [model]);
  useEffect(() => { localStorage.setItem('professor_xmd_prompt', systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem('professor_xmd_configured', isConfigured.toString()); }, [isConfigured]);
  useEffect(() => { localStorage.setItem('professor_xmd_prompt_modal', isPromptModalOpen.toString()); }, [isPromptModalOpen]);
  useEffect(() => { localStorage.setItem('professor_xmd_current_session', currentSessionId); }, [currentSessionId]);
  useEffect(() => {
    try { localStorage.setItem('professor_xmd_chat_sessions', JSON.stringify(sessions)); } catch (err) { console.warn(err); }
  }, [sessions]);

  // BULLETPROOF BACK BUTTON HANDLER (Prevents app exit on mobile)
  useEffect(() => {
    const handlePopState = () => {
      if (isSavedChatsOpenRef.current) {
        setIsSavedChatsOpen(false);
      } else if (isPromptModalOpenRef.current) {
        setIsPromptModalOpen(false);
      }
      // Always push a state to prevent the browser from navigating away/exiting
      window.history.pushState({ trapped: true }, '', window.location.href);
    };

    // Initial trap setup on mount
    window.history.pushState({ trapped: true }, '', window.location.href);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Wrapper functions to open modals with history push
  const handleOpenPromptEditor = () => {
    setIsPromptModalOpen(true);
    window.history.pushState({ modal: 'prompt' }, '', window.location.href);
  };

  const handleOpenSavedChats = () => {
    setIsSavedChatsOpen(true);
    window.history.pushState({ modal: 'saved' }, '', window.location.href);
  };

  // Session Management
  const createNewSession = (prov: ProviderId = provider, mod: string = model, prompt: string = systemPrompt): ChatSession => {
    return { id: `session-${Date.now()}`, title: 'New Neural Transmission', createdAt: Date.now(), updatedAt: Date.now(), messages: [], providerId: prov, modelId: mod, systemPrompt: prompt };
  };

  const [currentSession, setCurrentSession] = useState<ChatSession>(() => {
    if (currentSessionId) {
      try {
        const stored = localStorage.getItem('professor_xmd_chat_sessions');
        if (stored) {
          const found = JSON.parse(stored).find((s: ChatSession) => s.id === currentSessionId);
          if (found) return found;
        }
      } catch {}
    }
    return createNewSession();
  });

  const handleApiKeySetupComplete = (key: string, prov: ProviderId, selectedModel: string) => {
    setApiKey(key); setProvider(prov); setModel(selectedModel); setIsConfigured(true);
    if (currentSession.messages.length === 0) {
      const updated = { ...currentSession, providerId: prov, modelId: selectedModel };
      setCurrentSession(updated); setCurrentSessionId(updated.id);
    }
  };

  const handleUpdateSession = (updatedSession: ChatSession) => {
    setCurrentSession(updatedSession); setCurrentSessionId(updatedSession.id);
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === updatedSession.id);
      return exists ? prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)) : [updatedSession, ...prev];
    });
  };

  const handleNewChat = () => {
    const newSess = createNewSession(provider, model, systemPrompt);
    setCurrentSession(newSess); setCurrentSessionId(newSess.id);
  };

  const handleSelectSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSession(target); setCurrentSessionId(target.id);
      if (target.providerId) setProvider(target.providerId);
      if (target.modelId) setModel(target.modelId);
      if (target.systemPrompt) setSystemPrompt(target.systemPrompt);
      setIsSavedChatsOpen(false); // Auto-close sidebar
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSession.id === sessionId) handleNewChat();
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30">
      {!isConfigured ? (
        <ApiKeySetup onComplete={handleApiKeySetupComplete} initialApiKey={apiKey} initialProvider={provider} initialModel={model} />
      ) : (
        <>
          <ChatInterface
            apiKey={apiKey} provider={provider} model={model} systemPrompt={systemPrompt}
            onOpenSettings={() => setIsConfigured(false)}
            onOpenPromptEditor={handleOpenPromptEditor}
            onOpenSavedChats={handleOpenSavedChats}
            currentSession={currentSession} onUpdateSession={handleUpdateSession} onNewChat={handleNewChat}
          />
          <SystemPromptModal
            isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} systemPrompt={systemPrompt}
            onSavePrompt={(newPrompt) => { setSystemPrompt(newPrompt); setCurrentSession((prev) => ({ ...prev, systemPrompt: newPrompt })); }}
          />
          <SavedChatsSidebar
            isOpen={isSavedChatsOpen} onClose={() => setIsSavedChatsOpen(false)} sessions={sessions}
            currentSessionId={currentSession.id} onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession} onNewChat={handleNewChat}
          />
        </>
      )}
    </div>
  );
}
export default App;
