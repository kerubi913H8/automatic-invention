import React from 'react';

interface SteamProps {
  active: boolean;
  className?: string;
}

export const Steam: React.FC<SteamProps> = ({ active, className = '' }) => {
  if (!active) return null;

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute text-2xl opacity-60"
          style={{
            animation: `float 2s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            left: `${20 + i * 30}%`
          }}
        >
          💨
        </div>
      ))}
    </div>
  );
};
