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
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white
        focus:outline-none focus:ring-2 focus:ring-linkedin-blue/30 focus:border-linkedin-blue
        resize-none transition-all placeholder:text-gray-400"
    />
    <div className="absolute bottom-2 right-3 text-[10px] text-gray-400">
      {value.length} chars
    </div>
  </div>
);
