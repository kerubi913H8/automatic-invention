// ゲームの型定義

// 画面の種類
export type ScreenType = 'title' | 'recipe-select' | 'cooking' | 'complete' | 'album';

// 調理アクションの種類
export type CookingActionType =
  | 'tap'      // タップ（たたく、いれる、えらぶ）
  | 'mix'      // まぜる（円を描くようにドラッグ）
  | 'cut'      // きる（横にスワイプ）
  | 'drag'     // はこぶ（ドラッグ&ドロップ）
  | 'hold'     // 長押し（やく、ゆでる、しぼる）
  | 'draw'     // 描く（ケチャップアートなど）
  | 'wait';    // タイミングゲーム

// 調理ステップ
export interface CookingStep {
  id: string;
  type: CookingActionType;
  target: string;
  instruction: string;  // ひらがな表記
  count?: number;       // 必要回数
  timing?: boolean;     // タイミングゲームかどうか
  duration?: number;    // 長押しの場合の秒数
  minProgress?: number; // 最小進捗（0-100）
}

// レシピ定義
export interface Recipe {
  id: string;
  name: string;        // ひらがな表記
  icon: string;        // 絵文字
  color: string;       // テーマカラー
  steps: CookingStep[];
  unlockStars?: number; // 解放に必要な星の数
}

// 焼き加減
export const CookingState = {
  RAW: 0,        // なま
  RARE: 1,       // レア
  MEDIUM: 2,     // ちょうどいい（理想）
  WELL_DONE: 3,  // よくやけた
  BURNT: 4       // こげちゃった
} as const;

export type CookingStateType = typeof CookingState[keyof typeof CookingState];

// リアクションの種類
export type ReactionType = 'PERFECT' | 'GOOD' | 'OK' | 'BAD';

// キャラクターの表情
export type CharacterExpression =
  | 'normal'    // にこにこ（通常）
  | 'excited'   // わくわく（料理開始時）
  | 'nervous'   // どきどき（調理中）
  | 'eating'    // もぐもぐ（食べる時）
  | 'happy'     // おいしい！（美味しい料理）
  | 'thinking'  // うーん...（まずい料理）
  | 'sparkle';  // きらきら（大成功）

// リアクション
export interface Reaction {
  expression: CharacterExpression;
  animation: string;
  sound: string;
  message: string;
}

// ゲーム状態
export interface GameState {
  currentScreen: ScreenType;
  currentRecipe: Recipe | null;
  currentStep: number;
  score: number;
  actionCount: number;
  mixAngle: number;
  drawnPoints: { x: number; y: number }[];
  cookingProgress: number;
  timingPhase: number;
  perfectZone: boolean;
  holdProgress: number;
  isHolding: boolean;
}

// 保存データ
export interface SavedData {
  totalStars: number;
  unlockedRecipes: string[];
  recipeStars: Record<string, number>;
  album: SavedDish[];
  achievements: string[];
}

// 保存された料理
export interface SavedDish {
  id: string;
  recipeId: string;
  timestamp: number;
  rating: ReactionType;
  stars: number;
  toppings?: string[];
  cookingTime?: number;
}

// サウンド
export type SoundType =
  | 'tap'
  | 'success'
  | 'mix'
  | 'cut'
  | 'sizzle'
  | 'pour'
  | 'pop'
  | 'star'
  | 'complete'
  | 'yay'
  | 'yum';

// タッチ/マウス入力
export interface InputEvent {
  x: number;
  y: number;
  type: 'start' | 'move' | 'end';
}
