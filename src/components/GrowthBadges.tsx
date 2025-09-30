type Props = {
  deltaPct: number;
};

export default function GrowthBadges({ deltaPct }: Props) {
  let emoji = '➡️';
  if (deltaPct >= 20) emoji = '🚀';
  else if (deltaPct > 0) emoji = '📈';
  else if (deltaPct < 0) emoji = '📉';

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100">
      {emoji}
      <span>{deltaPct.toFixed(1)}%</span>
    </span>
  );
}
