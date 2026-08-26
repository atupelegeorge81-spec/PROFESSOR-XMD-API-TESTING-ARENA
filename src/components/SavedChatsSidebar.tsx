import React, { useState } from 'react';
import type { ChatSession } from '../types/chat';
import { X, Trash2, MessageSquare, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';

interface SavedChatsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
}

export const SavedChatsSidebar: React.FC<SavedChatsSidebarProps> = ({
  isOpen, onClose, sessions, currentSessionId, onSelectSession, onDeleteSession, onNewChat,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevents opening the chat when clicking delete
    setConfirmDeleteId(sessionId);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setTimeout(() => {
      onDeleteSession(confirmDeleteId);
      setDeletingId(null);
      setConfirmDeleteId(null);
    }, 300);
  };

  const handleCancelDelete = () => setConfirmDeleteId(null);
  const targetToDelete = sessions.find((s) => s.id === confirmDeleteId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm h-full glass-panel border-l border-cyan-500/20 flex flex-col">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <h2 className="font-heading font-bold text-cyan-300 tracking-wider flex items-center gap-2 text-sm sm:text-base">
            <MessageSquare className="w-5 h-5" /> NEURAL ARCHIVES
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 shrink-0">
          <button onClick={() => { onNewChat(); onClose(); }} className="w-full py-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-sm hover:bg-cyan-900/60 transition-all flex items-center justify-center gap-2">
            <PlusCircle className="w-4 h-4" /> NEW TRANSMISSION
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-500 text-sm font-mono py-8">No archived sessions found.</div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isDeleting = deletingId === session.id;
              return (
                <div key={session.id} onClick={() => onSelectSession(session.id)}
                  className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_rgba(0,243,255,0.15)]' : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/60'
                  } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="pr-10">
                    <div className="text-sm font-medium text-slate-200 truncate">{session.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                      <span className="uppercase">{session.providerId}</span>
                      <span>•</span>
                      <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteClick(e, session.id)} disabled={isDeleting}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/50 transition-all group" title="Delete Session">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleCancelDelete} />
          <div className="relative w-full max-w-sm glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,243,255,0.2)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-t-2xl" />
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <h3 className="text-center font-heading font-bold text-cyan-200 text-lg mb-2 tracking-wide">CONFIRM DELETION</h3>
            <p className="text-center text-slate-300 text-sm mb-1 font-sans">Are you sure you want to delete this conversation?</p>
            {targetToDelete && <p className="text-center text-cyan-400 text-xs font-mono mb-6 truncate px-2">"{targetToDelete.title}"</p>}
            <div className="flex gap-3">
              <button onClick={handleCancelDelete} disabled={deletingId !== null}
                className="flex-1 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 font-mono text-sm hover:bg-slate-800 hover:border-slate-600 transition-all disabled:opacity-50 disabled:pointer-events-none">CANCEL</button>
              <button onClick={handleConfirmDelete} disabled={deletingId !== null}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-slate-950 font-mono text-sm font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                {deletingId !== null ? <><Loader2 className="w-4 h-4 animate-spin" /> DELETING...</> : <><Trash2 className="w-4 h-4" /> DELETE</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
