'use client';

import { useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

const docs = [
  { id: '1', name: 'Property_Agreement.pdf', type: 'PDF', size: '2.4 MB', case: 'Property Dispute', uploadedAt: '2026-05-01' },
  { id: '2', name: 'Employment_Contract.docx', type: 'DOCX', size: '1.1 MB', case: 'Employment Dispute', uploadedAt: '2026-04-29' },
  { id: '3', name: 'Court_Notice.pdf', type: 'PDF', size: '0.8 MB', case: 'Property Dispute', uploadedAt: '2026-04-25' },
  { id: '4', name: 'Bank_Statement_Mar26.pdf', type: 'PDF', size: '3.2 MB', case: 'Contract Review', uploadedAt: '2026-04-20' },
];

const typeColor: Record<string, string> = {
  PDF: 'bg-red-100 text-red-700', DOCX: 'bg-blue-100 text-blue-700', IMG: 'bg-green-100 text-green-700',
};

export default function DocumentsPage() {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your legal documents securely</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Upload className="h-4 w-4" />Upload Document
        </Button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Upload className="h-6 w-6 text-indigo-500" />
        </div>
        <p className="text-sm font-medium text-slate-700">Drop files here or <span className="text-indigo-600 cursor-pointer hover:underline">browse</span></p>
        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG up to 20MB</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search documents..." />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-500 font-medium">{docs.length} documents</p>
        </div>
        <div className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <File className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.case} · {doc.size} · {doc.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor[doc.type] ?? 'bg-slate-100 text-slate-600'}`}>{doc.type}</span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Download className="h-4 w-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
