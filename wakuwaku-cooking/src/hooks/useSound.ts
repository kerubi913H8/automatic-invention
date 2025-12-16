import { useCallback, useState } from 'react';
import { soundManager } from '../utils/soundManager';
import type { SoundType } from '../types';

export function useSound() {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const play = useCallback((type: SoundType) => {
    soundManager.play(type);
  }, []);

  const playSizzle = useCallback((duration?: number) => {
    return soundManager.playSizzle(duration);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  return {
    play,
    playSizzle,
    isMuted,
    toggleMute
  };
}
