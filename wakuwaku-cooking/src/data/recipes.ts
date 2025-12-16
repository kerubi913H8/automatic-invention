import type { Recipe } from '../types';

// レシピデータ
export const recipes: Recipe[] = [
  // オムレツ（チュートリアル・無料）
  {
    id: 'omelette',
    name: 'オムレツ',
    icon: '🍳',
    color: '#FFD700',
    unlockStars: 0,
    steps: [
      {
        id: 'crack-egg',
        type: 'tap',
        target: 'egg',
        instruction: 'たまごをタップしてわろう！',
        count: 3
      },
      {
        id: 'mix-egg',
        type: 'mix',
        target: 'bowl',
        instruction: 'たまごをまぜまぜしよう！',
        count: 10
      },
      {
        id: 'pour-egg',
        type: 'drag',
        target: 'pan',
        instruction: 'フライパンにたまごをいれよう！'
      },
      {
        id: 'cook-egg',
        type: 'hold',
        target: 'pan',
        instruction: 'おさえてやこう！',
        duration: 3
      },
      {
        id: 'fold-omelette',
        type: 'cut',
        target: 'omelette',
        instruction: 'スワイプしてまこう！',
        count: 2
      },
      {
        id: 'plate',
        type: 'drag',
        target: 'plate',
        instruction: 'おさらにのせよう！'
      },
      {
        id: 'ketchup',
        type: 'draw',
        target: 'ketchup',
        instruction: 'ケチャップでかおをかこう！'
      }
    ]
  },

  // デコレーションクッキー
  {
    id: 'cookie',
    name: 'クッキー',
    icon: '🍪',
    color: '#DEB887',
    unlockStars: 3,
    steps: [
      {
        id: 'add-flour',
        type: 'tap',
        target: 'flour',
        instruction: 'こむぎこをいれよう！',
        count: 3
      },
      {
        id: 'add-butter',
        type: 'tap',
        target: 'butter',
        instruction: 'バターをいれよう！',
        count: 2
      },
      {
        id: 'add-sugar',
        type: 'tap',
        target: 'sugar',
        instruction: 'おさとうをいれよう！',
        count: 2
      },
      {
        id: 'mix-dough',
        type: 'mix',
        target: 'bowl',
        instruction: 'こねこねしよう！',
        count: 15
      },
      {
        id: 'cut-shapes',
        type: 'tap',
        target: 'cutter',
        instruction: 'かたぬきしよう！',
        count: 5
      },
      {
        id: 'bake',
        type: 'wait',
        target: 'oven',
        instruction: 'オーブンでやこう！いいいろになったらタップ！',
        timing: true
      },
      {
        id: 'decorate',
        type: 'draw',
        target: 'icing',
        instruction: 'アイシングでデコレーションしよう！'
      }
    ]
  },

  // ハンバーガー
  {
    id: 'hamburger',
    name: 'ハンバーガー',
    icon: '🍔',
    color: '#8B4513',
    unlockStars: 6,
    steps: [
      {
        id: 'choose-bun',
        type: 'tap',
        target: 'bun',
        instruction: 'パンをえらぼう！',
        count: 1
      },
      {
        id: 'add-lettuce',
        type: 'drag',
        target: 'lettuce',
        instruction: 'レタスをのせよう！'
      },
      {
        id: 'cook-patty',
        type: 'hold',
        target: 'patty',
        instruction: 'おにくをやこう！',
        duration: 4
      },
      {
        id: 'flip-patty',
        type: 'cut',
        target: 'patty',
        instruction: 'スワイプしてひっくりかえそう！',
        count: 1
      },
      {
        id: 'add-cheese',
        type: 'drag',
        target: 'cheese',
        instruction: 'チーズをのせよう！'
      },
      {
        id: 'add-patty',
        type: 'drag',
        target: 'stack',
        instruction: 'パティをのせよう！'
      },
      {
        id: 'add-sauce',
        type: 'tap',
        target: 'sauce',
        instruction: 'ソースをかけよう！',
        count: 3
      },
      {
        id: 'close-burger',
        type: 'drag',
        target: 'top-bun',
        instruction: 'うえのパンをのせてかんせい！'
      }
    ]
  },

  // いちごケーキ
  {
    id: 'cake',
    name: 'ケーキ',
    icon: '🍰',
    color: '#FFB6C1',
    unlockStars: 9,
    steps: [
      {
        id: 'add-flour',
        type: 'tap',
        target: 'flour',
        instruction: 'こむぎこをいれよう！',
        count: 3
      },
      {
        id: 'add-eggs',
        type: 'tap',
        target: 'egg',
        instruction: 'たまごをいれよう！',
        count: 3
      },
      {
        id: 'add-sugar',
        type: 'tap',
        target: 'sugar',
        instruction: 'おさとうをいれよう！',
        count: 2
      },
      {
        id: 'mix-batter',
        type: 'mix',
        target: 'bowl',
        instruction: 'しっかりまぜよう！',
        count: 15
      },
      {
        id: 'bake-cake',
        type: 'wait',
        target: 'oven',
        instruction: 'オーブンでやこう！',
        timing: true
      },
      {
        id: 'spread-cream',
        type: 'cut',
        target: 'cream',
        instruction: 'クリームをぬろう！',
        count: 5
      },
      {
        id: 'add-strawberry',
        type: 'tap',
        target: 'strawberry',
        instruction: 'いちごをかざろう！',
        count: 8
      },
      {
        id: 'decorate',
        type: 'draw',
        target: 'decoration',
        instruction: 'すきなもようをかこう！'
      }
    ]
  },

  // パンケーキ
  {
    id: 'pancake',
    name: 'パンケーキ',
    icon: '🥞',
    color: '#DEB887',
    unlockStars: 5,
    steps: [
      {
        id: 'add-flour',
        type: 'tap',
        target: 'flour',
        instruction: 'こむぎこをいれよう！',
        count: 3
      },
      {
        id: 'add-egg',
        type: 'tap',
        target: 'egg',
        instruction: 'たまごをわろう！',
        count: 2
      },
      {
        id: 'add-milk',
        type: 'tap',
        target: 'milk',
        instruction: 'ぎゅうにゅうをいれよう！',
        count: 3
      },
      {
        id: 'mix',
        type: 'mix',
        target: 'bowl',
        instruction: 'まぜまぜしよう！',
        count: 12
      },
      {
        id: 'pour-batter',
        type: 'drag',
        target: 'pan',
        instruction: 'きじをフライパンにながそう！'
      },
      {
        id: 'wait-bubbles',
        type: 'wait',
        target: 'pancake',
        instruction: 'ぷくぷくしたらタップ！',
        timing: true
      },
      {
        id: 'flip',
        type: 'cut',
        target: 'pancake',
        instruction: 'スワイプしてひっくりかえそう！',
        count: 1
      },
      {
        id: 'topping',
        type: 'tap',
        target: 'topping',
        instruction: 'トッピングをのせよう！',
        count: 5
      }
    ]
  },

  // カレーライス
  {
    id: 'curry',
    name: 'カレーライス',
    icon: '🍛',
    color: '#CD853F',
    unlockStars: 12,
    steps: [
      {
        id: 'cut-potato',
        type: 'tap',
        target: 'potato',
        instruction: 'じゃがいもをきろう！',
        count: 4
      },
      {
        id: 'cut-carrot',
        type: 'tap',
        target: 'carrot',
        instruction: 'にんじんをきろう！',
        count: 4
      },
      {
        id: 'cut-onion',
        type: 'tap',
        target: 'onion',
        instruction: 'たまねぎをきろう！',
        count: 4
      },
      {
        id: 'cook-meat',
        type: 'hold',
        target: 'meat',
        instruction: 'おにくをいためよう！',
        duration: 3
      },
      {
        id: 'add-vegetables',
        type: 'drag',
        target: 'pot',
        instruction: 'やさいをおなべにいれよう！'
      },
      {
        id: 'stew',
        type: 'mix',
        target: 'pot',
        instruction: 'ぐつぐつにこもう！',
        count: 10
      },
      {
        id: 'add-roux',
        type: 'tap',
        target: 'roux',
        instruction: 'ルーをいれよう！',
        count: 3
      },
      {
        id: 'serve',
        type: 'drag',
        target: 'plate',
        instruction: 'ごはんにかけよう！'
      }
    ]
  }
];

// IDからレシピを取得
export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};

// 星の数で解放済みレシピを取得
export const getUnlockedRecipes = (stars: number): Recipe[] => {
  return recipes.filter(recipe => (recipe.unlockStars || 0) <= stars);
};
