import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/weekly-checkin', label: 'Weekly Check-in' },
  { href: '/journal', label: 'Journal' },
  { href: '/braindumps', label: 'Brain Dumps' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/brief', label: 'Daily Brief' },
  { href: '/week-in-review', label: 'Week in Review' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex flex-col md:flex-row">
        <aside className="md:w-64 border-b md:border-r border-slate-800">
          <div className="p-6">
            <h1 className="text-xl font-semibold">my map</h1>
            <p className="text-sm text-slate-400">Your operations co-pilot</p>
          </div>
          <nav className="flex flex-col gap-1 px-4 pb-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
