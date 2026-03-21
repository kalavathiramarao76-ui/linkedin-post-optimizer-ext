import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ApiErrorFallbackProps {
  error: string;
  onRetry: () => void;
  retryDelay?: number;
}

const SUGGESTIONS = [
  'Check your internet connection',
  'The AI service may be temporarily busy',
  'Try shortening your post and retrying',
  'Refresh the extension if the issue persists',
];

export const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({
  error,
  onRetry,
  retryDelay = 10,
}) => {
  const [countdown, setCountdown] = useState(retryDelay);
  const [progress, setProgress] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setCancelled(false);
    setCountdown(retryDelay);
    setProgress(0);

    if (timerRef.current) clearInterval(timerRef.current);

    const interval = 100; // update every 100ms for smooth progress
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += interval;
      const remaining = Math.max(0, retryDelay - elapsed / 1000);
      setCountdown(Math.ceil(remaining));
      setProgress(Math.min(100, (elapsed / (retryDelay * 1000)) * 100));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        onRetry();
      }
    }, interval);
  }, [retryDelay, onRetry]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCancelled(true);
  };

  const handleRetryNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    onRetry();
  };

  return (
    <div className="api-error-fallback" role="alert" aria-live="assertive">
      <div className="api-error-inner">
        {/* Error icon */}
        <div className="api-error-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Error message */}
        <div className="api-error-content">
          <p className="api-error-message">{error}</p>

          {/* Auto-retry progress */}
          {!cancelled && (
            <div className="api-error-progress-wrap">
              <div className="api-error-progress-bar">
                <div
                  className="api-error-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="api-error-countdown">
                Retrying in {countdown}s
              </span>
            </div>
          )}

          {/* Suggestions */}
          <ul className="api-error-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="api-error-actions">
          <button onClick={handleRetryNow} className="api-error-retry-btn">
            Retry Now
          </button>
          {!cancelled && (
            <button onClick={handleCancel} className="api-error-cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
