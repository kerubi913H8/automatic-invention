import type { SoundType } from '../types';

// サウンド設定
interface SoundConfig {
  freq: number;
  duration: number;
  type: OscillatorType;
  melody?: number[];
}

// サウンド定義
const soundConfigs: Record<SoundType, SoundConfig> = {
  tap: { freq: 800, duration: 0.1, type: 'sine' },
  success: { freq: 523, duration: 0.3, type: 'sine', melody: [523, 659, 784] },
  mix: { freq: 200, duration: 0.05, type: 'triangle' },
  cut: { freq: 1200, duration: 0.08, type: 'sawtooth' },
  sizzle: { freq: 150, duration: 0.15, type: 'sawtooth' },
  pour: { freq: 300, duration: 0.2, type: 'sine' },
  pop: { freq: 400, duration: 0.15, type: 'square' },
  star: { freq: 880, duration: 0.2, type: 'sine' },
  complete: { freq: 523, duration: 0.5, type: 'sine', melody: [523, 659, 784, 1047] },
  yay: { freq: 659, duration: 0.4, type: 'sine', melody: [659, 784, 880, 1047] },
  yum: { freq: 523, duration: 0.3, type: 'sine', melody: [523, 659] }
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;

  // オーディオコンテキストを初期化（ユーザー操作後に呼ぶ）
  init(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  // 音声を再生
  play(type: SoundType): void {
    if (this.isMuted || !this.audioContext) {
      // 初回再生時に初期化
      this.init();
      if (!this.audioContext) return;
    }

    const config = soundConfigs[type];
    if (!config) return;

    if (config.melody) {
      // メロディを再生
      config.melody.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, config.duration, config.type);
        }, i * 150);
      });
    } else {
      // 単音を再生
      this.playTone(config.freq, config.duration, config.type);
    }
  }

  // 単音を再生
  private playTone(freq: number, duration: number, type: OscillatorType): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = freq;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // じゅうじゅう音（焼く音）を再生
  playSizzle(duration: number = 3): () => void {
    if (this.isMuted) return () => {};
    this.init();
    if (!this.audioContext) return () => {};

    const noise = this.audioContext.createBufferSource();
    const noiseBuffer = this.createNoiseBuffer(duration);
    noise.buffer = noiseBuffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.volume * 0.3;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start();

    return () => {
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.1);
      setTimeout(() => noise.stop(), 100);
    };
  }

  // ノイズバッファを作成
  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  // ミュート切り替え
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // ミュート状態を取得
  getMuted(): boolean {
    return this.isMuted;
  }

  // ボリューム設定
  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();
