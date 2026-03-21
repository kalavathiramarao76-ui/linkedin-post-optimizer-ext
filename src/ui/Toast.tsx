import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 300;

const ACCENT_COLORS: Record<ToastType, string> = {
  success: '#22c55e',
  info: '#0a66c2',
  warning: '#f59e0b',
  error: '#ef4444',
};

const ICONS: Record<ToastType, string> = {
  success: '\u2713',
  info: '\u2139',
  warning: '\u26A0',
  error: '\u2717',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    // Start exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        // Evict oldest if over max
        while (next.length > MAX_TOASTS) {
          const evicted = next.shift();
          if (evicted) {
            const timer = timersRef.current.get(evicted.id);
            if (timer) clearTimeout(timer);
            timersRef.current.delete(evicted.id);
          }
        }
        return next;
      });

      const timer = setTimeout(() => {
        removeToast(id);
        timersRef.current.delete(id);
      }, AUTO_DISMISS_MS);

      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t, idx) => (
          <div
            key={t.id}
            className={`toast-card ${t.exiting ? 'toast-exit' : 'toast-enter'}`}
            style={{
              '--accent': ACCENT_COLORS[t.type],
              zIndex: 10000 + idx,
            } as React.CSSProperties}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            <div className="toast-accent" style={{ backgroundColor: ACCENT_COLORS[t.type] }} />
            <span className="toast-icon" style={{ color: ACCENT_COLORS[t.type] }}>
              {ICONS[t.type]}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
