import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 py-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-white">Run your week with clarity.</h1>
        <p className="text-lg text-slate-300">
          My Map combines weekly metrics, daily reflection, brain dump insights, newsletter research, and a personal brief into one
          calm workspace.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white">
            Open dashboard
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900"
          >
            Explore features
          </a>
        </div>
      </section>
      <section id="features" className="grid gap-6 md:grid-cols-2">
        {[
          {
            title: 'Weekly Check-in',
            description: 'Track the metrics that matter and get actionable, upbeat summaries every Monday.',
          },
          {
            title: 'Daily Journal',
            description: 'Capture wins, blockers, and gratitude—then receive a reflection generated from your own patterns.',
          },
          {
            title: 'Brain Dump Analyzer',
            description: 'Turn unstructured notes into ASCII mind maps, realizations, and action steps.',
          },
          {
            title: 'Newsletter Studio',
            description: 'Ingest competitor newsletters, spot trends, and draft your own 500–800 word issue.',
          },
          {
            title: 'Daily Brief',
            description: 'Curated news from the last seven days with why it matters for your work.',
          },
          {
            title: 'Week in Review',
            description: 'Upload browser and YouTube history to see where your attention actually went.',
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
