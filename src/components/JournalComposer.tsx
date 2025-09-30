import { useState } from 'react';

type FormValues = {
  mood?: number;
  mood_desc?: string;
  energy?: number;
  accomplishments?: string[];
  priority?: string;
  blockers?: string;
  gratitude?: string;
  notes?: string;
};

type Props = {
  onSubmit: (values: FormValues) => Promise<void> | void;
};

export default function JournalComposer({ onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>({ accomplishments: ['', '', ''] });
  const [loading, setLoading] = useState(false);

  function update(field: keyof FormValues, value: any) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      ...values,
      accomplishments: values.accomplishments?.filter((item) => item && item.trim()),
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 p-4">
          <label className="text-sm text-slate-400">Mood (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            onChange={(e) => update('mood', Number(e.target.value))}
          />
          <textarea
            placeholder="Describe your mood"
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            rows={2}
            onChange={(e) => update('mood_desc', e.target.value)}
          />
        </div>
        <div className="rounded-2xl border border-slate-800 p-4">
          <label className="text-sm text-slate-400">Energy (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            onChange={(e) => update('energy', Number(e.target.value))}
          />
          <textarea
            placeholder="Any energy notes?"
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            rows={2}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 p-4">
        <label className="text-sm text-slate-400">Top 3 accomplishments</label>
        {values.accomplishments?.map((item, idx) => (
          <input
            key={idx}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={item}
            onChange={(e) => {
              const next = [...(values.accomplishments || [])];
              next[idx] = e.target.value;
              update('accomplishments', next);
            }}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          placeholder="Tomorrow's priority"
          className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm"
          rows={3}
          onChange={(e) => update('priority', e.target.value)}
        />
        <textarea
          placeholder="Blockers"
          className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm"
          rows={3}
          onChange={(e) => update('blockers', e.target.value)}
        />
      </div>
      <textarea
        placeholder="Grateful for..."
        className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm"
        rows={3}
        onChange={(e) => update('gratitude', e.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-400"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save entry'}
      </button>
    </form>
  );
}
