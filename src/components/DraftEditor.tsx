import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
  subjects: string[];
  markdown: string;
  onSave: (draft: { subjects: string[]; markdown: string }) => Promise<void> | void;
};

export default function DraftEditor({ subjects, markdown, onSave }: Props) {
  const [localSubjects, setLocalSubjects] = useState<string[]>(subjects);
  const [localMarkdown, setLocalMarkdown] = useState(markdown);
  const [preview, setPreview] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await onSave({ subjects: localSubjects, markdown: localMarkdown });
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-200">Subject options</h3>
        {localSubjects.map((subject, idx) => (
          <input
            key={idx}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => {
              const next = [...localSubjects];
              next[idx] = e.target.value;
              setLocalSubjects(next);
            }}
          />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
          <div className="flex gap-2 text-sm">
            <button
              className={`rounded-lg px-3 py-1 ${preview ? 'bg-slate-800' : 'bg-transparent'}`}
              onClick={() => setPreview(true)}
              type="button"
            >
              Preview
            </button>
            <button
              className={`rounded-lg px-3 py-1 ${!preview ? 'bg-slate-800' : 'bg-transparent'}`}
              onClick={() => setPreview(false)}
              type="button"
            >
              Edit
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            {loading ? 'Saving...' : 'Save draft'}
          </button>
        </div>
        {preview ? (
          <div className="prose prose-invert max-w-none p-6">
            <ReactMarkdown>{localMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="h-96 w-full rounded-b-2xl bg-slate-950 px-4 py-3 text-sm"
            value={localMarkdown}
            onChange={(e) => setLocalMarkdown(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
