'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Thread {
  appointmentId: string;
  consultationId: string | null;
  otherPartyName: string;
  otherPartyInitials: string;
  caseTitle: string | null;
  scheduledAt: string;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  myUserId: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; role: string };
}

interface Props {
  token: string;
  userId: string;
  title: string;
  subtitle: string;
}

export function MessagesUI({ token, userId, title, subtitle }: Props) {
  const [threads,    setThreads]    = useState<Thread[]>([]);
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [selected,   setSelected]   = useState<Thread | null>(null);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Load threads
  useEffect(() => {
    fetch('/api/messages/threads', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ data }) => { setThreads(data ?? []); if (data?.length) { setSelected(data[0]); } })
      .finally(() => setLoading(false));
  }, [token]);

  // Load messages when thread selected
  useEffect(() => {
    if (!selected?.consultationId) { setMessages([]); return; }
    setLoadingMsg(true);
    fetch(`/api/messages/consultation/${selected.consultationId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ data }) => setMessages(data?.messages ?? []))
      .finally(() => setLoadingMsg(false));
  }, [selected, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (selected) setTimeout(() => inputRef.current?.focus(), 100); }, [selected]);

  async function handleSend() {
    if (!input.trim() || !selected || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      senderId: userId,
      createdAt: new Date().toISOString(),
      sender: { id: userId, role: 'CLIENT' },
    };
    setMessages(m => [...m, tempMsg]);

    try {
      const res = await fetch('/api/messages/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appointmentId: selected.appointmentId, content: text }),
      });
      const { data } = await res.json();
      // Replace temp message with real one and update thread's consultationId
      setMessages(m => m.map(msg => msg.id === tempMsg.id ? data : msg));
      if (!selected.consultationId && data.sender) {
        setSelected(s => s ? { ...s, consultationId: data.consultationId ?? s.consultationId } : s);
      }
      // Refresh threads to update last message preview
      setThreads(t => t.map(th => th.appointmentId === selected.appointmentId
        ? { ...th, lastMessage: { content: text, createdAt: new Date().toISOString(), senderId: userId } }
        : th));
    } catch {
      setMessages(m => m.filter(msg => msg.id !== tempMsg.id));
    } finally { setSending(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex" style={{ height: 'calc(100vh - 220px)', minHeight: 520 }}>
        {/* Thread list */}
        <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search conversations…" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading && (
              <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />Loading…
              </div>
            )}
            {!loading && threads.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-30" />
                No conversations yet.<br />
                <span className="text-xs">Messages appear after booking a consultation.</span>
              </div>
            )}
            {threads.map(t => (
              <button key={t.appointmentId} onClick={() => setSelected(t)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-slate-50 transition-colors ${selected?.appointmentId === t.appointmentId ? 'bg-indigo-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                  {t.otherPartyInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t.otherPartyName}</p>
                  {t.caseTitle && <p className="text-xs text-slate-400 truncate">{t.caseTitle}</p>}
                  {t.lastMessage ? (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {t.lastMessage.senderId === userId ? 'You: ' : ''}{t.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 mt-0.5 italic">No messages yet</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                {selected.otherPartyInitials}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selected.otherPartyName}</p>
                {selected.caseTitle && <p className="text-xs text-slate-400">{selected.caseTitle}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMsg && (
                <div className="flex justify-center text-slate-400 text-sm gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading messages…
                </div>
              )}
              {!loadingMsg && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                  <MessageSquare className="h-8 w-8 opacity-20" />
                  <p>No messages yet. Send the first one!</p>
                </div>
              )}
              {messages.map(m => {
                const isMe = m.senderId === userId;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Type a message…" disabled={sending} />
              <Button onClick={handleSend} disabled={sending || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 px-4">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
