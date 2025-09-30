import { useState } from 'react';
import BraindumpUploader from '@/src/components/BraindumpUploader';
import MindmapAscii from '@/src/components/MindmapAscii';

export default function BraindumpsPage() {
  const [analysis, setAnalysis] = useState('');
  const [currentId, setCurrentId] = useState<number | null>(null);

  async function handleUpload(payload: { title?: string; content: string }) {
    const res = await fetch('/api/braindump/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) setCurrentId(data.braindump.id);
  }

  async function handleAnalyze() {
    if (!currentId) return;
    const res = await fetch('/api/braindump/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ braindump_id: currentId }),
    });
    const data = await res.json();
    if (res.ok) setAnalysis(data.analysis_md);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Brain Dumps</h1>
      <BraindumpUploader onSubmit={handleUpload} />
      <button
        onClick={handleAnalyze}
        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        disabled={!currentId}
      >
        Analyze latest
      </button>
      <MindmapAscii markdown={analysis} />
    </div>
  );
}
