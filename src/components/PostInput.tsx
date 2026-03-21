import React from 'react';

interface PostInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export const PostInput: React.FC<PostInputProps> = ({
  value,
  onChange,
  placeholder = 'Paste your LinkedIn post here...',
  rows = 6,
}) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 text-sm rounded-xl
        focus:outline-none focus:ring-2 focus:ring-linkedin-blue/30 focus:border-linkedin-blue
        resize-none transition-all"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        color: 'var(--text-primary)',
      }}
    />
    <div className="absolute bottom-2 right-3 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
      {value.length} chars
    </div>
  </div>
);
