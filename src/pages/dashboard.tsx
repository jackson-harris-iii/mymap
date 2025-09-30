import useSWR from 'swr';
import Link from 'next/link';
import BriefList from '@/src/components/BriefList';

export default function Dashboard() {
  const { data: brief } = useSWR('/api/brief/run', { revalidateOnFocus: false, shouldRetryOnError: false });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-white">Today&apos;s Brief</h1>
        <BriefList items={brief?.items ?? []} />
        <Link href="/brief" className="text-sm text-sky-400">
          Run Daily Brief
        </Link>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">Weekly Check-in</h2>
          <p className="mt-2 text-sm text-slate-300">Keep your metrics current and generate a friendly report.</p>
          <Link href="/weekly-checkin" className="mt-3 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            Update metrics
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">Journal</h2>
          <p className="mt-2 text-sm text-slate-300">Log today&apos;s reflections and let the assistant summarize patterns.</p>
          <Link href="/journal" className="mt-3 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            Open journal
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">Brain Dumps</h2>
          <p className="mt-2 text-sm text-slate-300">Upload a brain dump and turn it into mind maps and action items.</p>
          <Link href="/braindumps" className="mt-3 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            Review brain dumps
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">Newsletter Studio</h2>
          <p className="mt-2 text-sm text-slate-300">Research competitors and draft this week&apos;s issue.</p>
          <Link href="/newsletter" className="mt-3 inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            Open studio
          </Link>
        </div>
      </section>
    </div>
  );
}
