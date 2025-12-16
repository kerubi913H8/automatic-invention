import { useEffect } from 'react';
import { TitleScreen } from './components/screens/TitleScreen';
import { RecipeSelectScreen } from './components/screens/RecipeSelectScreen';
import { CookingScreen } from './components/screens/CookingScreen';
import { CompleteScreen } from './components/screens/CompleteScreen';
import { useGameState } from './hooks/useGameState';
import { soundManager } from './utils/soundManager';

function App() {
  const {
    gameState,
    totalStars,
    unlockedRecipes,
    setScreen,
    startCooking,
    incrementAction,
    nextStep,
    updateScore,
    updateMixAngle,
    addDrawPoint,
    updateTimingPhase,
    updateHoldProgress,
    completeCooking,
    playAgain,
    goToMenu,
    getRecipeStars
  } = useGameState();

  // 初回タッチでAudioContextを初期化
  useEffect(() => {
    const initAudio = () => {
      soundManager.init();
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('mousedown', initAudio);
    };
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('mousedown', initAudio);
    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('mousedown', initAudio);
    };
  }, []);

  // タッチフィードバック
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const feedback = document.createElement('div');
      feedback.className = 'touch-feedback';
      feedback.style.left = `${touch.clientX}px`;
      feedback.style.top = `${touch.clientY}px`;
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 500);
    };

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, []);

  // 画面をレンダリング
  const renderScreen = () => {
    switch (gameState.currentScreen) {
      case 'title':
        return (
          <TitleScreen
            onStart={() => setScreen('recipe-select')}
          />
        );

      case 'recipe-select':
        return (
          <RecipeSelectScreen
            totalStars={totalStars}
            unlockedRecipes={unlockedRecipes}
            getRecipeStars={getRecipeStars}
            onSelectRecipe={startCooking}
            onBack={() => setScreen('title')}
          />
        );

      case 'cooking':
        return (
          <CookingScreen
            gameState={gameState}
            onBack={goToMenu}
            incrementAction={incrementAction}
            nextStep={nextStep}
            updateScore={updateScore}
            updateMixAngle={updateMixAngle}
            addDrawPoint={addDrawPoint}
            updateTimingPhase={updateTimingPhase}
            updateHoldProgress={updateHoldProgress}
          />
        );

      case 'complete':
        return (
          <CompleteScreen
            gameState={gameState}
            onPlayAgain={playAgain}
            onMenu={goToMenu}
            onComplete={completeCooking}
          />
        );

      default:
        return (
          <TitleScreen
            onStart={() => setScreen('recipe-select')}
          />
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderScreen()}
    </div>
  );
}

export default App;
