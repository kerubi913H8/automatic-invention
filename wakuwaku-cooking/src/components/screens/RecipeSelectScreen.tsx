import React from 'react';
import { Button } from '../common/Button';
import type { Recipe } from '../../types';
import { recipes } from '../../data/recipes';
import { soundManager } from '../../utils/soundManager';

interface RecipeSelectScreenProps {
  totalStars: number;
  unlockedRecipes: string[];
  getRecipeStars: (recipeId: string) => number;
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
}

export const RecipeSelectScreen: React.FC<RecipeSelectScreenProps> = ({
  totalStars,
  unlockedRecipes,
  getRecipeStars,
  onSelectRecipe,
  onBack
}) => {
  const handleSelectRecipe = (recipe: Recipe) => {
    const isUnlocked = unlockedRecipes.includes(recipe.id);
    if (isUnlocked) {
      soundManager.play('success');
      onSelectRecipe(recipe);
    } else {
      soundManager.play('pop');
      // TODO: Show unlock message modal
      alert(`あと ${(recipe.unlockStars || 0) - totalStars} つの⭐をあつめよう！`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-orange-100 to-orange-200">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 shadow-md">
        <Button variant="back" size="small" onClick={onBack}>
          ←
        </Button>
        <h2 className="text-2xl font-bold text-pink-500">
          なにをつくる？
        </h2>
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full text-white font-bold shadow-md">
          ⭐ {totalStars}
        </div>
      </header>

      {/* レシピグリッド */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {recipes.map(recipe => {
            const isUnlocked = unlockedRecipes.includes(recipe.id);
            const stars = getRecipeStars(recipe.id);

            return (
              <div
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe)}
                className={`
                  relative
                  bg-white rounded-3xl p-4
                  shadow-[0_8px_0_rgba(0,0,0,0.1),0_15px_30px_rgba(0,0,0,0.1)]
                  transition-all duration-300
                  cursor-pointer
                  ${isUnlocked
                    ? 'hover:translate-y-[-5px] hover:shadow-[0_12px_0_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_4px_0_rgba(0,0,0,0.1),0_8px_15px_rgba(0,0,0,0.1)]'
                    : 'opacity-60 grayscale-[50%]'
                  }
                `}
              >
                {/* ロックアイコン */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-2xl">
                    🔒
                  </div>
                )}

                {/* レシピアイコン */}
                <div
                  className="text-6xl text-center mb-2"
                  style={{
                    animation: isUnlocked ? 'wiggle 2s ease-in-out infinite' : 'none'
                  }}
                >
                  {recipe.icon}
                </div>

                {/* レシピ名 */}
                <div className="text-lg font-bold text-pink-500 text-center mb-2">
                  {recipe.name}
                </div>

                {/* 星評価 */}
                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`text-lg ${i <= stars ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* アンロック条件 */}
                {!isUnlocked && recipe.unlockStars !== undefined && (
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    ⭐{recipe.unlockStars}で かいほう
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
