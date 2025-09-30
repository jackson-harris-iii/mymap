import ReactMarkdown from 'react-markdown';

type Props = {
  markdown: string;
};

export default function ReflectionCard({ markdown }: Props) {
  if (!markdown) return null;
  return (
    <div className="prose prose-invert max-w-none rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
