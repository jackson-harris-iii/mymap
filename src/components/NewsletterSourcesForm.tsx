import { useState } from 'react';

type Source = {
  id: number;
  title?: string | null;
  url: string;
};

type Props = {
  sources: Source[];
  onSubmit: (payload: { add?: { title?: string; url: string }[]; remove_ids?: number[] }) => Promise<void> | void;
};

export default function NewsletterSourcesForm({ sources, onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ add: [{ url, title: title || undefined }] });
    setUrl('');
    setTitle('');
    setLoading(false);
  }

  async function handleRemove(id: number) {
    setLoading(true);
    await onSubmit({ remove_ids: [id] });
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-2xl border border-slate-800 p-4 md:flex-row">
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Newsletter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Label (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
          Add source
        </button>
      </form>
      <div className="grid gap-2">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center justify-between rounded-xl border border-slate-800 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-100">{source.title || source.url}</p>
              <p className="text-xs text-slate-400">{source.url}</p>
            </div>
            <button
              type="button"
              className="text-xs text-red-400 hover:text-red-300"
              onClick={() => handleRemove(source.id)}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        ))}
        {sources.length === 0 && <p className="text-sm text-slate-400">No sources yet. Add your first competitor feed.</p>}
      </div>
    </div>
  );
}
