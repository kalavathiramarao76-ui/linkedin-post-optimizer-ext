import React, { useState, useEffect } from 'react';
import { ScoreRing, MiniScoreBar } from '../components/ScoreRing';
import { PostInput } from '../components/PostInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useToast } from '../ui/Toast';

type Tab = 'optimizer' | 'scorer' | 'variants' | 'hooks' | 'viral';

type ScoreResult = {
  overall: number;
  dimensions: { hook: number; readability: number; cta: number; emotion: number; formatting: number };
  feedback: string;
};

type OptimizeResult = {
  optimized: string;
  changes: string[];
};

type Variant = { version: string; post: string; angle: string };
type Hook = { hook: string; style: string };
type ViralResult = {
  score: number;
  prediction: string;
  factors: { factor: string; impact: string }[];
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'optimizer', label: 'Optimize', icon: '&#9889;' },
  { id: 'scorer', label: 'Score', icon: '&#127919;' },
  { id: 'variants', label: 'A/B Test', icon: '&#128257;' },
  { id: 'hooks', label: 'Hooks', icon: '&#127907;' },
  { id: 'viral', label: 'Viral', icon: '&#128640;' },
];

export const SidePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('optimizer');
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Results
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResult | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [viralResult, setViralResult] = useState<ViralResult | null>(null);

  useEffect(() => {
    // Listen for post text from content script
    const listener = (msg: { type: string; post?: string }) => {
      if (msg.type === 'POST_TEXT' && msg.post) {
        setPost(msg.post);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const sendRequest = async (type: string) => {
    if (!post.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await chrome.runtime.sendMessage({ type, post: post.trim() });
      if (response.error) throw new Error(response.error);

      switch (type) {
        case 'SCORE_POST':
          setScoreResult(response.data);
          toast('Score analysis complete!', 'success');
          break;
        case 'OPTIMIZE_POST':
          setOptimizeResult(response.data);
          toast('Post optimized successfully!', 'success');
          break;
        case 'GENERATE_VARIANTS':
          setVariants(response.data.variants);
          toast('A/B variants generated!', 'success');
          break;
        case 'REWRITE_HOOKS':
          setHooks(response.data.hooks);
          toast('Hook rewrites ready!', 'success');
          break;
        case 'PREDICT_VIRAL':
          setViralResult(response.data);
          toast('Viral prediction complete!', 'success');
          break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'info');
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))` }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid var(--border-secondary)` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-linkedin-blue flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>LinkedIn Post Optimizer</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Full AI workspace for viral posts</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 rounded-xl p-0.5" style={{ background: 'var(--bg-tab)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all`}
              style={{
                background: activeTab === tab.id ? 'var(--bg-tab-active)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-tertiary)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              dangerouslySetInnerHTML={{ __html: `${tab.icon} ${tab.label}` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Post Input (shared) */}
        <PostInput value={post} onChange={setPost} rows={6} />

        {error && (
          <div className="p-2.5 rounded-xl text-xs animate-fade-in"
            style={{ background: 'var(--red-50)', border: `1px solid var(--red-200)`, color: 'var(--red-600)' }}>
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'optimizer' && (
          <OptimizerTab
            post={post}
            loading={loading}
            result={optimizeResult}
            onOptimize={() => sendRequest('OPTIMIZE_POST')}
            onCopy={copyToClipboard}
          />
        )}

        {activeTab === 'scorer' && (
          <ScorerTab
            loading={loading}
            result={scoreResult}
            onScore={() => sendRequest('SCORE_POST')}
          />
        )}

        {activeTab === 'variants' && (
          <VariantsTab
            loading={loading}
            variants={variants}
            onGenerate={() => sendRequest('GENERATE_VARIANTS')}
            onCopy={copyToClipboard}
          />
        )}

        {activeTab === 'hooks' && (
          <HooksTab
            loading={loading}
            hooks={hooks}
            onRewrite={() => sendRequest('REWRITE_HOOKS')}
            onCopy={copyToClipboard}
          />
        )}

        {activeTab === 'viral' && (
          <ViralTab
            loading={loading}
            result={viralResult}
            onPredict={() => sendRequest('PREDICT_VIRAL')}
          />
        )}
      </div>
    </div>
  );
};

// --- Sub-components for each tab ---

const ActionButton: React.FC<{
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  loadingLabel?: string;
}> = ({ onClick, loading, disabled, label, loadingLabel }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className="w-full py-2.5 px-4 bg-linkedin-blue text-white text-sm font-semibold
      rounded-xl hover:bg-linkedin-dark transition-colors disabled:opacity-50
      disabled:cursor-not-allowed active:scale-[0.98] transform"
  >
    {loading ? (loadingLabel || 'Processing...') : label}
  </button>
);

const CopyButton: React.FC<{ text: string; onCopy: (t: string) => void }> = ({ text, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[10px] px-2 py-1 rounded-md transition-colors"
      style={{ background: 'var(--bg-tab)', color: 'var(--text-secondary)' }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const OptimizerTab: React.FC<{
  post: string;
  loading: boolean;
  result: OptimizeResult | null;
  onOptimize: () => void;
  onCopy: (t: string) => void;
}> = ({ post, loading, result, onOptimize, onCopy }) => (
  <>
    <ActionButton
      onClick={onOptimize}
      loading={loading}
      disabled={!post.trim()}
      label="Optimize Post"
      loadingLabel="Optimizing..."
    />
    {loading && <LoadingSpinner text="Optimizing your post..." />}
    {result && !loading && (
      <div className="space-y-3 animate-slide-up">
        <div className="p-3 rounded-xl" style={{ background: 'var(--green-50)', border: `1px solid var(--green-200)` }}>
          <h3 className="text-xs font-semibold mb-1.5" style={{ color: 'var(--green-800)' }}>Changes Made:</h3>
          <ul className="space-y-1">
            {result.changes.map((change, i) => (
              <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--green-700)' }}>
                <span className="mt-0.5" style={{ color: 'var(--green-700)' }}>&#10003;</span>
                {change}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--red-50)', border: `1px solid var(--red-100)` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--red-600)' }}>Before</span>
            </div>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>{post}</p>
          </div>
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--green-50)', border: `1px solid var(--green-100)` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--green-700)' }}>After</span>
              <CopyButton text={result.optimized} onCopy={onCopy} />
            </div>
            <p className="text-[11px] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>{result.optimized}</p>
          </div>
        </div>
      </div>
    )}
  </>
);

const ScorerTab: React.FC<{
  loading: boolean;
  result: ScoreResult | null;
  onScore: () => void;
}> = ({ loading, result, onScore }) => (
  <>
    <ActionButton
      onClick={onScore}
      loading={loading}
      disabled={false}
      label="Score Post"
      loadingLabel="Scoring..."
    />
    {loading && <LoadingSpinner text="Analyzing engagement potential..." />}
    {result && !loading && (
      <div className="animate-slide-up space-y-4">
        <div className="flex justify-center">
          <ScoreRing score={result.overall} size={130} label="Overall" />
        </div>
        <div className="glass rounded-xl p-3 space-y-2">
          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Dimension Breakdown</h3>
          <MiniScoreBar label="Hook Strength" score={result.dimensions.hook} />
          <MiniScoreBar label="Readability" score={result.dimensions.readability} />
          <MiniScoreBar label="Call to Action" score={result.dimensions.cta} />
          <MiniScoreBar label="Emotional Impact" score={result.dimensions.emotion} />
          <MiniScoreBar label="Formatting" score={result.dimensions.formatting} />
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--blue-50)', border: `1px solid var(--blue-100)` }}>
          <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--blue-800)' }}>AI Feedback</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.feedback}</p>
        </div>
      </div>
    )}
  </>
);

const VariantsTab: React.FC<{
  loading: boolean;
  variants: Variant[];
  onGenerate: () => void;
  onCopy: (t: string) => void;
}> = ({ loading, variants, onGenerate, onCopy }) => (
  <>
    <ActionButton
      onClick={onGenerate}
      loading={loading}
      disabled={false}
      label="Generate A/B Variants"
      loadingLabel="Generating variants..."
    />
    {loading && <LoadingSpinner text="Creating 3 unique variants..." />}
    {variants.length > 0 && !loading && (
      <div className="space-y-3 animate-slide-up">
        {variants.map((v, i) => (
          <div key={i} className="glass rounded-xl p-3" style={{ border: `1px solid var(--border-primary)` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                  ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-amber-500'}`}>
                  {v.version}
                </span>
                <span className="text-[10px] italic" style={{ color: 'var(--text-tertiary)' }}>{v.angle}</span>
              </div>
              <CopyButton text={v.post} onCopy={onCopy} />
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{v.post}</p>
          </div>
        ))}
      </div>
    )}
  </>
);

const HooksTab: React.FC<{
  loading: boolean;
  hooks: Hook[];
  onRewrite: () => void;
  onCopy: (t: string) => void;
}> = ({ loading, hooks, onRewrite, onCopy }) => (
  <>
    <ActionButton
      onClick={onRewrite}
      loading={loading}
      disabled={false}
      label="Rewrite Hooks"
      loadingLabel="Crafting hooks..."
    />
    {loading && <LoadingSpinner text="Writing 5 killer hooks..." />}
    {hooks.length > 0 && !loading && (
      <div className="space-y-2 animate-slide-up">
        {hooks.map((h, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl transition-colors group"
            style={{ background: 'var(--bg-card)', border: `1px solid var(--border-primary)` }}>
            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'var(--border-accent)', color: 'var(--text-accent)' }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{h.style}</span>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-primary)' }}>{h.hook}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <CopyButton text={h.hook} onCopy={onCopy} />
            </div>
          </div>
        ))}
      </div>
    )}
  </>
);

const ViralTab: React.FC<{
  loading: boolean;
  result: ViralResult | null;
  onPredict: () => void;
}> = ({ loading, result, onPredict }) => (
  <>
    <ActionButton
      onClick={onPredict}
      loading={loading}
      disabled={false}
      label="Predict Viral Score"
      loadingLabel="Predicting..."
    />
    {loading && <LoadingSpinner text="Analyzing viral potential..." />}
    {result && !loading && (
      <div className="animate-slide-up space-y-4">
        <div className="flex flex-col items-center p-6 glass rounded-2xl">
          <div className="relative w-24 h-24">
            <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-black
              ${result.score >= 7 ? 'bg-green-100 text-green-600' :
                result.score >= 4 ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'}`}>
              {result.score}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>/10</span>
          </div>
          <p className="mt-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{result.prediction}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Key Factors</h3>
          {result.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: 'var(--bg-card)', border: `1px solid var(--border-secondary)` }}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0
                ${f.impact === 'positive' ? 'bg-green-500' :
                  f.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`}
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.factor}</span>
              <span className={`ml-auto text-[10px] font-medium
                ${f.impact === 'positive' ? 'text-green-600' :
                  f.impact === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                {f.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);
