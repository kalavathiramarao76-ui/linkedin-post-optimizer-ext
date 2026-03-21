import React, { useState, useCallback } from 'react';
import { ScoreRing, MiniScoreBar } from '../components/ScoreRing';
import { PostInput } from '../components/PostInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useToast } from '../ui/Toast';
import { FavoriteButton } from '../ui/FavoriteButton';
import { OnboardingTour } from '../ui/OnboardingTour';
import { ApiErrorFallback } from '../ui/ApiErrorFallback';
import { ExportMenu, type ExportData } from '../ui/ExportMenu';

type ScoreResult = {
  overall: number;
  dimensions: { hook: number; readability: number; cta: number; emotion: number; formatting: number };
  feedback: string;
};

export const Popup: React.FC = () => {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleScore = useCallback(async () => {
    if (!post.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await chrome.runtime.sendMessage({ type: 'SCORE_POST', post: post.trim() });
      if (response.error) throw new Error(response.error);
      setResult(response.data);
      toast('Score analysis complete!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to score post';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [post, toast]);

  const openSidePanel = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });
  };

  return (
    <div className="w-[380px] min-h-[420px] p-4 flex flex-col"
      style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))` }}>
      <OnboardingTour />
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linkedin-blue flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Engagix</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>AI-powered LinkedIn engagement scoring</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            onClick={openSidePanel}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-accent)' }}
          >
            Full Workspace &rarr;
          </button>
        </div>
      </div>

      {/* Post Input */}
      <PostInput value={post} onChange={setPost} rows={5} />

      {/* Score Button */}
      <button
        onClick={handleScore}
        disabled={loading || !post.trim()}
        className="mt-3 w-full py-2.5 px-4 bg-linkedin-blue text-white text-sm font-semibold
          rounded-xl hover:bg-linkedin-dark transition-colors disabled:opacity-50
          disabled:cursor-not-allowed active:scale-[0.98] transform"
      >
        {loading ? 'Analyzing...' : 'Score My Post'}
      </button>

      {/* Error with auto-retry */}
      {error && !loading && (
        <ApiErrorFallback error={error} onRetry={handleScore} />
      )}

      {/* Loading */}
      {loading && <LoadingSpinner text="Scoring your post..." />}

      {/* Results */}
      {result && !loading && (
        <div className="mt-4 animate-slide-up">
          <div className="flex items-start gap-4">
            <ScoreRing score={result.overall} size={100} label="Engagement" />
            <div className="flex-1 space-y-1.5">
              <MiniScoreBar label="Hook" score={result.dimensions.hook} />
              <MiniScoreBar label="Readability" score={result.dimensions.readability} />
              <MiniScoreBar label="CTA" score={result.dimensions.cta} />
              <MiniScoreBar label="Emotion" score={result.dimensions.emotion} />
              <MiniScoreBar label="Formatting" score={result.dimensions.formatting} />
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-xl" style={{ background: 'var(--blue-50)', border: `1px solid var(--blue-100)` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold" style={{ color: 'var(--blue-800)' }}>AI Feedback</span>
              <div className="flex items-center gap-1">
                <FavoriteButton content={result.feedback} type="scored" label={`Score: ${result.overall}/100`} score={result.overall} />
                <ExportMenu data={{
                  title: 'Engagement Score Analysis',
                  score: result.overall,
                  dimensions: result.dimensions,
                  content: result.feedback,
                }} />
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};
