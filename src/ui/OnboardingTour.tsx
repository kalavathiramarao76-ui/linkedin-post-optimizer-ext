import React, { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'engageboost_onboarding_done';

interface Step {
  title: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to Engagix',
    description:
      'Your AI-powered LinkedIn growth engine. Optimize every post for maximum engagement, reach, and virality — all inside Chrome.',
    icon: '\u26A1',
  },
  {
    title: 'Paste your post',
    description:
      'Drop any LinkedIn draft into the editor. Engagix scores your hook, readability, CTA, emotion, and formatting — then rewrites it for peak performance.',
    icon: '\uD83C\uDFAF',
  },
  {
    title: 'A/B test variants',
    description:
      'Generate multiple post variants with different angles, predict viral potential, and pick the winner before you publish. Data-driven LinkedIn growth.',
    icon: '\uD83D\uDE80',
  },
];

export const OnboardingTour: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const finish = useCallback(() => {
    setConfetti(true);
    setTimeout(() => {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setVisible(false);
    }, 1800);
  }, []);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  const skip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  }, []);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      {/* Confetti burst */}
      {confetti && <ConfettiBurst />}

      <div className="onboarding-card">
        {/* Step indicator dots */}
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot ${i === step ? 'onboarding-dot-active' : ''}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="onboarding-icon">{current.icon}</div>

        {/* Content */}
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-desc">{current.description}</p>

        {/* Actions */}
        <div className="onboarding-actions">
          <button className="onboarding-skip" onClick={skip}>
            Skip
          </button>
          <button className="onboarding-next" onClick={next}>
            {isLast ? "Let's Go!" : 'Next'}
          </button>
        </div>

        {/* Step count */}
        <span className="onboarding-step-count">
          {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
};

/** Simple confetti burst with CSS-only particles */
const ConfettiBurst: React.FC = () => {
  const particles = Array.from({ length: 40 }, (_, i) => {
    const hue = Math.floor(Math.random() * 360);
    const left = 40 + Math.random() * 20;
    const delay = Math.random() * 0.3;
    const angle = (i / 40) * 360;
    const distance = 80 + Math.random() * 120;
    const size = 4 + Math.random() * 6;
    return { hue, left, delay, angle, distance, size, id: i };
  });

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`,
            '--delay': `${p.delay}s`,
            '--size': `${p.size}px`,
            '--hue': `${p.hue}`,
            left: `${p.left}%`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
