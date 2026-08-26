import React, { useState, useRef, useEffect } from 'react';
import type { ProviderId, Message, ChatSession } from '../types/chat';
import { streamAIResponse } from '../services/aiProviders';
import { MessageItem } from './MessageItem';
import { ThreeBackground } from './ThreeBackground';
import {
  Send,
  Square,
  Key,
  Sliders,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FolderOpen,
  Brain,
  Bot,
  Zap,
} from 'lucide-react';

interface ChatInterfaceProps {
  apiKey: string;
  provider: ProviderId;
  model: string;
  systemPrompt: string;
  onOpenSettings: () => void;
  onOpenPromptEditor: () => void;
  onOpenSavedChats: () => void;
  currentSession: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onNewChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiKey,
  provider,
  model,
  systemPrompt,
  onOpenSettings,
  onOpenPromptEditor,
  onOpenSavedChats,
  currentSession,
  onUpdateSession,
  onNewChat,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messages = currentSession.messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isGenerating) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const assistantMessageId = `msg-ai-${Date.now()}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      reasoning: '',
      timestamp: Date.now(),
      modelUsed: model,
      isThinking: true,
    };

    const updatedMessages = [...messages, userMessage, initialAssistantMessage];
    const newSessionTitle =
      currentSession.messages.length === 0
        ? userText.slice(0, 30) + (userText.length > 30 ? '...' : '')
        : currentSession.title;

    onUpdateSession({
      ...currentSession,
      title: newSessionTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    let fullContent = '';
    let fullReasoning = '';

    await streamAIResponse(
      provider,
      apiKey,
      model,
      [...messages, userMessage],
      systemPrompt,
      {
        onChunk: (chunkText) => {
          fullContent += chunkText;
          onUpdateSession({
            ...currentSession,
            title: newSessionTitle,
            updatedAt: Date.now(),
            messages: updatedMessages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent, reasoning: fullReasoning, isThinking: false }
                : m
            ),
          });
        },
        onReasoningChunk: (reasoningText) => {
          fullReasoning += reasoningText;
          onUpdateSession({
            ...currentSession,
            title: newSessionTitle,
            updatedAt: Date.now(),
            messages: updatedMessages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent, reasoning: fullReasoning, isThinking: true }
                : m
            ),
          });
        },
        onError: (error) => {
          console.error('Stream error:', error);
          onUpdateSession({
            ...currentSession,
            title: newSessionTitle,
            updatedAt: Date.now(),
            messages: updatedMessages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullContent || `⚠️ [System Error]: ${error.message || 'Transmission failed.'}`, isThinking: false }
                : m
            ),
          });
          setIsGenerating(false);
        },
        onFinish: () => {
          setIsGenerating(false);
          abortControllerRef.current = null;
        },
        signal: abortControllerRef.current.signal,
      }
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-[#030712]/80 text-slate-100 font-sans">
      <ThreeBackground isGenerating={isGenerating} />
      
      {/* HEADER: Fixed and Always Visible */}
      <header className="fixed top-0 left-0 right-0 h-16 px-4 sm:px-6 border-b border-cyan-500/20 glass-panel flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,243,255,0.3)] shrink-0">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-cyan-200 via-teal-300 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap block">
              PROFESSOR-XMD
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 truncate max-w-[120px] sm:max-w-[150px]" title={model}>
                Model: <span className="text-cyan-300 truncate">{model}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shrink-0">
                <Zap className="w-2 h-2 text-cyan-400" />
                {provider.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end shrink-0">
          <button onClick={onNewChat} className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all" title="New Chat">
            <PlusCircle className="w-4 h-4 text-cyan-400" />
          </button>
          <button onClick={onOpenSavedChats} className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all" title="Saved Chats">
            <FolderOpen className="w-4 h-4 text-pink-400" />
          </button>
          <button onClick={onOpenPromptEditor} className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all" title="Persona Prompt">
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all" title="API Key">
            <Key className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Conversation Stream Container - Only this scrolls */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-24 pb-40 space-y-4 max-w-5xl mx-auto w-full scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-12">
            <div className="w-20 h-20 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(0,243,255,0.2)] animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-cyan-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-cyan-100 mb-2">
              NEURAL CONVERSATION ACTIVE
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-6 font-sans">
              Professor is initialized and awaiting your inquiry. Ask a question, solve a problem, or request code generation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
              {["Hey Professor, explain quantum computing like we're having coffee!", "Help me design a clean React component architecture.", "Write a python script to simulate planetary orbits.", "What are your top 3 witty tech philosophies?"].map((prompt, idx) => (
                <button key={idx} onClick={() => setInputMessage(prompt)} className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition-all font-mono text-left group flex items-start justify-between">
                  <span>{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => <MessageItem key={message.id} message={message} />)
        )}
        
        {isGenerating && messages[messages.length - 1]?.isThinking && (
          <div className="w-full max-w-[85%] my-2 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 flex items-center gap-3 font-mono text-xs animate-pulse-glow">
            <Brain className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="tracking-wide">PROFESSOR IS SYNTHESIZING NEURAL THOUGHT MATRICES...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* FOOTER: Fixed and Always Visible */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-cyan-500/20 glass-panel shrink-0 z-50">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/30 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmit message to Professor... (Shift + Enter for newline)"
              rows={2}
              className="w-full bg-transparent p-4 pr-14 text-sm font-sans text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {isGenerating ? (
                <button onClick={handleStop} className="p-2.5 rounded-xl bg-pink-950/80 border border-pink-500/50 text-pink-300 hover:bg-pink-900 transition-all shadow-[0_0_12px_rgba(255,0,127,0.4)]" title="Stop Generating">
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!inputMessage.trim()} className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:shadow-[0_0_15px_rgba(0,243,255,0.6)] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200" title="Send Transmission">
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Powered by PROFESSOR-XMD - Clean & Simple */}
          <div className="flex justify-center items-center mt-3">
            <span className="text-[11px] font-mono text-slate-500 tracking-wide">
              <span className="text-cyan-500/60">✦</span> Powered by <span className="text-cyan-400 font-semibold">PROFESSOR-XMD</span> <span className="text-cyan-500/60"></span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
