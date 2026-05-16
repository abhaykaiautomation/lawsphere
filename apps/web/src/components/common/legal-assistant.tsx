'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { MessageSquare, X, Send, Loader2, Bot, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const SUGGESTED = [
  'What documents do I need for a property dispute?',
  'How long does a divorce process take in India?',
  'What is the Consumer Protection Act?',
  'What should I do after receiving a legal notice?',
];

export function LegalAssistant() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  if (!user) return null;

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const botMsg:  Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', streaming: true };

    setMessages(prev => [...prev, userMsg, botMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === botMsg.id ? { ...m, content: accumulated } : m)
        );
      }

      setMessages(prev =>
        prev.map(m => m.id === botMsg.id ? { ...m, streaming: false } : m)
      );
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === botMsg.id
          ? { ...m, content: 'Sorry, I encountered an error. Please try again.', streaming: false }
          : m)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all ${open ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        title="LexBot — AI Legal Assistant"
      >
        {open ? <ChevronDown className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
        {!open && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-indigo-600">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">LexBot</p>
              <p className="text-indigo-200 text-xs">AI Legal Assistant · Always available</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: 380 }}>
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-700 leading-relaxed max-w-[280px]">
                    Hello! I&apos;m LexBot, your AI legal assistant. I can help you understand legal concepts, explain your rights, and guide your next steps under Indian law. What would you like to know?
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium px-1">Suggested questions</p>
                  {SUGGESTED.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2.5 rounded-xl transition-colors leading-snug">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[280px] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-50 text-slate-700 rounded-tl-sm'
                }`}>
                  {m.content || (m.streaming && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />)}
                  {m.streaming && m.content && (
                    <span className="inline-block w-1 h-4 bg-indigo-400 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-tight">AI responses are informational only. Consult a verified lawyer for legal advice.</p>
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask a legal question…"
                disabled={loading}
                className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 px-3 h-auto shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
