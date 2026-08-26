import React, { useState } from 'react';
import { DEFAULT_PROFESSOR_PROMPT } from '../constants/prompts';
import { Sliders, RotateCcw, Trash2, Check, X, Sparkles } from 'lucide-react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSavePrompt: (prompt: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSavePrompt,
}) => {
  const [promptText, setPromptText] = useState(systemPrompt);

  if (!isOpen) return null;

  const handleResetDefault = () => {
    setPromptText(DEFAULT_PROFESSOR_PROMPT);
  };

  const handleClear = () => {
    setPromptText('');
  };

  const handleSave = () => {
    onSavePrompt(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,243,255,0.2)] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-cyan-200 tracking-wide">
                SYSTEM PROMPT & PERSONA EDITOR
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Configure the core personality, directives, and tone for Professor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea Input */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CURRENT INSTRUCTIONS ({promptText.length} characters)
            </span>
            <button
              onClick={handleResetDefault}
              className="text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to "Professor" Persona
            </button>
          </div>

          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={10}
            placeholder="Enter custom system directives or persona rules..."
            className="w-full bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 text-xs font-mono text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all leading-relaxed"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
          <button
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/40 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Prompt
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.7)] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Apply System Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
