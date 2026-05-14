'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const threads = [
  { id: '1', name: 'Rahul Mehta', lastMessage: 'I will share the documents today.', time: '11:20 AM', unread: 1, initials: 'RM' },
  { id: '2', name: 'Priya Singh', lastMessage: 'Thank you for your advice!', time: 'Yesterday', unread: 0, initials: 'PS' },
];
const messages = [
  { id: '1', from: 'client', text: 'Hello, I wanted to follow up on my property case.', time: '10:00 AM' },
  { id: '2', from: 'me', text: 'Hello Rahul! I have reviewed the survey report. The encroachment is clearly visible.', time: '10:10 AM' },
  { id: '3', from: 'client', text: 'What are our next steps?', time: '10:15 AM' },
  { id: '4', from: 'me', text: 'We should send a legal notice first. I will draft it today. Please share the original deed.', time: '10:20 AM' },
  { id: '5', from: 'client', text: 'I will share the documents today.', time: '11:20 AM' },
];

export default function LawyerMessagesPage() {
  const [selected, setSelected] = useState('1');
  const [input, setInput] = useState('');
  const active = threads.find(t => t.id === selected);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Messages</h1><p className="text-slate-500 text-sm mt-0.5">Communicate with your clients</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search..." />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {threads.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-slate-50 transition-colors ${selected === t.id ? 'bg-indigo-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">{t.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p><span className="text-xs text-slate-400 ml-2">{t.time}</span></div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{t.lastMessage}</p>
                </div>
                {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{t.unread}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">{active?.initials}</div>
            <p className="font-semibold text-slate-900 text-sm">{active?.name}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm ${m.from === 'me' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Type a message..." />
            <Button className="bg-indigo-600 hover:bg-indigo-700 px-4" onClick={() => setInput('')}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
