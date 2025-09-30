import { useState } from 'react';
import BriefList from '@/src/components/BriefList';

export default function BriefPage() {
  const [items, setItems] = useState<any[]>([]);

  async function handleRun() {
    const brief_date = new Date().toISOString().slice(0, 10);
    const res = await fetch('/api/brief/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief_date }),
    });
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Daily Brief</h1>
      <button onClick={handleRun} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
        Run Daily Brief
      </button>
      <BriefList items={items} />
    </div>
  );
}
