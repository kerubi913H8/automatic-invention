import React from 'react';
import type { CharacterExpression } from '../../types';

interface CharacterProps {
  expression?: CharacterExpression;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  animate?: boolean;
  className?: string;
}

// 表情に応じた顔パーツ
const expressions: Record<CharacterExpression, { eyes: string; mouth: string; extras?: string }> = {
  normal: { eyes: '◕ ◕', mouth: 'ω', extras: '' },
  excited: { eyes: '★ ★', mouth: '▽', extras: '!' },
  nervous: { eyes: '◉ ◉', mouth: '∧', extras: '...' },
  eating: { eyes: '− −', mouth: '〜', extras: 'もぐもぐ' },
  happy: { eyes: '◠ ◠', mouth: '▽', extras: '♪' },
  thinking: { eyes: '◔ ◔', mouth: '△', extras: '?' },
  sparkle: { eyes: '✧ ✧', mouth: '▽', extras: '✨' }
};

export const Character: React.FC<CharacterProps> = ({
  expression = 'normal',
  size = 'medium',
  message,
  animate = true,
  className = ''
}) => {
  const expr = expressions[expression];

  const sizeStyles = {
    small: 'w-20 h-24',
    medium: 'w-32 h-40',
    large: 'w-48 h-56'
  };

  const fontSizes = {
    small: { body: 'text-4xl', face: 'text-xs', message: 'text-xs' },
    medium: { body: 'text-6xl', face: 'text-sm', message: 'text-sm' },
    large: { body: 'text-8xl', face: 'text-base', message: 'text-base' }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* キャラクター本体 */}
      <div
        className={`
          ${sizeStyles[size]}
          relative flex flex-col items-center justify-center
          ${animate ? 'animate-[float_3s_ease-in-out_infinite]' : ''}
        `}
      >
        {/* クマの耳 */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-8">
          <div className="w-6 h-6 bg-amber-600 rounded-full shadow-inner"></div>
          <div className="w-6 h-6 bg-amber-600 rounded-full shadow-inner"></div>
        </div>

        {/* クマの顔 */}
        <div
          className={`
            ${fontSizes[size].body}
            bg-gradient-to-br from-amber-400 to-amber-600
            rounded-full
            w-full h-full
            flex flex-col items-center justify-center
            shadow-lg
            relative
          `}
        >
          {/* 目 */}
          <div className={`${fontSizes[size].face} font-bold text-gray-800 tracking-widest`}>
            {expr.eyes}
          </div>

          {/* 鼻と口 */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-3 bg-amber-800 rounded-full mb-1"></div>
            <div className={`${fontSizes[size].face} text-gray-800`}>
              {expr.mouth}
            </div>
          </div>

          {/* エキストラ（エフェクト） */}
          {expr.extras && (
            <div
              className={`
                absolute -top-2 -right-2
                ${fontSizes[size].message}
                text-pink-500 font-bold
                animate-bounce
              `}
            >
              {expr.extras}
            </div>
          )}
        </div>

        {/* シェフ帽子 */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-4xl">👨‍🍳</div>
        </div>
      </div>

      {/* メッセージ吹き出し */}
      {message && (
        <div
          className={`
            mt-2 px-4 py-2
            bg-white rounded-full
            shadow-md
            ${fontSizes[size].message}
            text-gray-700 font-bold
            animate-[bubblePop_0.3s_ease-out]
            relative
          `}
        >
          {/* 吹き出しの三角 */}
          <div
            className="
              absolute -top-2 left-1/2 transform -translate-x-1/2
              w-0 h-0
              border-l-4 border-r-4 border-b-8
              border-l-transparent border-r-transparent border-b-white
            "
          />
          {message}
        </div>
      )}
    </div>
  );
};
