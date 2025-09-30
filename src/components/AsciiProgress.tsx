import { asciiProgress } from '@/src/lib/charts';

type Props = {
  label: string;
  current: number;
  goal: number;
};

export default function AsciiProgress({ label, current, goal }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 p-4">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-lg font-semibold text-slate-100">{asciiProgress(current, goal)}</span>
    </div>
  );
}
