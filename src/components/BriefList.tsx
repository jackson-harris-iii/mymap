type BriefItem = {
  title: string;
  url: string;
  published_at: string;
  why_it_matters: string;
  action: string;
};

type Props = {
  items: BriefItem[];
};

export default function BriefList({ items }: Props) {
  if (!items?.length) {
    return <p className="text-sm text-slate-400">No brief items yet. Run the Daily Brief to get fresh insights.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.url} className="rounded-2xl border border-slate-800 p-4">
          <div className="flex flex-col gap-1">
            <a href={item.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-sky-400">
              {item.title}
            </a>
            <span className="text-xs text-slate-500">Published {new Date(item.published_at).toLocaleDateString()}</span>
            <p className="text-sm text-slate-200">Why it matters: {item.why_it_matters}</p>
            <p className="text-sm text-slate-300">Suggested action: {item.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
