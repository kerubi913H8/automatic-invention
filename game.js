/**
 * わくわくキッチン！ - キッズ料理ゲーム
 * Kids Cooking Game - Fun Interactive Experience
 */

class WakuwakuKitchen {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentRecipe = null;
        this.currentStep = 0;
        this.score = 0;
        this.totalStars = parseInt(localStorage.getItem('wakuwaku_stars') || '0');
        this.unlockedRecipes = JSON.parse(localStorage.getItem('wakuwaku_unlocked') || '["omurice"]');
        this.recipeStars = JSON.parse(localStorage.getItem('wakuwaku_recipe_stars') || '{}');
        this.albumItems = JSON.parse(localStorage.getItem('wakuwaku_album') || '[]');

        // 料理レシピデータ
        this.recipes = {
            omurice: {
                name: 'オムレツ',
                icon: '🍳',
                color: '#FFD700',
                steps: [
                    { type: 'tap', target: 'egg', instruction: 'たまごをタップしてわろう！', count: 3 },
                    { type: 'mix', target: 'bowl', instruction: 'たまごをまぜまぜしよう！', count: 10 },
                    { type: 'drag', target: 'batter', instruction: 'たまごをフライパンにいれよう！' },
                    { type: 'wait', target: 'cook', instruction: 'いいいろになったらタップ！', timing: true },
                    { type: 'swipe', target: 'pan', instruction: 'スワイプしてまこう！', count: 3 },
                    { type: 'tap', target: 'plate', instruction: 'おさらにもりつけよう！', count: 1 },
                    { type: 'draw', target: 'ketchup_art', instruction: 'ケチャップでかおをかいてね！' }
                ]
            },
            pancake: {
                name: 'パンケーキ',
                icon: '🥞',
                color: '#DEB887',
                steps: [
                    { type: 'tap', target: 'flour', instruction: 'こむぎこをいれよう！', count: 3 },
                    { type: 'tap', target: 'egg', instruction: 'たまごをわろう！', count: 2 },
                    { type: 'tap', target: 'milk', instruction: 'ぎゅうにゅうをいれよう！', count: 3 },
                    { type: 'mix', target: 'bowl', instruction: 'まぜまぜしよう！', count: 15 },
                    { type: 'drag', target: 'batter', instruction: 'きじをフライパンにながそう！' },
                    { type: 'wait', target: 'pancake', instruction: 'ぷくぷくしたらタップ！', timing: true },
                    { type: 'swipe', target: 'flip', instruction: 'スワイプしてひっくりかえそう！', count: 1 },
                    { type: 'tap', target: 'topping', instruction: 'トッピングをのせよう！', count: 5 }
                ]
            },
            curry: {
                name: 'カレーライス',
                icon: '🍛',
                color: '#CD853F',
                steps: [
                    { type: 'tap', target: 'potato', instruction: 'じゃがいもをきろう！', count: 4 },
                    { type: 'tap', target: 'carrot', instruction: 'にんじんをきろう！', count: 4 },
                    { type: 'tap', target: 'onion', instruction: 'たまねぎをきろう！', count: 4 },
                    { type: 'tap', target: 'meat', instruction: 'おにくをいためよう！', count: 5 },
                    { type: 'drag', target: 'vegetables', instruction: 'やさいをおなべにいれよう！' },
                    { type: 'mix', target: 'pot', instruction: 'ぐつぐつにこもう！', count: 10 },
                    { type: 'tap', target: 'roux', instruction: 'ルーをいれよう！', count: 3 },
                    { type: 'tap', target: 'plate', instruction: 'ごはんにかけよう！', count: 1 }
                ]
            },
            hamburger: {
                name: 'ハンバーグ',
                icon: '🍔',
                color: '#8B4513',
                steps: [
                    { type: 'tap', target: 'meat', instruction: 'ひきにくをボウルにいれよう！', count: 3 },
                    { type: 'tap', target: 'onion', instruction: 'たまねぎをきざもう！', count: 5 },
                    { type: 'tap', target: 'egg', instruction: 'たまごをいれよう！', count: 1 },
                    { type: 'mix', target: 'bowl', instruction: 'こねこねしよう！', count: 15 },
                    { type: 'tap', target: 'shape', instruction: 'まるくかたちをつくろう！', count: 5 },
                    { type: 'swipe', target: 'pan', instruction: 'フライパンでやこう！', count: 3 },
                    { type: 'wait', target: 'cook', instruction: 'いいいろになったらタップ！', timing: true },
                    { type: 'tap', target: 'sauce', instruction: 'ソースをかけよう！', count: 3 }
                ]
            },
            cake: {
                name: 'いちごケーキ',
                icon: '🍰',
                color: '#FFB6C1',
                steps: [
                    { type: 'tap', target: 'flour', instruction: 'こむぎこをいれよう！', count: 3 },
                    { type: 'tap', target: 'sugar', instruction: 'さとうをいれよう！', count: 3 },
                    { type: 'tap', target: 'egg', instruction: 'たまごをわろう！', count: 3 },
                    { type: 'mix', target: 'bowl', instruction: 'しっかりまぜよう！', count: 15 },
                    { type: 'wait', target: 'oven', instruction: 'オーブンでやこう！', timing: true },
                    { type: 'swipe', target: 'cream', instruction: 'クリームをぬろう！', count: 5 },
                    { type: 'tap', target: 'strawberry', instruction: 'いちごをかざろう！', count: 8 },
                    { type: 'draw', target: 'decoration', instruction: 'すきなもようをかこう！' }
                ]
            },
            cookie: {
                name: 'デコクッキー',
                icon: '🍪',
                color: '#D2691E',
                steps: [
                    { type: 'tap', target: 'flour', instruction: 'こむぎこをいれよう！', count: 3 },
                    { type: 'tap', target: 'butter', instruction: 'バターをいれよう！', count: 2 },
                    { type: 'tap', target: 'sugar', instruction: 'おさとうもいれよう！', count: 2 },
                    { type: 'mix', target: 'bowl', instruction: 'こねこねしよう！', count: 15 },
                    { type: 'tap', target: 'shape', instruction: 'かたぬきしよう！', count: 5 },
                    { type: 'wait', target: 'oven', instruction: 'オーブンでやこう！', timing: true },
                    { type: 'tap', target: 'icing', instruction: 'アイシングをぬろう！', count: 5 },
                    { type: 'draw', target: 'decoration', instruction: 'すきなもようをかこう！' }
                ]
            }
        };

