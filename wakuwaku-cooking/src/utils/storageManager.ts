import type { SavedData, SavedDish, ReactionType } from '../types';

const STORAGE_KEY = 'wakuwaku_cooking_data';

// デフォルトデータ
const defaultData: SavedData = {
  totalStars: 0,
  unlockedRecipes: ['omelette'],  // オムレツは最初からプレイ可能
  recipeStars: {},
  album: [],
  achievements: []
};

class StorageManager {
  private data: SavedData;

  constructor() {
    this.data = this.load();
  }

  // データを読み込む
  private load(): SavedData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load save data:', e);
    }
    return { ...defaultData };
  }

  // データを保存
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  // 星の総数を取得
  getTotalStars(): number {
    return this.data.totalStars;
  }

  // レシピごとの星を取得
  getRecipeStars(recipeId: string): number {
    return this.data.recipeStars[recipeId] || 0;
  }

  // 解放済みレシピを取得
  getUnlockedRecipes(): string[] {
    return this.data.unlockedRecipes;
  }

  // レシピが解放されているか確認
  isRecipeUnlocked(recipeId: string): boolean {
    return this.data.unlockedRecipes.includes(recipeId);
  }

  // 料理完成時にデータを更新
  completeDish(
    recipeId: string,
    stars: number,
    rating: ReactionType,
    toppings?: string[],
    cookingTime?: number
  ): void {
    // 前回より星が多ければ更新
    const prevStars = this.data.recipeStars[recipeId] || 0;
    if (stars > prevStars) {
      this.data.recipeStars[recipeId] = stars;

      // 星の総数を再計算
      this.data.totalStars = Object.values(this.data.recipeStars).reduce(
        (sum, s) => sum + s,
        0
      );
    }

    // 新しいレシピをアンロック
    this.checkAndUnlockRecipes();

    // アルバムに追加
    const dish: SavedDish = {
      id: `${recipeId}-${Date.now()}`,
      recipeId,
      timestamp: Date.now(),
      rating,
      stars,
      toppings,
      cookingTime
    };
    this.data.album.unshift(dish);

    // アルバムは最大50件まで保存
    if (this.data.album.length > 50) {
      this.data.album = this.data.album.slice(0, 50);
    }

    this.save();
  }

  // レシピのアンロックをチェック
  private checkAndUnlockRecipes(): void {
    const unlockConditions: Record<string, number> = {
      omelette: 0,
      cookie: 3,
      pancake: 5,
      hamburger: 6,
      cake: 9,
      curry: 12
    };

    Object.entries(unlockConditions).forEach(([recipeId, requiredStars]) => {
      if (
        this.data.totalStars >= requiredStars &&
        !this.data.unlockedRecipes.includes(recipeId)
      ) {
        this.data.unlockedRecipes.push(recipeId);
      }
    });
  }

  // アルバムを取得
  getAlbum(): SavedDish[] {
    return this.data.album;
  }

  // 実績を取得
  getAchievements(): string[] {
    return this.data.achievements;
  }

  // 実績を追加
  addAchievement(achievementId: string): boolean {
    if (!this.data.achievements.includes(achievementId)) {
      this.data.achievements.push(achievementId);
      this.save();
      return true;
    }
    return false;
  }

  // データをリセット（開発用）
  reset(): void {
    this.data = { ...defaultData };
    this.save();
  }
}

// シングルトンインスタンス
export const storageManager = new StorageManager();
