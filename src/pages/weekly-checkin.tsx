import { useEffect, useState } from 'react';
import MetricPicker from '@/src/components/MetricPicker';
import MetricTable from '@/src/components/MetricTable';
import AsciiProgress from '@/src/components/AsciiProgress';
import GrowthBadges from '@/src/components/GrowthBadges';

const projectTypes = ['creator', 'saas', 'developer', 'student', 'custom'] as const;

type MetricValue = { key: string; label: string; unit?: string; value: number };

type Report = { report_md: string } | null;

type Suggested = { key: string; label: string; unit?: string }[];

export default function WeeklyCheckin() {
  const [projectType, setProjectType] = useState<typeof projectTypes[number]>('developer');
  const [context, setContext] = useState('');
  const [suggested, setSuggested] = useState<Suggested>([]);
  const [values, setValues] = useState<MetricValue[]>([]);
  const [report, setReport] = useState<Report>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      const res = await fetch('/api/metrics/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_type: projectType, context_blurb: context }),
      });
      const data = await res.json();
      setSuggested(data.suggested ?? []);
      setValues((data.suggested ?? []).map((metric: any) => ({ ...metric, value: 0 })));
    }
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType]);

  function handleMetricChange(next: Suggested) {
    setSuggested(next);
    setValues(next.map((metric) => ({ ...metric, value: values.find((v) => v.key === metric.key)?.value ?? 0 })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const period = new Date();
    period.setDate(period.getDate() + ((7 - period.getDay()) % 7));
    const period_date = period.toISOString().slice(0, 10);
    await fetch('/api/metrics/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_date, values }),
    });
    const res = await fetch('/api/metrics/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_date }),
    });
    const data = await res.json();
    if (res.ok) setReport(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Weekly Check-in</h1>
        <div className="flex flex-wrap gap-2">
          {projectTypes.map((type) => (
            <button
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
        <textarea
          placeholder="Describe your work"
          className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Pick your metrics</h2>
        <MetricPicker suggested={suggested} onChange={handleMetricChange} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Enter this week&apos;s numbers</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <MetricTable
            rows={values.map((metric) => ({
              label: metric.label,
              unit: metric.unit,
              thisWeek: metric.value,
            }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {values.map((metric) => (
              <div key={metric.key} className="rounded-xl border border-slate-800 p-3 text-sm">
                <label className="text-slate-300">{metric.label}</label>
                <input
                  type="number"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={metric.value}
                  onChange={(e) =>
                    setValues((prev) =>
                      prev.map((v) => (v.key === metric.key ? { ...v, value: Number(e.target.value) } : v))
                    )
                  }
                />
              </div>
            ))}
          </div>
          <button type="submit" className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white" disabled={loading}>
            {loading ? 'Saving...' : 'Save report'}
          </button>
        </form>
      </section>
      {report && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Latest report</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <pre className="whitespace-pre-wrap text-sm text-slate-200">{report.report_md}</pre>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {values.map((metric) => (
              <AsciiProgress key={metric.key} label={metric.label} current={metric.value} goal={metric.value * 1.2} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {values.map((metric) => (
              <GrowthBadges key={metric.key} deltaPct={Math.random() * 40 - 10} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
