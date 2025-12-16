import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '../common/Button';
import { Character } from '../common/Character';
import { Sparkle } from '../effects/Sparkle';
import { Steam } from '../effects/Steam';
import type { GameState, CookingStep, CharacterExpression } from '../../types';
import { soundManager } from '../../utils/soundManager';

interface CookingScreenProps {
  gameState: GameState;
  onBack: () => void;
  incrementAction: () => void;
  nextStep: () => void;
  updateScore: (delta: number) => void;
  updateMixAngle: (angle: number) => void;
  addDrawPoint: (point: { x: number; y: number }) => void;
  updateTimingPhase: (phase: number, isPerfect: boolean) => void;
  updateHoldProgress: (progress: number, isHolding: boolean) => void;
}

interface SparkleData {
  id: number;
  x: number;
  y: number;
}

export const CookingScreen: React.FC<CookingScreenProps> = ({
  gameState,
  onBack,
  incrementAction,
  nextStep,
  updateScore,
  updateMixAngle,
  addDrawPoint,
  updateTimingPhase,
  updateHoldProgress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<SparkleData[]>([]);
  const [characterExpression, setCharacterExpression] = useState<CharacterExpression>('excited');
  const [characterMessage, setCharacterMessage] = useState<string>('');
  const lastInputPosRef = useRef<{ x: number; y: number } | null>(null);
  const isInteractingRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timingTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const sizzleStopRef = useRef<(() => void) | null>(null);

  const recipe = gameState.currentRecipe;
  const currentStep = recipe?.steps[gameState.currentStep];

  // キャンバスサイズを調整
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const size = Math.min(container.clientWidth - 40, container.clientHeight - 100, 500);
      canvas.width = size;
      canvas.height = size;
      drawScene();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // シーンを描画
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStep) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 背景
    ctx.fillStyle = '#FFF8E7';
    ctx.fillRect(0, 0, w, h);

    // テーブル
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    const centerX = w / 2;
    const centerY = h / 2;

    // ステップに応じた描画
    drawStepContent(ctx, currentStep, centerX, centerY, w, h);
  }, [currentStep, gameState]);

  // ステップ内容を描画
  const drawStepContent = (
    ctx: CanvasRenderingContext2D,
    step: CookingStep,
    centerX: number,
    centerY: number,
    _w: number,
    _h: number
  ) => {
    const { target } = step;
    const actionCount = gameState.actionCount;

    switch (target) {
      case 'egg':
        drawEgg(ctx, centerX, centerY, actionCount);
        break;
      case 'bowl':
        drawBowl(ctx, centerX, centerY, actionCount);
        break;
      case 'pan':
        drawPan(ctx, centerX, centerY, actionCount, step.type === 'hold');
        break;
      case 'omelette':
        drawOmelette(ctx, centerX, centerY, actionCount);
        break;
      case 'plate':
        drawPlate(ctx, centerX, centerY, recipe?.icon || '🍳');
        break;
      case 'ketchup':
        drawKetchupCanvas(ctx, centerX, centerY, gameState.drawnPoints);
        break;
      case 'flour':
      case 'butter':
      case 'sugar':
      case 'milk':
        drawIngredient(ctx, centerX, centerY, target, actionCount);
        break;
      case 'cutter':
        drawCookieCutter(ctx, centerX, centerY, actionCount);
        break;
      case 'oven':
      case 'pancake':
        drawTimingGame(ctx, centerX, centerY, gameState.timingPhase, gameState.perfectZone);
        break;
      case 'icing':
      case 'decoration':
        drawDecorationCanvas(ctx, centerX, centerY, gameState.drawnPoints);
        break;
      case 'bun':
      case 'lettuce':
      case 'patty':
      case 'cheese':
      case 'sauce':
      case 'stack':
      case 'top-bun':
        drawBurgerStep(ctx, centerX, centerY, target, actionCount);
        break;
      case 'strawberry':
      case 'topping':
        drawToppingScene(ctx, centerX, centerY, target, actionCount);
        break;
      case 'cream':
        drawCreamStep(ctx, centerX, centerY, actionCount);
        break;
      case 'potato':
      case 'carrot':
      case 'onion':
      case 'meat':
      case 'roux':
        drawCurryStep(ctx, centerX, centerY, target, actionCount);
        break;
      case 'pot':
        drawPot(ctx, centerX, centerY, actionCount);
        break;
      default:
        drawGenericAction(ctx, centerX, centerY, step.instruction);
    }
  };

  // 卵を描画
  const drawEgg = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    ctx.fillStyle = '#FFF5E6';
    ctx.beginPath();
    ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ひび
    if (count > 0) {
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      for (let i = 0; i < Math.min(count, 3); i++) {
        ctx.beginPath();
        ctx.moveTo(x - 10 + i * 10, y - 20);
        ctx.lineTo(x - 5 + i * 8, y);
        ctx.lineTo(x + 5 + i * 5, y + 20);
        ctx.stroke();
      }
    }

    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('タップ！', x, y + 80);
  };

  // ボウルを描画
  const drawBowl = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 80, 50, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ADD8E6';
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 80, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 中身
    ctx.fillStyle = count > 30 ? '#FFE135' : '#FFFACD';
    ctx.beginPath();
    ctx.ellipse(x, y - 30, 60, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 混ぜ棒
    const angle = gameState.mixAngle;
    ctx.save();
    ctx.translate(x, y - 30);
    ctx.rotate(angle);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-5, -60, 10, 80);
    ctx.restore();

    const progress = Math.min(100, Math.floor(count / 0.5));
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`まぜまぜ: ${progress}%`, x, y + 100);
  };

  // フライパンを描画
  const drawPan = (ctx: CanvasRenderingContext2D, x: number, y: number, _count: number, isHolding: boolean) => {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(x, y, 70, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 取っ手
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 60, y - 8, 50, 16);

    if (isHolding) {
      // 焼き具合ゲージ
      const progress = gameState.holdProgress;
      ctx.fillStyle = '#DDD';
      ctx.fillRect(x - 50, y + 60, 100, 15);

      const barColor = progress < 50 ? '#4CAF50' : progress < 80 ? '#FFD700' : '#FF6B6B';
      ctx.fillStyle = barColor;
      ctx.fillRect(x - 50, y + 60, progress, 15);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('おさえてやこう！', x, y + 100);
    }
  };

  // オムレツを描画
  const drawOmelette = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    drawPan(ctx, x, y, count, false);

    const rollProgress = Math.min(count, 2);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x - rollProgress * 10, y, 50 - rollProgress * 10, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('スワイプしてまこう！', x, y + 80);
  };

  // お皿を描画
  const drawPlate = (ctx: CanvasRenderingContext2D, x: number, y: number, icon: string) => {
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x, y);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('タップ！', x, y + 100);
  };

  // ケチャップキャンバス
  const drawKetchupCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, points: { x: number; y: number }[]) => {
    // お皿
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // オムレツ
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 描いた線
    if (points.length > 1) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points) {
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('ゆびでかいてね！', x, y + 100);
  };

  // 材料を描画
  const drawIngredient = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, count: number) => {
    const icons: Record<string, string> = {
      flour: '🌾',
      butter: '🧈',
      sugar: '🧂',
      milk: '🥛'
    };

    drawBowl(ctx, x, y, 0);

    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icons[type] || '📦', x - 80, y - 60);

    for (let i = 0; i < count; i++) {
      ctx.font = '20px sans-serif';
      ctx.fillText(icons[type], x + (i - 1) * 15, y - 35);
    }
  };

  // クッキー型抜き
  const drawCookieCutter = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    // 生地
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.ellipse(x, y - 20, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // 型抜きしたクッキー
    const shapes = ['⭐', '❤️', '🌙', '🔔', '🎄'];
    for (let i = 0; i < Math.min(count, 5); i++) {
      ctx.font = '30px sans-serif';
      ctx.fillText(shapes[i], x - 60 + i * 30, y + 50);
    }

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FF6B6B';
    ctx.textAlign = 'center';
    ctx.fillText('タップしてかたぬき！', x, y + 100);
  };

  // タイミングゲーム
  const drawTimingGame = (ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, isPerfect: boolean) => {
    // オーブン/フライパン
    ctx.fillStyle = '#666';
    ctx.fillRect(x - 60, y - 40, 120, 80);
    ctx.fillStyle = isPerfect ? '#FFD700' : '#333';
    ctx.fillRect(x - 50, y - 30, 100, 60);

    // タイミングメーター
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(x, y - 100, 50, 0, Math.PI * 2);
    ctx.stroke();

    // パーフェクトゾーン
    ctx.strokeStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(x, y - 100, 50, Math.PI * 0.89, Math.PI * 1.11);
    ctx.stroke();

    // インジケーター
    const angle = (phase / 180) * Math.PI - Math.PI / 2;
    ctx.fillStyle = isPerfect ? '#FFD700' : '#FF6B6B';
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * 50, y - 100 + Math.sin(angle) * 50, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = isPerfect ? '#4CAF50' : '#666';
    ctx.textAlign = 'center';
    ctx.fillText(isPerfect ? 'いまだ！タップ！' : 'みどりでタップ！', x, y + 80);
  };

  // デコレーションキャンバス
  const drawDecorationCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, points: { x: number; y: number }[]) => {
    // ケーキ/クッキー
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(x, y, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // 描いた線
    if (points.length > 1) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points) {
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('すきなもようをかこう！', x, y + 100);
  };

  // ハンバーガーステップ
  const drawBurgerStep = (ctx: CanvasRenderingContext2D, x: number, y: number, target: string, _count: number) => {
    const icons: Record<string, string> = {
      bun: '🍞',
      lettuce: '🥬',
      patty: '🥩',
      cheese: '🧀',
      sauce: '🍅',
      stack: '🍔',
      'top-bun': '🍞'
    };

    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[target] || '🍔', x, y);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('タップ！', x, y + 100);
  };

  // トッピングシーン
  const drawToppingScene = (ctx: CanvasRenderingContext2D, x: number, y: number, target: string, count: number) => {
    const icons: Record<string, string> = {
      strawberry: '🍓',
      topping: '🍯'
    };

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(recipe?.icon || '🍰', x, y + 15);

    for (let i = 0; i < count; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = x + Math.cos(angle) * 40;
      const ty = y + Math.sin(angle) * 25 - 20;
      ctx.font = '20px sans-serif';
      ctx.fillText(icons[target], tx, ty);
    }
  };

  // クリームステップ
  const drawCreamStep = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(x, y, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    const creamLevel = Math.min(count * 15, 100);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x - 70, y - 30 + (100 - creamLevel), 140, creamLevel);

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('スワイプしてぬろう！', x, y + 80);
  };

  // カレーステップ
  const drawCurryStep = (ctx: CanvasRenderingContext2D, x: number, y: number, target: string, count: number) => {
    const icons: Record<string, string> = {
      potato: '🥔',
      carrot: '🥕',
      onion: '🧅',
      meat: '🥩',
      roux: '🟫'
    };

    // まな板
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(x - 80, y - 30, 160, 80);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 80, y - 30, 160, 80);

    // 食材
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icons[target] || '🍖', x, y + 15);

    // 切った数
    for (let i = 0; i < count; i++) {
      ctx.font = '20px sans-serif';
      ctx.fillText(icons[target], x - 60 + i * 25, y + 70);
    }

    ctx.font = '40px sans-serif';
    ctx.fillText('🔪', x + 70, y - 40);
  };

  // 鍋を描画
  const drawPot = (ctx: CanvasRenderingContext2D, x: number, y: number, count: number) => {
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 70, 40, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 70, y - 20, 140, 40);

    ctx.fillStyle = count > 30 ? '#CD853F' : '#DEB887';
    ctx.beginPath();
    ctx.ellipse(x, y - 20, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // 汎用アクション
  const drawGenericAction = (ctx: CanvasRenderingContext2D, x: number, y: number, instruction: string) => {
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(instruction, x, y);
  };

  // シーンを更新
  useEffect(() => {
    drawScene();
  }, [gameState, drawScene]);

  // タイミングゲーム
  useEffect(() => {
    if (currentStep?.type === 'wait' && currentStep.timing) {
      let phase = 0;
      const animate = () => {
        phase = (phase + 2) % 360;
        const isPerfect = phase > 160 && phase < 200;
        updateTimingPhase(phase, isPerfect);
        timingTimerRef.current = requestAnimationFrame(animate);
      };
      timingTimerRef.current = requestAnimationFrame(animate);

      return () => {
        if (timingTimerRef.current) {
          cancelAnimationFrame(timingTimerRef.current);
        }
      };
    }
  }, [currentStep, updateTimingPhase]);

  // スパークルを追加
  const addSparkle = (x: number, y: number) => {
    const id = Date.now();
    setSparkles(prev => [...prev, { id, x, y }]);
  };

  // スパークルを削除
  const removeSparkle = (id: number) => {
    setSparkles(prev => prev.filter(s => s.id !== id));
  };

  // 入力処理
  const handleInput = useCallback((type: 'start' | 'move' | 'end', e?: React.MouseEvent | React.TouchEvent) => {
    if (!currentStep) return;

    let pos: { x: number; y: number } | null = null;

    if (e) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      if ('touches' in e && e.touches.length > 0) {
        pos = {
          x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
          y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
        };
      } else if ('clientX' in e) {
        pos = {
          x: (e.clientX - rect.left) * (canvas.width / rect.width),
          y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
      }

      if (pos) {
        lastInputPosRef.current = pos;
      }
    }

    const step = currentStep;
    const count = step.count || 1;

    switch (step.type) {
      case 'tap':
        if (type === 'start') {
          soundManager.play('tap');
          incrementAction();
          if (lastInputPosRef.current) {
            addSparkle(lastInputPosRef.current.x, lastInputPosRef.current.y);
          }
          setCharacterExpression('excited');
          if (gameState.actionCount + 1 >= count) {
            soundManager.play('success');
            setCharacterMessage('いいね！');
            setTimeout(() => {
              setCharacterMessage('');
              nextStep();
            }, 500);
          }
        }
        break;

      case 'mix':
        if (type === 'move' && lastInputPosRef.current) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const center = { x: canvas.width / 2, y: canvas.height / 2 };
          const angle = Math.atan2(
            lastInputPosRef.current.y - center.y,
            lastInputPosRef.current.x - center.x
          );
          const angleDiff = Math.abs(angle - gameState.mixAngle);
          if (angleDiff > 0.1) {
            soundManager.play('mix');
            updateMixAngle(angle);
            setCharacterExpression('excited');
            if (gameState.actionCount + 1 >= count * 5) {
              soundManager.play('success');
              setCharacterMessage('じょうず！');
              setTimeout(() => {
                setCharacterMessage('');
                nextStep();
              }, 500);
            }
          }
        }
        break;

      case 'drag':
        if (type === 'start') {
          isInteractingRef.current = true;
        } else if (type === 'end' && isInteractingRef.current && lastInputPosRef.current) {
          soundManager.play('pour');
          soundManager.play('success');
          setCharacterMessage('ナイス！');
          setTimeout(() => {
            setCharacterMessage('');
            nextStep();
          }, 500);
          isInteractingRef.current = false;
        }
        break;

      case 'cut':
        if (type === 'start') {
          isInteractingRef.current = true;
        } else if (type === 'end' && isInteractingRef.current) {
          soundManager.play('cut');
          incrementAction();
          addSparkle(lastInputPosRef.current?.x || 0, lastInputPosRef.current?.y || 0);
          setCharacterExpression('excited');
          if (gameState.actionCount + 1 >= count) {
            soundManager.play('success');
            setCharacterMessage('できた！');
            setTimeout(() => {
              setCharacterMessage('');
              nextStep();
            }, 500);
          }
          isInteractingRef.current = false;
        }
        break;

      case 'hold':
        if (type === 'start') {
          isInteractingRef.current = true;
          sizzleStopRef.current = soundManager.playSizzle(step.duration || 3);
          setCharacterExpression('nervous');
          holdTimerRef.current = setInterval(() => {
            updateHoldProgress(gameState.holdProgress + 2, true);
            if (gameState.holdProgress >= 100) {
              if (holdTimerRef.current) clearInterval(holdTimerRef.current);
              if (sizzleStopRef.current) sizzleStopRef.current();
              soundManager.play('success');
              setCharacterExpression('happy');
              setCharacterMessage('いいやけぐあい！');
              setTimeout(() => {
                setCharacterMessage('');
                nextStep();
              }, 500);
            }
          }, 50);
        } else if (type === 'end') {
          if (holdTimerRef.current) clearInterval(holdTimerRef.current);
          if (sizzleStopRef.current) sizzleStopRef.current();
          updateHoldProgress(gameState.holdProgress, false);
          isInteractingRef.current = false;
        }
        break;

      case 'wait':
        if (type === 'start') {
          if (gameState.perfectZone) {
            soundManager.play('success');
            updateScore(10);
            setCharacterExpression('sparkle');
            setCharacterMessage('パーフェクト！');
            setTimeout(() => {
              setCharacterMessage('');
              nextStep();
            }, 500);
          } else {
            soundManager.play('pop');
            updateScore(-10);
            setCharacterExpression('thinking');
            setCharacterMessage('おしい！');
            setTimeout(() => setCharacterMessage(''), 500);
          }
        }
        break;

      case 'draw':
        if ((type === 'start' || type === 'move') && lastInputPosRef.current) {
          addDrawPoint(lastInputPosRef.current);
          soundManager.play('mix');
        } else if (type === 'end') {
          if (gameState.drawnPoints.length > 20) {
            soundManager.play('success');
            setCharacterMessage('かんせい！');
            setTimeout(() => {
              setCharacterMessage('');
              nextStep();
            }, 500);
          }
        }
        break;
    }
  }, [currentStep, gameState, incrementAction, nextStep, updateScore, updateMixAngle, addDrawPoint, updateHoldProgress]);

  // 戻るボタン
  const handleBack = () => {
    if (confirm('りょうりをやめる？')) {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (timingTimerRef.current) cancelAnimationFrame(timingTimerRef.current);
      if (sizzleStopRef.current) sizzleStopRef.current();
      onBack();
    }
  };

  if (!recipe || !currentStep) return null;

  const progress = (gameState.currentStep / recipe.steps.length) * 100;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-cyan-100 to-cyan-200">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 shadow-md">
        <Button variant="back" size="small" onClick={handleBack}>
          ←
        </Button>
        <h2 className="text-xl font-bold text-pink-500">
          {recipe.name}をつくろう！
        </h2>
        <div className="w-28 h-5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* 調理エリア */}
      <div ref={containerRef} className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* キャンバス */}
        <canvas
          ref={canvasRef}
          className="bg-white rounded-3xl shadow-xl touch-none"
          onMouseDown={(e) => handleInput('start', e)}
          onMouseMove={(e) => handleInput('move', e)}
          onMouseUp={() => handleInput('end')}
          onMouseLeave={() => handleInput('end')}
          onTouchStart={(e) => { e.preventDefault(); handleInput('start', e); }}
          onTouchMove={(e) => { e.preventDefault(); handleInput('move', e); }}
          onTouchEnd={(e) => { e.preventDefault(); handleInput('end'); }}
        />

        {/* キラキラエフェクト */}
        {sparkles.map(s => (
          <Sparkle key={s.id} x={s.x} y={s.y} onComplete={() => removeSparkle(s.id)} />
        ))}

        {/* 湯気 */}
        <Steam active={gameState.isHolding} className="top-20" />

        {/* 指示バブル */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg animate-[bubblePop_0.5s_ease]">
          <span className="text-lg font-bold text-gray-700">
            💬 {currentStep.instruction}
          </span>
        </div>
      </div>

      {/* キャラクター */}
      <div className="absolute bottom-24 right-4">
        <Character
          expression={characterExpression}
          size="small"
          message={characterMessage}
          animate={true}
        />
      </div>

      {/* ツールバー */}
      <div className="flex justify-center gap-4 p-4 bg-white/90 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-3xl shadow-lg">
          {currentStep.type === 'tap' && '👆'}
          {currentStep.type === 'mix' && '🥄'}
          {currentStep.type === 'drag' && '👇'}
          {currentStep.type === 'cut' && '👋'}
          {currentStep.type === 'hold' && '✋'}
          {currentStep.type === 'wait' && '⏰'}
          {currentStep.type === 'draw' && '✏️'}
        </div>
      </div>
    </div>
  );
};
