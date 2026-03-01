class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.currentLevel = 0;
        this.levels = [];
        this.isGameRunning = false;
        this.gameState = {
            health: 3,
            score: 0
        };

        this.initializeLevels();
    }

    initializeLevels() {
        this.levels = [
            new Level1Memory(),
            new Level2Tag(),
            new Level3HideAndSeek(),
            new Level4Football(),
            new Level5Puzzle(),
            new Level6Dance(),
            new Level7Cooking(),
            new Level8Racing(),
            new FinalBossDroomkoning()
        ];
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('ui').style.display = 'flex';
        this.isGameRunning = true;
        this.currentLevel = 0;
        this.gameState.health = 3;
        this.gameState.score = 0;
        this.loadLevel(0);
    }

    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.gameWon();
            return;
        }

        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        level.init(this.canvas.width, this.canvas.height);
        this.updateUI();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        this.ctx.fillStyle = '#0a0015';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const level = this.levels[this.currentLevel];
        const result = level.update(this.gameState);

        level.draw(this.ctx);

        if (result === 'win') {
            this.nextLevel();
            return;
        } else if (result === 'lose') {
            this.loseHealth();
            return;
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= this.levels.length) {
            this.gameWon();
        } else {
            this.gameState.score += 100;
            this.loadLevel(this.currentLevel);
        }
    }

    loseHealth() {
        this.gameState.health--;
        if (this.gameState.health <= 0) {
            this.gameLost();
        } else {
            this.loadLevel(this.currentLevel);
        }
    }

    retryLevel() {
        document.getElementById('gameOver').style.display = 'none';
        this.isGameRunning = true;
        this.gameState.health = 3;
        this.loadLevel(this.currentLevel);
    }

    gameWon() {
        this.isGameRunning = false;
        document.getElementById('gameOverTitle').textContent = '✨ JE HEBT GEWONNEN! ✨';
        document.getElementById('gameOverMessage').textContent = `Je hebt de Droomkoning verslagen!\nScore: ${this.gameState.score}`;
        document.getElementById('retryBtn').style.display = 'none';
        document.getElementById('gameOver').style.display = 'block';
    }

    gameLost() {
        this.isGameRunning = false;
        const levelNum = this.currentLevel + 1;
        const levelName = this.currentLevel === this.levels.length - 1 ? 'de Eindbaas' : `Level ${levelNum}`;
        document.getElementById('gameOverTitle').textContent = 'GAME OVER';
        document.getElementById('gameOverMessage').textContent = `Je levens zijn op bij ${levelName}.\nScore: ${this.gameState.score}`;
        document.getElementById('retryBtn').style.display = 'inline-block';
        document.getElementById('gameOver').style.display = 'block';
    }

    goToPreviousLevel() {
        if (this.currentLevel <= 0) return;
        this.isGameRunning = false;
        this.gameState.health = 3;
        this.loadLevel(this.currentLevel - 1);
    }

    goToNextLevel() {
        if (this.currentLevel >= this.levels.length - 1) return;
        this.isGameRunning = false;
        this.gameState.health = 3;
        this.loadLevel(this.currentLevel + 1);
    }

    updateUI() {
        const isFirst = this.currentLevel === 0;
        const isLast  = this.currentLevel === this.levels.length - 1;
        const levelName = isLast ? 'Eindbaas - Droomkoning' : `Level ${this.currentLevel + 1}`;

        document.getElementById('levelInfo').textContent = levelName;
        document.getElementById('score').textContent = `❤️ ${this.gameState.health} | Score: ${this.gameState.score}`;

        document.getElementById('prevLevelBtn').style.display = isFirst ? 'none' : 'inline-block';
        document.getElementById('nextLevelBtn').style.display = isLast  ? 'none' : 'inline-block';
    }
}

const game = new Game();
