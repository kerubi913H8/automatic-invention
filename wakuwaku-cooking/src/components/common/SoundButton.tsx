import React from 'react';
import { useSound } from '../../hooks/useSound';

interface SoundButtonProps {
  className?: string;
}

export const SoundButton: React.FC<SoundButtonProps> = ({ className = '' }) => {
  const { isMuted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      className={`
        w-12 h-12 rounded-full
        bg-white/80 backdrop-blur
        flex items-center justify-center
        text-2xl
        shadow-md
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      aria-label={isMuted ? 'おとをだす' : 'おとをけす'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
};
