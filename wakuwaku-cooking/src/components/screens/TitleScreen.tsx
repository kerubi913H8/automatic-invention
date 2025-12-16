import React from 'react';
import { Button } from '../common/Button';
import { Character } from '../common/Character';
import { SoundButton } from '../common/SoundButton';

interface TitleScreenProps {
  onStart: () => void;
}

// タイトル文字
const titleChars = ['わ', 'く', 'わ', 'く', 'ク', 'ッ', 'キ', 'ン', 'グ', '！'];

// 浮遊する食べ物
const floatingFoods = [
  { emoji: '🍳', x: 10, y: 20 },
  { emoji: '🥞', x: 85, y: 15 },
  { emoji: '🍛', x: 15, y: 70 },
  { emoji: '🍰', x: 80, y: 75 },
  { emoji: '🍔', x: 50, y: 10 },
  { emoji: '🍪', x: 90, y: 45 },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 浮遊する食べ物 */}
      {floatingFoods.map((food, i) => (
        <span
          key={i}
          className="absolute text-4xl pointer-events-none"
          style={{
            left: `${food.x}%`,
            top: `${food.y}%`,
            animation: `float 4s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.8
          }}
        >
          {food.emoji}
        </span>
      ))}

      {/* サウンドボタン */}
      <SoundButton className="absolute top-4 right-4 z-20" />

      {/* コンテンツ */}
      <div className="z-10 flex flex-col items-center">
        {/* タイトル */}
        <h1 className="flex flex-wrap justify-center mb-8">
          {titleChars.map((char, i) => (
            <span
              key={i}
              className="inline-block text-4xl md:text-6xl font-bold text-white"
              style={{
                textShadow: '3px 3px 0 #FF6B6B, 6px 6px 0 rgba(0,0,0,0.1)',
                animation: `bounce 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* キャラクター */}
        <div className="mb-8">
          <Character
            expression="excited"
            size="large"
            animate={true}
          />
        </div>

        {/* スタートボタン */}
        <Button
          variant="play"
          size="large"
          onClick={onStart}
          className="text-3xl px-12 py-6"
        >
          あそぶ！
        </Button>

        {/* サブテキスト */}
        <p className="mt-6 text-white/80 text-lg">
          たのしいりょうりをつくろう！
        </p>
      </div>

      {/* 下部の波装飾 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/20 to-transparent" />
    </div>
  );
};
