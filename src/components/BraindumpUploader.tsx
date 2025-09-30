import { useState } from 'react';

type Props = {
  onSubmit: (payload: { title?: string; content: string }) => Promise<void> | void;
};

export default function BraindumpUploader({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ title: title || undefined, content });
    setContent('');
    setTitle('');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-800 p-4">
      <input
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="h-40 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        placeholder="Drop your brain dump here"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
        {loading ? 'Saving...' : 'Save brain dump'}
      </button>
    </form>
  );
}
