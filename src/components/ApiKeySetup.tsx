import React, { useState, useEffect } from 'react';
import type { ProviderId, AIModel } from '../types/chat';
import { PROVIDERS, FALLBACK_MODELS } from '../constants/prompts';
import { detectProviderFromKey, fetchModelsForProvider } from '../services/aiProviders';
import { Key, Sparkles, Loader2, Cpu, Check, AlertCircle, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

interface ApiKeySetupProps {
  onComplete: (apiKey: string, provider: ProviderId, model: string) => void;
  initialApiKey?: string;
  initialProvider?: ProviderId;
  initialModel?: string;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({
  onComplete,
  initialApiKey = '',
  initialProvider,
  initialModel,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(initialProvider || null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || '');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [autoDetected, setAutoDetected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      if (!initialProvider) {
        setSelectedProvider(null);
        setModels([]);
        setSelectedModel('');
      }
      setAutoDetected(false);
      return;
    }
    const detected = detectProviderFromKey(trimmed);
    if (detected) {
      setSelectedProvider(detected);
      setAutoDetected(true);
    } else if (!selectedProvider) {
      setSelectedProvider('openai');
      setAutoDetected(false);
    }
  }, [apiKey, initialProvider]);

  useEffect(() => {
    if (!selectedProvider) return;
    let isMounted = true;
    setIsLoadingModels(true);
    setError(null);
    const loadModels = async () => {
      try {
        const fetched = await fetchModelsForProvider(selectedProvider, apiKey);
        if (!isMounted) return;
        setModels(fetched);
        if (fetched.length > 0) {
          if (!fetched.some((m) => m.id === selectedModel)) {
            setSelectedModel(fetched[0].id);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to fetch dynamic model list. Loaded standard default models.');
        const fallbacks = FALLBACK_MODELS[selectedProvider] || [];
        setModels(fallbacks);
        if (fallbacks.length > 0) setSelectedModel(fallbacks[0].id);
      } finally {
        if (isMounted) setIsLoadingModels(false);
      }
    };
    const timer = setTimeout(loadModels, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedProvider, apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter a valid API Key to initialize the neural link.');
      return;
    }
    if (!selectedProvider) {
      setError('Please select an AI provider.');
      return;
    }
    if (!selectedModel) {
      setError('Please select a model from the list.');
      return;
    }
    onComplete(apiKey.trim(), selectedProvider, selectedModel);
  };

  const currentProviderInfo = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-500 border border-cyan-500/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff]" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.25)] mb-4 animate-pulse-glow">
              <Cpu className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent mb-2">
              PROFESSOR-XMD API TESTING ARENA
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto font-sans">
              Enter your AI Provider API Key. The system will attempt to auto-detect the provider. Keys remain private in-memory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono tracking-wider text-cyan-300/80 uppercase">
                <label htmlFor="api-key" className="flex items-center gap-1.5 font-bold">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  API KEY AUTHENTICATION
                </label>
                {autoDetected && currentProviderInfo && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" /> Auto-Detected: {currentProviderInfo.name}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentProviderInfo?.placeholderKey || 'Paste your API key here...'}
                  className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl px-4 py-3.5 text-sm font-mono text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner"
                  autoComplete="off"
                  spellCheck="false"
                />
                {isLoadingModels && (
                  <div className="absolute right-3.5 top-3.5 text-cyan-400 animate-spin">
                    <Loader2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
                <span>SELECT CORE PROVIDER</span>
                {currentProviderInfo && (
                  <a href={currentProviderInfo.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROVIDERS.map((provider) => {
                  const isSelected = selectedProvider === provider.id;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setAutoDetected(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-mono font-medium transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{provider.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
                <span className="flex items-center gap-1.5 text-cyan-300/80 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  SELECT NEURAL MODEL
                </span>
                {models.length > 0 && (
                  <span className="text-[11px] text-slate-500">{models.length} models available</span>
                )}
              </div>
              {isLoadingModels ? (
                <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-center gap-3 text-cyan-400 text-xs font-mono">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning model architecture...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl px-4 py-3.5 text-sm font-mono text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id} className="bg-slate-950 text-slate-200">
                        {model.name} {model.reasoningSupported ? '⚡ [Reasoning]' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l0.707 0.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!apiKey.trim() || !selectedModel || isLoadingModels}
              className="w-full py-4 rounded-xl font-heading font-bold text-sm uppercase tracking-widest bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-600 text-slate-950 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>INITIALIZE PROFESSOR-XMD</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
        
        {/* Powered by PROFESSOR-XMD - Bottom Footer */}
        <div className="flex justify-center items-center mt-4">
          <span className="text-[11px] font-mono text-slate-500 tracking-wide">
            <span className="text-cyan-500/60">✦</span> Powered by <span className="text-cyan-400 font-semibold">PROFESSOR-XMD</span> <span className="text-cyan-500/60">✦</span>
          </span>
        </div>
      </div>
    </div>
  );
};
