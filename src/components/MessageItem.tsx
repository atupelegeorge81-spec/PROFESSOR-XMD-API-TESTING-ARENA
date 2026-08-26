import React, { useState } from 'react';
import type { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/tokyo-night-dark.css';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  User,
  Sparkles,
  Copy,
  Check,
  Bot,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copied, setCopied] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSystem) return null;

  return (
    <div
      className={`w-full my-4 flex flex-col transition-all duration-300 ${
        isUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 transition-all duration-300 relative group border ${
          isUser
            ? 'glass-panel-magenta border-pink-500/30 text-slate-100 rounded-tr-none shadow-[0_4px_20px_rgba(255,0,127,0.15)]'
            : 'glass-panel-glow border-cyan-500/30 text-slate-100 rounded-tl-none shadow-[0_4px_20px_rgba(0,243,255,0.15)]'
        }`}
      >
        {/* Turn Header */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800/80 font-mono text-xs">
          <div className="flex items-center gap-2">
            {isUser ? (
              <div className="w-6 h-6 rounded-lg bg-pink-950 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <User className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <span
              className={`font-bold tracking-wider ${
                isUser ? 'neon-text-magenta' : 'neon-text-cyan'
              }`}
            >
              {isUser ? 'OPERATOR' : 'PROFESSOR'}
            </span>
            {message.modelUsed && !isUser && (
              <span className="text-[10px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
                {message.modelUsed}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded hover:bg-slate-800/50"
              title="Copy message content"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Separated Reasoning / Thinking Process Area (for models with reasoning mode) */}
        {message.reasoning && (
          <div className="mb-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 overflow-hidden text-xs">
            <button
              onClick={() => setIsReasoningOpen(!isReasoningOpen)}
              className="w-full px-3.5 py-2.5 bg-cyan-950/30 hover:bg-cyan-950/50 flex items-center justify-between text-cyan-300 font-mono transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-bold tracking-wider uppercase text-[11px]">
                  THINKING & REASONING PROCESS
                </span>
              </div>
              {isReasoningOpen ? (
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {isReasoningOpen && (
              <div className="p-3.5 text-slate-300 font-mono space-y-2 leading-relaxed max-h-60 overflow-y-auto border-t border-cyan-500/10 whitespace-pre-wrap selection:bg-cyan-500/30">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed font-sans overflow-x-auto selection:bg-cyan-500/30">
          {message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          ) : message.isThinking ? (
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm py-1">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="animate-pulse">Synthesizing response matrices...</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
