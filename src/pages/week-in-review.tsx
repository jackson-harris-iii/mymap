import YouTubeDropzone from '@/src/components/YouTubeDropzone';
import BrowserDropzone from '@/src/components/BrowserDropzone';

export default function WeekInReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Week in Review</h1>
      <p className="text-sm text-slate-300">
        Drop your YouTube watch history or browser exports to generate private weekly reviews. We only store parsed highlights in
        your Supabase account.
      </p>
      <YouTubeDropzone />
      <BrowserDropzone />
    </div>
  );
}
