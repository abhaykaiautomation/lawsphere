'use client';
import { useState } from 'react';
import { Upload, File, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const docs = [
  { id: '1', name: 'Bar_Council_Certificate.pdf', type: 'PDF', size: '1.2 MB', tag: 'Credential', uploadedAt: '2026-01-10' },
  { id: '2', name: 'LLB_Degree.pdf', type: 'PDF', size: '0.9 MB', tag: 'Credential', uploadedAt: '2026-01-10' },
  { id: '3', name: 'Property_Case_Brief.docx', type: 'DOCX', size: '2.1 MB', tag: 'Case Document', uploadedAt: '2026-05-02' },
];
const typeColor: Record<string, string> = { PDF: 'bg-red-100 text-red-700', DOCX: 'bg-blue-100 text-blue-700' };
const tagColor: Record<string, string> = { Credential: 'bg-emerald-100 text-emerald-700', 'Case Document': 'bg-indigo-100 text-indigo-700' };

export default function LawyerDocumentsPage() {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your credentials and case documents</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Upload className="h-4 w-4" />Upload</Button>
      </div>
      <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
        <Upload className="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Drop files here or <span className="text-indigo-600 cursor-pointer">browse</span></p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 20MB</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><File className="h-5 w-5 text-slate-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.size} · {doc.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColor[doc.tag] ?? ''}`}>{doc.tag}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor[doc.type] ?? ''}`}>{doc.type}</span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Download className="h-4 w-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
