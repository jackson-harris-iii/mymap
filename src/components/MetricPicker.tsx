import { useState } from 'react';

type Metric = {
  key: string;
  label: string;
  unit?: string;
};

type Props = {
  suggested: Metric[];
  onChange: (metrics: Metric[]) => void;
};

export default function MetricPicker({ suggested, onChange }: Props) {
  const [metrics, setMetrics] = useState<Metric[]>(suggested);
  const [newMetric, setNewMetric] = useState('');
  const [newUnit, setNewUnit] = useState('');

  function update(next: Metric[]) {
    setMetrics(next);
    onChange(next);
  }

  function addMetric() {
    if (!newMetric.trim()) return;
    const metric = { key: newMetric.trim().toLowerCase().replace(/\s+/g, '_'), label: newMetric.trim(), unit: newUnit || undefined };
    update([...metrics, metric]);
    setNewMetric('');
    setNewUnit('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-200">Suggested metrics</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <span key={metric.key} className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs">
              {metric.label}
              {metric.unit && <span className="text-slate-400">({metric.unit})</span>}
              <button
                type="button"
                onClick={() => update(metrics.filter((m) => m.key !== metric.key))}
                className="text-slate-400 hover:text-red-400"
              >
                remove
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 p-4 md:flex-row">
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Metric name"
          value={newMetric}
          onChange={(e) => setNewMetric(e.target.value)}
        />
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Unit (optional)"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
        />
        <button type="button" onClick={addMetric} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
          Add metric
        </button>
      </div>
    </div>
  );
}
