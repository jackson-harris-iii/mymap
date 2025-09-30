import { useState } from 'react';

export default function BrowserDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  async function handleUpload() {
    if (!file) return;
    setStatus('Uploading...');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/history/browser/ingest', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'Upload failed');
      return;
    }
    setStatus(`Ingested ${data.inserted} visits. Generating review...`);
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7));
    const response = await fetch('/api/review/browser/week', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_week: sunday.toISOString().slice(0, 10) }),
    });
    const payload = await response.json();
    setStatus(response.ok ? 'Browser Week in Review generated ✅' : payload.error || 'Generation failed');
  }

  return (
    <div className="rounded-2xl border border-slate-800 p-4">
      <h3 className="text-lg font-semibold text-slate-100">Browser Week Review</h3>
      <p className="text-sm text-slate-400">Upload history CSV or JSON (url,title,last_visit_time,visit_count).</p>
      <input
        className="mt-3 w-full text-sm"
        type="file"
        accept=".csv,.json,text/csv,application/json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleUpload}
          className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          disabled={!file}
        >
          Upload & Generate
        </button>
        <span className="text-xs text-slate-400">{status}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Tip: any "export browser history" extension works great.</p>
    </div>
  );
}
