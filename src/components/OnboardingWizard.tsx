import { useState } from 'react';

const projectTypes = ['creator', 'saas', 'developer', 'student', 'custom'] as const;

type Props = {
  onComplete: (values: { project_type: string; interests: string[]; context_blurb?: string }) => Promise<void> | void;
};

export default function OnboardingWizard({ onComplete }: Props) {
  const [projectType, setProjectType] = useState<string>('developer');
  const [interests, setInterests] = useState<string>('ai,productivity,news');
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onComplete({
      project_type: projectType,
      interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
      context_blurb: context || undefined,
    });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 p-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome! Let's personalize your map.</h2>
        <p className="text-sm text-slate-400">Choose how you work and what you care about.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">What kind of work do you do?</label>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setProjectType(type)}
              className={`rounded-full px-3 py-1 text-sm capitalize ${
                projectType === type ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Interests</label>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="ai, productivity, creator economy"
        />
        <p className="text-xs text-slate-500">Comma separated keywords.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Describe your work (optional)</label>
        <textarea
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-400"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Start exploring'}
      </button>
    </form>
  );
}
