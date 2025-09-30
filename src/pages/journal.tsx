import { useState } from 'react';
import JournalComposer from '@/src/components/JournalComposer';
import ReflectionCard from '@/src/components/ReflectionCard';

export default function JournalPage() {
  const [reflection, setReflection] = useState('');

  async function handleSubmit(values: any) {
    const entry_date = new Date().toISOString().slice(0, 10);
    await fetch('/api/journal/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_date, ...values }),
    });
    const res = await fetch('/api/journal/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_date }),
    });
    const data = await res.json();
    if (res.ok) setReflection(data.reflection_md);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Daily Journal</h1>
      <JournalComposer onSubmit={handleSubmit} />
      <ReflectionCard markdown={reflection} />
    </div>
  );
}
