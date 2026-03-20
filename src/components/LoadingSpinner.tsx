import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Analyzing...' }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-linkedin-blue animate-spin" />
    </div>
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);
