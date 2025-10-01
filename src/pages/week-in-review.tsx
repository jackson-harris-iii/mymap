import { useState } from 'react';
import useSWR from 'swr';
import YouTubeDropzone from '@/src/components/YouTubeDropzone';
import BrowserDropzone from '@/src/components/BrowserDropzone';
import ReactMarkdown from 'react-markdown';

export default function WeekInReviewPage() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + ((7 - today.getDay()) % 7));
    return sunday.toISOString().slice(0, 10);
  });

  const { data: reviews } = useSWR(`/api/review/list?week=${selectedWeek}`);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Week in Review</h1>
      <p className="text-sm text-slate-300">
        Drop your YouTube watch history or browser exports to generate private
        weekly reviews. We only store parsed highlights in your Supabase
        account.
      </p>

      <YouTubeDropzone />
      <BrowserDropzone />

      {/* Display generated reviews */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-white">Generated Reviews</h2>

        {reviews?.browser && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-sky-400 mb-3">
              Browser Activity
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{reviews.browser.summary_md}</ReactMarkdown>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-400">
              {reviews.browser.toplines && (
                <>
                  <div>
                    <span className="font-semibold">Total Visits:</span>{' '}
                    {reviews.browser.toplines.totalVisits}
                  </div>
                  <div>
                    <span className="font-semibold">Focus Ratio:</span>{' '}
                    {reviews.browser.toplines.focusRatio}%
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {reviews?.youtube && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-3">
              YouTube Activity
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{reviews.youtube.summary_md}</ReactMarkdown>
            </div>
          </div>
        )}

        {reviews?.combined && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">
              Combined Insights
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{reviews.combined.summary_md}</ReactMarkdown>
            </div>
          </div>
        )}

        {!reviews?.browser && !reviews?.youtube && !reviews?.combined && (
          <p className="text-sm text-slate-500">
            No reviews generated yet. Upload your data above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