        // ゲーム状態
        this.gameState = {
            actionCount: 0,
            mixAngle: 0,
            objects: [],
            drawnPoints: [],
            timingPhase: 0,
            perfectZone: false
        };

        // サウンドコンテキスト
        this.audioContext = null;

        this.init();
    }

    init() {
        this.updateStarsDisplay();
        this.renderRecipeGrid();
        this.initCanvas();
        this.initTouchFeedback();
        this.updateAlbumCount();
    }

    // ========== クッキーくまリアクション ==========
    bearReact(type, message) {
        const bear = document.getElementById('cookie-bear');
        const expression = document.getElementById('bear-expression');
        const speech = document.getElementById('bear-speech');

        if (!bear || !expression || !speech) return;

        const expressions = {
            happy: '😊',
            excited: '😄',
            thinking: '🤔',
            sparkle: '✨',
            love: '😍',
            cheer: '🎉'
        };

        expression.textContent = expressions[type] || '😊';
        expression.style.animation = 'none';
        setTimeout(() => { expression.style.animation = 'expressionPop 0.5s ease'; }, 10);

        if (message) {
            speech.textContent = message;
            speech.classList.add('show');
            setTimeout(() => {
                speech.classList.remove('show');
            }, 2000);
        }
    }

    bearEncourage() {
        const messages = [
            'がんばって！',
            'いいかんじ！',
            'すごいね！',
            'じょうずだね！',
            'もうすこし！',
            'できるよ！'
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        this.bearReact('excited', randomMsg);
    }

    // ========== サウンドエフェクト ==========
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(type) {
        this.initAudio();
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const sounds = {
            tap: { freq: 800, duration: 0.1, type: 'sine' },
            success: { freq: 523, duration: 0.3, type: 'sine', melody: [523, 659, 784] },
            mix: { freq: 200, duration: 0.05, type: 'triangle' },
            cut: { freq: 1200, duration: 0.08, type: 'sawtooth' },
            complete: { freq: 523, duration: 0.5, type: 'sine', melody: [523, 659, 784, 1047] },
            star: { freq: 880, duration: 0.2, type: 'sine' },
            pop: { freq: 400, duration: 0.15, type: 'square' },
            crack: { freq: 1000, duration: 0.1, type: 'square' },
            sizzle: { freq: 150, duration: 0.15, type: 'sawtooth' },
            pour: { freq: 300, duration: 0.2, type: 'sine' },
            yay: { freq: 659, duration: 0.3, type: 'sine', melody: [659, 784, 880] },
            cheer: { freq: 784, duration: 0.25, type: 'sine', melody: [784, 880, 1047, 880] }
        };

        const sound = sounds[type] || sounds.tap;

        if (sound.melody) {
            sound.melody.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = sound.type;
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sound.duration);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + sound.duration);
                }, i * 150);
            });
        } else {
            oscillator.type = sound.type;
            oscillator.frequency.value = sound.freq;
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sound.duration);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + sound.duration);
        }
    }

    // ========== 画面遷移 ==========
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // アルバム画面を開いたときにレンダリング
        if (screenId === 'album-screen') {
            this.renderAlbum();
        }
    }

    startGame() {
        this.playSound('tap');
        this.showScreen('menu-screen');
    }

    // ========== レシピグリッド ==========
    renderRecipeGrid() {
        const grid = document.getElementById('recipe-grid');
        grid.innerHTML = '';

        Object.entries(this.recipes).forEach(([id, recipe]) => {
            const isUnlocked = this.unlockedRecipes.includes(id);
            const stars = this.recipeStars[id] || 0;

            const card = document.createElement('div');
            card.className = `recipe-card ${isUnlocked ? '' : 'locked'}`;
            card.innerHTML = `
                <span class="recipe-icon">${recipe.icon}</span>
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-stars">
                    ${[1, 2, 3].map(i => `<span class="star ${i <= stars ? 'earned' : ''}">⭐</span>`).join('')}
                </div>
            `;

            if (isUnlocked) {
                card.onclick = () => this.selectRecipe(id);
            } else {
                card.onclick = () => this.showLockedMessage();
            }

            grid.appendChild(card);
        });
    }

    showLockedMessage() {
        this.playSound('pop');
        // 簡単なアラート（将来的にはカスタムモーダルに）
        alert('もっとあそんで⭐をあつめよう！');
    }

    selectRecipe(recipeId) {
        this.playSound('success');
        this.currentRecipe = this.recipes[recipeId];
        this.currentRecipeId = recipeId;
        this.currentStep = 0;
        this.score = 100;
        this.gameState = {
            actionCount: 0,
            mixAngle: 0,
            objects: [],
            drawnPoints: [],
            timingPhase: 0,
            perfectZone: false
        };

        document.getElementById('cooking-title').textContent = this.currentRecipe.name;
        this.showScreen('cooking-screen');
        this.startCookingStep();
    }

    // ========== キャンバス初期化 ==========
    initCanvas() {
        this.canvas = document.getElementById('cooking-canvas');
        this.ctx = this.canvas.getContext('2d');

        const resize = () => {
            const container = document.getElementById('cooking-area');
            const size = Math.min(container.clientWidth - 40, container.clientHeight - 100, 500);
            this.canvas.width = size;
            this.canvas.height = size;
            if (this.currentRecipe) {
                this.drawCookingScene();
            }
        };

        window.addEventListener('resize', resize);
        resize();

        // タッチ/マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.handleInput('start', e));
        this.canvas.addEventListener('mousemove', (e) => this.handleInput('move', e));
        this.canvas.addEventListener('mouseup', (e) => this.handleInput('end', e));
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleInput('start', e.touches[0]); });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.handleInput('move', e.touches[0]); });
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.handleInput('end', null); });
    }

    getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    // ========== 入力処理 ==========
    handleInput(type, e) {
        if (!this.currentRecipe) return;
        const step = this.currentRecipe.steps[this.currentStep];
        if (!step) return;

        if (e) {
            const pos = this.getCanvasPos(e);
            this.lastInputPos = pos;
        }

        switch (step.type) {
            case 'tap':
                if (type === 'start') this.handleTap();
                break;
            case 'mix':
                if (type === 'move' && this.lastInputPos) this.handleMix();
                break;
            case 'drag':
                if (type === 'start') this.dragStart = this.lastInputPos;
                if (type === 'end' && this.dragStart) this.handleDrag();
                break;
            case 'swipe':
                if (type === 'start') this.swipeStart = this.lastInputPos;
                if (type === 'end' && this.swipeStart) this.handleSwipe();
                break;
            case 'wait':
                if (type === 'start') this.handleTimingTap();
                break;
            case 'draw':
                if (type === 'start' || type === 'move') this.handleDraw();
                if (type === 'end') this.checkDrawComplete();
                break;
        }
    }

    handleTap() {
        const step = this.currentRecipe.steps[this.currentStep];
        this.gameState.actionCount++;

        // ターゲットに応じた効果音
        const soundMap = {
            egg: 'crack',
            ketchup: 'pour',
            sauce: 'pour',
            flour: 'tap',
            butter: 'tap'
        };
        this.playSound(soundMap[step.target] || 'tap');

        this.createEffect('tap');
        this.drawCookingScene();

        if (this.gameState.actionCount >= step.count) {
            this.completeStep();
        }
    }

    handleMix() {
        const step = this.currentRecipe.steps[this.currentStep];
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const pos = this.lastInputPos;

        const angle = Math.atan2(pos.y - center.y, pos.x - center.x);
        const angleDiff = angle - this.gameState.mixAngle;

        if (Math.abs(angleDiff) > 0.1) {
            this.gameState.actionCount++;
            this.gameState.mixAngle = angle;
            this.playSound('mix');
            this.drawCookingScene();

            if (this.gameState.actionCount >= step.count * 5) {
                this.completeStep();
            }
        }
    }

    handleDrag() {
        const dy = this.lastInputPos.y - this.dragStart.y;
        if (dy > 50) {
            this.playSound('pour');
            this.completeStep();
        }
        this.dragStart = null;
    }

    handleSwipe() {
        const step = this.currentRecipe.steps[this.currentStep];
        const dx = Math.abs(this.lastInputPos.x - this.swipeStart.x);
        const dy = Math.abs(this.lastInputPos.y - this.swipeStart.y);

        if (dx > 50 || dy > 50) {
            this.gameState.actionCount++;

            // ターゲットに応じた効果音
            const soundMap = {
                pan: 'sizzle',
                flip: 'sizzle',
                cream: 'pour'
            };
            this.playSound(soundMap[step.target] || 'cut');

            this.createEffect('swipe');
            this.drawCookingScene();

            if (this.gameState.actionCount >= step.count) {
                this.completeStep();
            }
        }
        this.swipeStart = null;
    }

    handleTimingTap() {
        if (this.gameState.perfectZone) {
            this.playSound('success');
            this.score = Math.min(100, this.score + 10);
            this.completeStep();
        } else {
            this.playSound('pop');
            this.score = Math.max(0, this.score - 10);
        }
    }

    handleDraw() {
        if (this.lastInputPos) {
            this.gameState.drawnPoints.push({ ...this.lastInputPos });
            this.playSound('mix');
            this.drawCookingScene();
        }
    }

    checkDrawComplete() {
        if (this.gameState.drawnPoints.length > 20) {
            this.completeStep();
        }
    }

    // ========== ステップ管理 ==========
    startCookingStep() {
        const step = this.currentRecipe.steps[this.currentStep];
        if (!step) {
            this.completeCooking();
            return;
        }

        this.gameState.actionCount = 0;
        this.gameState.drawnPoints = [];
        document.getElementById('instruction-text').textContent = step.instruction;

        const progress = (this.currentStep / this.currentRecipe.steps.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        this.setupToolBar(step);
        this.drawCookingScene();

        if (step.type === 'wait') {
            this.startTimingGame();
        }
    }

    setupToolBar(step) {
        const toolbar = document.getElementById('tool-bar');
        const tools = {
            tap: ['👆'],
            mix: ['🥄'],
            drag: ['👇'],
            swipe: ['👋'],
            wait: ['⏰'],
            draw: ['✏️']
        };

        toolbar.innerHTML = (tools[step.type] || ['👆']).map(icon =>
            `<div class="tool-button active">${icon}</div>`
        ).join('');
    }

    startTimingGame() {
        this.gameState.timingPhase = 0;
        this.gameState.perfectZone = false;

        const animate = () => {
            if (!this.currentRecipe || this.currentRecipe.steps[this.currentStep]?.type !== 'wait') return;

            this.gameState.timingPhase = (this.gameState.timingPhase + 2) % 360;
            this.gameState.perfectZone = this.gameState.timingPhase > 160 && this.gameState.timingPhase < 200;
            this.drawCookingScene();

            requestAnimationFrame(animate);
        };
        animate();
    }

    completeStep() {
        this.playSound('success');
        this.currentStep++;
        this.createEffect('complete');
        this.createEffect('burst');

        // クッキーくまが応援
        if (Math.random() > 0.5) {
            this.bearEncourage();
        }

        setTimeout(() => {
            this.startCookingStep();
        }, 500);
    }

    // ========== 調理シーン描画 ==========
    drawCookingScene() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const step = this.currentRecipe.steps[this.currentStep];

        // 背景
        ctx.fillStyle = '#FFF8E7';
        ctx.fillRect(0, 0, w, h);

        // テーブル
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);

        if (!step) return;

        const centerX = w / 2;
        const centerY = h / 2;

        // ステップに応じた描画
        switch (step.target) {
            case 'egg':
                this.drawEgg(centerX, centerY, this.gameState.actionCount);
                break;
            case 'bowl':
            case 'pot':
                this.drawBowl(centerX, centerY, this.gameState.actionCount);
                break;
            case 'rice':
            case 'batter':
            case 'vegetables':
                this.drawDragItem(centerX, centerY - 100, step.target);
                this.drawPan(centerX, centerY + 50);
                break;
            case 'ketchup':
            case 'sauce':
            case 'topping':
            case 'strawberry':
            case 'icing':
                this.drawToppingScene(centerX, centerY, step.target, this.gameState.actionCount);
                break;
            case 'pan':
            case 'flip':
            case 'cream':
                this.drawPanScene(centerX, centerY, this.gameState.actionCount);
                break;
            case 'plate':
                this.drawPlateScene(centerX, centerY);
                break;
            case 'ketchup_art':
            case 'decoration':
                this.drawArtCanvas(centerX, centerY);
                break;
            case 'flour':
            case 'sugar':
            case 'milk':
            case 'butter':
                this.drawIngredient(centerX, centerY, step.target, this.gameState.actionCount);
                break;
            case 'potato':
            case 'carrot':
            case 'onion':
            case 'meat':
                this.drawCuttingScene(centerX, centerY, step.target, this.gameState.actionCount);
                break;
            case 'roux':
                this.drawRouxScene(centerX, centerY, this.gameState.actionCount);
                break;
            case 'shape':
                this.drawShapingScene(centerX, centerY, this.gameState.actionCount);
                break;
            case 'pancake':
            case 'cook':
            case 'oven':
                this.drawTimingScene(centerX, centerY);
                break;
        }
    }

    drawEgg(x, y, count) {
        const ctx = this.ctx;
        const cracked = count > 0;

        // 卵
        ctx.fillStyle = '#FFF5E6';
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (cracked) {
            // ひび
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

        // タップを促す
        if (count < 3) {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FF6B6B';
            ctx.fillText('タップ！', x, y + 80);
        }
    }

    drawBowl(x, y, count) {
        const ctx = this.ctx;

        // ボウル
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.ellipse(x, y + 20, 80, 50, 0, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ADD8E6';
        ctx.beginPath();
        ctx.ellipse(x, y - 30, 80, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // 中身（混ぜ具合）
        ctx.fillStyle = count > 30 ? '#FFE135' : '#FFFACD';
        ctx.beginPath();
        ctx.ellipse(x, y - 30, 60, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // 混ぜ棒
        const angle = this.gameState.mixAngle;
        ctx.save();
        ctx.translate(x, y - 30);
        ctx.rotate(angle);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-5, -60, 10, 80);
        ctx.restore();

        // 進捗表示
        ctx.fillStyle = '#333';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`まぜまぜ: ${Math.min(100, Math.floor(count / 0.5))}%`, x, y + 100);
    }

    drawDragItem(x, y, target) {
        const ctx = this.ctx;
        const icons = {
            rice: '🍚',
            batter: '🥛',
            vegetables: '🥬'
        };

        ctx.font = '60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icons[target] || '🍳', x, y);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('↓ したにドラッグ！', x, y + 40);
    }

    drawPan(x, y) {
        const ctx = this.ctx;

        // フライパン
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
    }

    drawToppingScene(x, y, target, count) {
        const ctx = this.ctx;
        const icons = {
            ketchup: '🍅',
            sauce: '🫗',
            topping: '🍓',
            strawberry: '🍓',
            icing: '🎨'
        };

        // お皿と料理
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 50, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentRecipe.icon, x, y + 20);

        // トッピング表示
        for (let i = 0; i < count; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tx = x + Math.cos(angle) * 40;
            const ty = y + Math.sin(angle) * 25 - 20;
            ctx.font = '20px sans-serif';
            ctx.fillText(icons[target], tx, ty);
        }

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`あと ${(this.currentRecipe.steps[this.currentStep].count - count)} かい！`, x, y + 80);
    }

    drawPanScene(x, y, count) {
        const ctx = this.ctx;

        this.drawPan(x, y);

        // 調理中の食材
        const color = count > 2 ? '#FFD700' : '#FFFACD';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 50, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('← → スワイプ！', x, y + 80);
    }

    drawPlateScene(x, y) {
        const ctx = this.ctx;

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.textAlign = 'center';
        ctx.fillText('おさらをタップ！', x, y + 100);
    }

    drawArtCanvas(x, y) {
        const ctx = this.ctx;

        // お皿
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // 料理
        ctx.font = '70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentRecipe.icon, x, y + 10);

        // 描いた線
        if (this.gameState.drawnPoints.length > 1) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(this.gameState.drawnPoints[0].x, this.gameState.drawnPoints[0].y);
            for (const p of this.gameState.drawnPoints) {
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('ゆびでかいてね！', x, y + 100);
    }

    drawIngredient(x, y, target, count) {
        const ctx = this.ctx;
        const icons = {
            flour: '🌾',
            sugar: '🧂',
            milk: '🥛',
            butter: '🧈'
        };

        // ボウル
        this.drawBowl(x, y, 0);

        // 材料
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icons[target] || '📦', x - 80, y - 60);

        for (let i = 0; i < count; i++) {
            ctx.font = '20px sans-serif';
            ctx.fillText(icons[target], x + (i - 1) * 15, y - 35);
        }

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`あと ${this.currentRecipe.steps[this.currentStep].count - count} かい！`, x, y + 90);
    }

    drawCuttingScene(x, y, target, count) {
        const ctx = this.ctx;
        const icons = {
            potato: '🥔',
            carrot: '🥕',
            onion: '🧅',
            meat: '🥩'
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

        // 包丁
        ctx.font = '40px sans-serif';
        ctx.fillText('🔪', x + 70, y - 40);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(`タップしてきろう！`, x, y + 110);
    }

    drawRouxScene(x, y, count) {
        const ctx = this.ctx;

        // 鍋
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.ellipse(x, y + 20, 70, 40, 0, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 70, y - 20, 140, 40);

        // カレー色
        const color = count > 0 ? '#CD853F' : '#DEB887';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y - 20, 60, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // ルー
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🟫', x + 90, y);
    }

    drawShapingScene(x, y, count) {
        const ctx = this.ctx;

        // ボウル
        this.drawBowl(x - 60, y, 50);

        // 成形中
        for (let i = 0; i < count; i++) {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(x + 60 + (i % 3) * 30, y - 30 + Math.floor(i / 3) * 40, 20, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.textAlign = 'center';
        ctx.fillText('タップしてまるめよう！', x, y + 100);
    }

    drawTimingScene(x, y) {
        const ctx = this.ctx;
        const phase = this.gameState.timingPhase;
        const perfectZone = this.gameState.perfectZone;

        // 調理中のアイテム
        this.drawPan(x, y);

        // タイミングメーター
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(x, y - 100, 50, 0, Math.PI * 2);
        ctx.stroke();

        // パーフェクトゾーン（緑）
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(x, y - 100, 50, Math.PI * 0.89, Math.PI * 1.11);
        ctx.stroke();

        // インジケーター
        const angle = (phase / 180) * Math.PI - Math.PI / 2;
        ctx.fillStyle = perfectZone ? '#FFD700' : '#FF6B6B';
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * 50, y - 100 + Math.sin(angle) * 50, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px sans-serif';
        ctx.fillStyle = perfectZone ? '#4CAF50' : '#666';
        ctx.textAlign = 'center';
        ctx.fillText(perfectZone ? 'いまだ！タップ！' : 'みどりでタップ！', x, y + 80);
    }

    // ========== エフェクト ==========
    createEffect(type) {
        const container = document.getElementById('cooking-area');

        if (type === 'tap' || type === 'complete') {
            const effect = document.createElement('div');
            effect.className = 'sparkle';
            effect.textContent = type === 'complete' ? '✨' : '⭐';
            effect.style.left = (this.lastInputPos?.x || 200) + 'px';
            effect.style.top = (this.lastInputPos?.y || 200) + 'px';
            effect.style.fontSize = '30px';
            container.appendChild(effect);
            setTimeout(() => effect.remove(), 600);
        }

        if (type === 'swipe') {
            const effect = document.createElement('div');
            effect.className = 'cut-effect';
            effect.textContent = 'シャキッ！';
            effect.style.left = '50%';
            effect.style.top = '50%';
            container.appendChild(effect);
            setTimeout(() => effect.remove(), 500);
        }

        if (type === 'steam') {
            const effect = document.createElement('div');
            effect.className = 'steam';
            effect.textContent = '💨';
            effect.style.left = (this.lastInputPos?.x || 200) + 'px';
            effect.style.top = (this.lastInputPos?.y || 200) + 'px';
            container.appendChild(effect);
            setTimeout(() => effect.remove(), 2000);
        }

        if (type === 'heart') {
            const effect = document.createElement('div');
            effect.className = 'heart-effect';
            effect.textContent = '💖';
            effect.style.left = (this.lastInputPos?.x || 200) + 'px';
            effect.style.top = (this.lastInputPos?.y || 200) + 'px';
            container.appendChild(effect);
            setTimeout(() => effect.remove(), 1000);
        }

        if (type === 'burst') {
            const effect = document.createElement('div');
            effect.className = 'success-burst';
            effect.style.left = (this.lastInputPos?.x - 50 || 150) + 'px';
            effect.style.top = (this.lastInputPos?.y - 50 || 150) + 'px';
            container.appendChild(effect);
            setTimeout(() => effect.remove(), 500);
        }
    }

    // ========== 完成処理 ==========
    completeCooking() {
        // スコアに基づいて星を計算
        const stars = this.score >= 90 ? 3 : this.score >= 70 ? 2 : 1;

        // 保存
        const prevStars = this.recipeStars[this.currentRecipeId] || 0;
        if (stars > prevStars) {
            this.recipeStars[this.currentRecipeId] = stars;
            localStorage.setItem('wakuwaku_recipe_stars', JSON.stringify(this.recipeStars));
        }

        this.totalStars = Object.values(this.recipeStars).reduce((a, b) => a + b, 0);
        localStorage.setItem('wakuwaku_stars', this.totalStars.toString());

        // 新しいレシピをアンロック
        this.checkUnlocks();

        // 完成画面表示
        this.showCompleteScreen(stars);
    }

    checkUnlocks() {
        const unlockConditions = {
            pancake: 3,
            curry: 6,
            hamburger: 9,
            cake: 12,
            cookie: 15
        };

        Object.entries(unlockConditions).forEach(([recipe, required]) => {
            if (this.totalStars >= required && !this.unlockedRecipes.includes(recipe)) {
                this.unlockedRecipes.push(recipe);
                localStorage.setItem('wakuwaku_unlocked', JSON.stringify(this.unlockedRecipes));
            }
        });
    }

    showCompleteScreen(stars) {
        this.showScreen('complete-screen');

        document.getElementById('dish-display').textContent = this.currentRecipe.icon;

        // メッセージ
        const messages = {
            3: 'かんぺき！すごいシェフだね！👨‍🍳',
            2: 'じょうず！おいしそう！😋',
            1: 'がんばったね！またちょうせんしよう！💪'
        };
        document.getElementById('complete-message').textContent = messages[stars];

        // クッキーくまのリアクション
        const bearReactions = {
            3: 'さいこうにおいしい！✨',
            2: 'おいしいね！😋',
            1: 'もっとれんしゅうしよう！'
        };
        document.getElementById('bear-reaction-text').textContent = bearReactions[stars];

        // 星アニメーション
        const starElements = document.querySelectorAll('#star-rating .star');
        starElements.forEach((star, i) => {
            star.classList.remove('active');
            if (i < stars) {
                setTimeout(() => {
                    star.classList.add('active');
                    this.playSound('star');
                }, (i + 1) * 400);
            }
        });

        // 紙吹雪
        this.createConfetti();

        // サウンド
        setTimeout(() => this.playSound('complete'), 200);

        // 星表示更新
        this.updateStarsDisplay();

        // アルバムに保存
        this.saveToAlbum(stars);
    }

    createConfetti() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';

        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(confetti);
        }
    }

    updateStarsDisplay() {
        const display = document.getElementById('total-stars');
        if (display) {
            display.textContent = this.totalStars;
        }
    }

    // ========== アルバム機能 ==========
    saveToAlbum(stars) {
        const albumItem = {
            id: Date.now(),
            recipeId: this.currentRecipeId,
            recipeName: this.currentRecipe.name,
            icon: this.currentRecipe.icon,
            stars: stars,
            date: new Date().toLocaleDateString('ja-JP'),
            timestamp: Date.now()
        };

        this.albumItems.unshift(albumItem);

        // 最大50件まで保存
        if (this.albumItems.length > 50) {
            this.albumItems = this.albumItems.slice(0, 50);
        }

        localStorage.setItem('wakuwaku_album', JSON.stringify(this.albumItems));
        this.updateAlbumCount();
    }

    updateAlbumCount() {
        const count = document.getElementById('album-count');
        if (count) {
            count.textContent = this.albumItems.length;
        }
    }

    renderAlbum() {
        const grid = document.getElementById('album-grid');
        grid.innerHTML = '';

        if (this.albumItems.length === 0) {
            grid.innerHTML = `
                <div class="album-empty">
                    <div class="album-empty-icon">📸</div>
                    <div class="album-empty-text">アルバムはまだからっぽだよ</div>
                    <div class="album-empty-hint">りょうりをつくってしゃしんをとろう！</div>
                </div>
            `;
            return;
        }

        this.albumItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'album-item';
            card.innerHTML = `
                <div class="album-dish">${item.icon}</div>
                <div class="album-recipe-name">${item.recipeName}</div>
                <div class="album-stars">
                    ${[1, 2, 3].map(i => i <= item.stars ? '⭐' : '☆').join('')}
                </div>
                <div class="album-date">${item.date}</div>
            `;
            grid.appendChild(card);
        });
    }

    // ========== ゲーム制御 ==========
    playAgain() {
        this.playSound('tap');
        this.selectRecipe(this.currentRecipeId);
    }

    confirmExit() {
        if (confirm('りょうりをやめる？')) {
            this.currentRecipe = null;
            this.showScreen('menu-screen');
            this.renderRecipeGrid();
        }
    }

    // ========== タッチフィードバック ==========
    initTouchFeedback() {
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const feedback = document.createElement('div');
            feedback.className = 'touch-feedback';
            feedback.style.left = touch.clientX + 'px';
            feedback.style.top = touch.clientY + 'px';
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 500);
        }, { passive: true });
    }
}

// ゲーム初期化
const game = new WakuwakuKitchen();
