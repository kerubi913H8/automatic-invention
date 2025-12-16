import React, { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Character } from '../common/Character';
import { Confetti } from '../effects/Confetti';
import type { GameState, ReactionType, CharacterExpression, Reaction } from '../../types';
import { soundManager } from '../../utils/soundManager';

interface CompleteScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onMenu: () => void;
  onComplete: (stars: number, rating: ReactionType) => void;
}

// リアクション定義
const reactions: Record<ReactionType, Reaction> = {
  PERFECT: {
    expression: 'sparkle',
    animation: 'jump',
    sound: 'yay',
    message: 'さいこうにおいしい！'
  },
  GOOD: {
    expression: 'happy',
    animation: 'nod',
    sound: 'yum',
    message: 'おいしいね！'
  },
  OK: {
    expression: 'normal',
    animation: 'tilt',
    sound: 'tap',
    message: 'まあまあかな'
  },
  BAD: {
    expression: 'thinking',
    animation: 'shake',
    sound: 'pop',
    message: 'にがてかも...'
  }
};

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  gameState,
  onPlayAgain,
  onMenu,
  onComplete
}) => {
  const [, setStars] = useState(0);
  const [rating, setRating] = useState<ReactionType>('GOOD');
  const [activeStars, setActiveStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [characterExpression, setCharacterExpression] = useState<CharacterExpression>('eating');
  const [characterMessage, setCharacterMessage] = useState('もぐもぐ...');

  // スコアから星と評価を計算
  useEffect(() => {
    const score = gameState.score;
    let calculatedStars: number;
    let calculatedRating: ReactionType;

    if (score >= 90) {
      calculatedStars = 3;
      calculatedRating = 'PERFECT';
    } else if (score >= 70) {
      calculatedStars = 2;
      calculatedRating = 'GOOD';
    } else if (score >= 50) {
      calculatedStars = 1;
      calculatedRating = 'OK';
    } else {
      calculatedStars = 1;
      calculatedRating = 'BAD';
    }

    setStars(calculatedStars);
    setRating(calculatedRating);

    // 完了通知
    onComplete(calculatedStars, calculatedRating);

    // 食べるアニメーション
    setTimeout(() => {
      const reaction = reactions[calculatedRating];
      setCharacterExpression(reaction.expression);
      setCharacterMessage(reaction.message);
      soundManager.play(reaction.sound as 'yay' | 'yum' | 'tap' | 'pop');

      // 星アニメーション
      for (let i = 1; i <= calculatedStars; i++) {
        setTimeout(() => {
          setActiveStars(i);
          soundManager.play('star');
        }, i * 400);
      }

      // 紙吹雪
      if (calculatedStars >= 2) {
        setTimeout(() => setShowConfetti(true), 800);
      }
    }, 1500);

    // 完了サウンド
    setTimeout(() => soundManager.play('complete'), 200);
  }, [gameState.score, onComplete]);

  const recipe = gameState.currentRecipe;
  if (!recipe) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 紙吹雪 */}
      <Confetti active={showConfetti} />

      {/* コンテンツ */}
      <div className="z-10 flex flex-col items-center">
        {/* タイトル */}
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-6"
          style={{
            textShadow: '3px 3px 0 #FF6B6B',
            animation: 'celebrate 0.5s ease'
          }}
        >
          かんせい！
        </h2>

        {/* 料理表示 */}
        <div
          className="text-8xl mb-6"
          style={{ animation: 'float 2s ease-in-out infinite' }}
        >
          {recipe.icon}
        </div>

        {/* 星評価 */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className={`text-5xl transition-all duration-500 ${
                i <= activeStars
                  ? 'text-yellow-400 opacity-100'
                  : 'text-gray-600 opacity-30'
              }`}
              style={{
                animation: i <= activeStars ? 'starPop 0.5s ease' : 'none'
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* メッセージ */}
        <p className="text-2xl text-white font-bold mb-8" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
          {reactions[rating].message}
        </p>

        {/* キャラクター */}
        <div className="mb-8">
          <Character
            expression={characterExpression}
            size="medium"
            message={characterMessage}
            animate={true}
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            size="medium"
            onClick={onPlayAgain}
            className="text-xl"
          >
            もういちど
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={onMenu}
            className="text-xl"
          >
            べつのりょうり
          </Button>
        </div>
      </div>
    </div>
  );
};
