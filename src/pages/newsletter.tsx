import { useEffect, useState } from 'react';
import NewsletterSourcesForm from '@/src/components/NewsletterSourcesForm';
import DraftEditor from '@/src/components/DraftEditor';

export default function NewsletterPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [draft, setDraft] = useState<{ subjects: string[]; draft_md: string } | null>(null);

  async function loadSources() {
    const res = await fetch('/api/newsletter/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setSources(data.sources ?? []);
  }

  useEffect(() => {
    loadSources();
  }, []);

  async function handleSources(payload: any) {
    const res = await fetch('/api/newsletter/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSources(data.sources ?? []);
  }

  async function handleFetch() {
    await fetch('/api/newsletter/fetch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  }

  async function handleDraft() {
    const period_week = new Date().toISOString().slice(0, 10);
    await fetch('/api/newsletter/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_week }),
    });
    const res = await fetch('/api/newsletter/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_week }),
    });
    const data = await res.json();
    if (res.ok) setDraft(data);
  }

  async function handleSaveDraft(payload: { subjects: string[]; markdown: string }) {
    setDraft({ subjects: payload.subjects, draft_md: payload.markdown });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Newsletter Studio</h1>
      <NewsletterSourcesForm sources={sources} onSubmit={handleSources} />
      <div className="flex flex-wrap gap-3">
        <button onClick={handleFetch} className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white">
          Fetch latest posts
        </button>
        <button onClick={handleDraft} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
          Research & Draft
        </button>
      </div>
      {draft && <DraftEditor subjects={draft.subjects} markdown={draft.draft_md} onSave={handleSaveDraft} />}
    </div>
  );
}
