import { asciiProgress } from '@/src/lib/charts';

type Row = {
  label: string;
  unit?: string;
  goal?: number;
  lastWeek?: number | null;
  thisWeek?: number | null;
};

type Props = {
  rows: Row[];
};

export default function MetricTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Metric</th>
            <th className="px-4 py-3">Last Week</th>
            <th className="px-4 py-3">This Week</th>
            <th className="px-4 py-3">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-3 font-medium text-slate-100">
                {row.label}
                {row.unit && <span className="ml-1 text-xs text-slate-400">({row.unit})</span>}
              </td>
              <td className="px-4 py-3 text-slate-300">{row.lastWeek ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300">{row.thisWeek ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300">
                {row.goal ? asciiProgress(row.thisWeek ?? 0, row.goal) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
