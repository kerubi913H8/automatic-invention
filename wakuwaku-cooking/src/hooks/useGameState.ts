import { useState, useCallback } from 'react';
import type { GameState, ScreenType, Recipe, ReactionType } from '../types';
import { storageManager } from '../utils/storageManager';

const initialGameState: GameState = {
  currentScreen: 'title',
  currentRecipe: null,
  currentStep: 0,
  score: 100,
  actionCount: 0,
  mixAngle: 0,
  drawnPoints: [],
  cookingProgress: 0,
  timingPhase: 0,
  perfectZone: false,
  holdProgress: 0,
  isHolding: false
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [totalStars, setTotalStars] = useState(storageManager.getTotalStars());
  const [unlockedRecipes, setUnlockedRecipes] = useState(storageManager.getUnlockedRecipes());

  // 画面遷移
  const setScreen = useCallback((screen: ScreenType) => {
    setGameState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  // レシピを選択して調理開始
  const startCooking = useCallback((recipe: Recipe) => {
    setGameState({
      ...initialGameState,
      currentScreen: 'cooking',
      currentRecipe: recipe,
      currentStep: 0,
      score: 100
    });
  }, []);

  // アクションカウントを更新
  const incrementAction = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      actionCount: prev.actionCount + 1
    }));
  }, []);

  // アクションカウントをリセット
  const resetAction = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      actionCount: 0,
      drawnPoints: [],
      holdProgress: 0,
      isHolding: false
    }));
  }, []);

  // 次のステップへ
  const nextStep = useCallback(() => {
    setGameState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      const recipe = prev.currentRecipe;

      if (recipe && nextStepIndex >= recipe.steps.length) {
        // 調理完了
        return { ...prev, currentScreen: 'complete' };
      }

      return {
        ...prev,
        currentStep: nextStepIndex,
        actionCount: 0,
        drawnPoints: [],
        holdProgress: 0,
        isHolding: false
      };
    });
  }, []);

  // スコアを更新
  const updateScore = useCallback((delta: number) => {
    setGameState(prev => ({
      ...prev,
      score: Math.max(0, Math.min(100, prev.score + delta))
    }));
  }, []);

  // ミックス角度を更新
  const updateMixAngle = useCallback((angle: number) => {
    setGameState(prev => ({
      ...prev,
      mixAngle: angle,
      actionCount: prev.actionCount + 1
    }));
  }, []);

  // 描画点を追加
  const addDrawPoint = useCallback((point: { x: number; y: number }) => {
    setGameState(prev => ({
      ...prev,
      drawnPoints: [...prev.drawnPoints, point]
    }));
  }, []);

  // タイミングフェーズを更新
  const updateTimingPhase = useCallback((phase: number, isPerfect: boolean) => {
    setGameState(prev => ({
      ...prev,
      timingPhase: phase,
      perfectZone: isPerfect
    }));
  }, []);

  // 長押し進捗を更新
  const updateHoldProgress = useCallback((progress: number, isHolding: boolean) => {
    setGameState(prev => ({
      ...prev,
      holdProgress: progress,
      isHolding
    }));
  }, []);

  // 調理完了時の処理
  const completeCooking = useCallback((stars: number, rating: ReactionType) => {
    if (gameState.currentRecipe) {
      storageManager.completeDish(
        gameState.currentRecipe.id,
        stars,
        rating
      );
      setTotalStars(storageManager.getTotalStars());
      setUnlockedRecipes(storageManager.getUnlockedRecipes());
    }
  }, [gameState.currentRecipe]);

  // もう一度遊ぶ
  const playAgain = useCallback(() => {
    if (gameState.currentRecipe) {
      startCooking(gameState.currentRecipe);
    }
  }, [gameState.currentRecipe, startCooking]);

  // メニューに戻る
  const goToMenu = useCallback(() => {
    setGameState(() => ({
      ...initialGameState,
      currentScreen: 'recipe-select'
    }));
  }, []);

  // レシピの星を取得
  const getRecipeStars = useCallback((recipeId: string) => {
    return storageManager.getRecipeStars(recipeId);
  }, []);

  // レシピがアンロック済みか確認
  const isRecipeUnlocked = useCallback((recipeId: string) => {
    return unlockedRecipes.includes(recipeId);
  }, [unlockedRecipes]);

  return {
    gameState,
    totalStars,
    unlockedRecipes,
    setScreen,
    startCooking,
    incrementAction,
    resetAction,
    nextStep,
    updateScore,
    updateMixAngle,
    addDrawPoint,
    updateTimingPhase,
    updateHoldProgress,
    completeCooking,
    playAgain,
    goToMenu,
    getRecipeStars,
    isRecipeUnlocked
  };
}
