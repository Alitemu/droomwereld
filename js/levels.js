class Level {
    constructor() {
        this.name = '';
        this.width = 800;
        this.height = 600;
        this.timeLimit = 60;
        this.timeRemaining = 60;
        this.startTime = 0;
        this.completed = false;
    }

    init(width, height) {
        this.width = width;
        this.height = height;
        this.startTime = Date.now();
        this.timeRemaining = this.timeLimit;
    }

    update(gameState) {
        this.timeRemaining = this.timeLimit - Math.floor((Date.now() - this.startTime) / 1000);
        if (this.timeRemaining <= 0) {
            return 'lose';
        }
        return null;
    }

    draw(ctx) {
        // Draw time
        ctx.fillStyle = '#00ffff';
        ctx.font = '20px Arial';
        ctx.fillText(`Tijd: ${this.timeRemaining}s`, this.width - 200, 40);
    }
}

// LEVEL 1: MEMORY
class Level1Memory extends Level {
    constructor() {
        super();
        this.name = 'Memory';
        this.timeLimit = 120;
        this.cards = [];
        this.cardSize = 70;
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.robot = new RobotMemory(400, 100);
        this.robotScore = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.cards = this.createCards();
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.robot.memory = [];
        this.robotScore = 0;
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createCards() {
        const values = ['🌙', '⭐', '☁️', '💫', '🌟', '✨', '🌙', '⭐', '☁️', '💫', '🌟', '✨'];
        const cards = values.map((val, idx) => ({
            value: val,
            revealed: false,
            matched: false,
            x: 100 + (idx % 6) * 100,
            y: 200 + Math.floor(idx / 6) * 100
        }));
        return cards.sort(() => Math.random() - 0.5);
    }

    handleClick(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if (x > card.x && x < card.x + this.cardSize &&
                y > card.y && y < card.y + this.cardSize &&
                !card.matched && !card.revealed) {
                this.selectedCards.push(i);
                if (this.selectedCards.length === 2) {
                    this.checkMatch();
                }
            }
        }
    }

    checkMatch() {
        const [idx1, idx2] = this.selectedCards;
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        card1.revealed = true;
        card2.revealed = true;

        setTimeout(() => {
            if (card1.value === card2.value) {
                card1.matched = true;
                card2.matched = true;
                this.matchedPairs++;
                this.robot.rememberCard(idx1, card1.value);
                this.robot.rememberCard(idx2, card1.value);
            } else {
                card1.revealed = false;
                card2.revealed = false;
                this.robotTurn();
            }
            this.selectedCards = [];
        }, 500);
    }

    robotTurn() {
        const availableCards = this.cards
            .map((c, i) => c.matched ? -1 : i)
            .filter(i => i !== -1);

        setTimeout(() => {
            const move = this.robot.getNextMove(availableCards);
            if (move) {
                this.cards[move.first].revealed = true;
                this.cards[move.second].revealed = true;

                setTimeout(() => {
                    if (this.cards[move.first].value === this.cards[move.second].value) {
                        this.cards[move.first].matched = true;
                        this.cards[move.second].matched = true;
                        this.robotScore++;
                    } else {
                        this.cards[move.first].revealed = false;
                        this.cards[move.second].revealed = false;
                    }
                }, 500);
            }
        }, 1000);
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.matchedPairs >= 6) {
            return 'win';
        }
        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw cards
        for (const card of this.cards) {
            ctx.fillStyle = card.matched ? '#00ff00' : '#0099ff';
            ctx.fillRect(card.x, card.y, this.cardSize, this.cardSize);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(card.x, card.y, this.cardSize, this.cardSize);

            if (card.revealed || card.matched) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.value, card.x + this.cardSize / 2, card.y + this.cardSize / 2);
            }
        }

        // Score display
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Jouw pairs: ${this.matchedPairs}`, 50, 100);
        ctx.fillText(`Robot pairs: ${this.robotScore}`, 50, 130);
    }
}

// LEVEL 2: TAG
class Level2Tag extends Level {
    constructor() {
        super();
        this.name = 'Tikkertjes';
        this.timeLimit = 60;
        this.playerX = 400;
        this.playerY = 400;
        this.playerSize = 30;
        this.playerSpeed = 5;
        this.robot = new RobotTag(100, 100);
        this.points = 0;
        this.keysPressed = {};
    }

    init(width, height) {
        super.init(width, height);
        this.playerX = 400;
        this.playerY = 400;
        this.points = 0;
        this.robot.x = 100;
        this.robot.y = 100;

        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Player movement
        if (this.keysPressed['arrowup'] || this.keysPressed['w']) {
            this.playerY = Math.max(60, this.playerY - this.playerSpeed);
        }
        if (this.keysPressed['arrowdown'] || this.keysPressed['s']) {
            this.playerY = Math.min(this.height - this.playerSize, this.playerY + this.playerSpeed);
        }
        if (this.keysPressed['arrowleft'] || this.keysPressed['a']) {
            this.playerX = Math.max(0, this.playerX - this.playerSpeed);
        }
        if (this.keysPressed['arrowright'] || this.keysPressed['d']) {
            this.playerX = Math.min(this.width - this.playerSize, this.playerX + this.playerSpeed);
        }

        // Robot AI
        this.robot.update(this.playerX, this.playerY, this.width, this.height);
        this.robot.increaseDifficulty();

        // Collision detection
        if (this.isColliding(this.playerX, this.playerY, this.playerSize, this.robot.x, this.robot.y, this.robot.width)) {
            return 'lose';
        }

        this.points += 1;
        return null;
    }

    isColliding(x1, y1, size1, x2, y2, size2) {
        return x1 < x2 + size2 && x1 + size1 > x2 && y1 < y2 + size2 && y1 + size1 > y2;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw player (blue circle)
        ctx.fillStyle = '#0099ff';
        ctx.beginPath();
        ctx.arc(this.playerX + this.playerSize / 2, this.playerY + this.playerSize / 2, this.playerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw robot
        this.robot.draw(ctx);

        // Draw points
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Punten: ${this.points}`, 50, 100);
    }
}

// LEVEL 3: HIDE AND SEEK
class Level3HideAndSeek extends Level {
    constructor() {
        super();
        this.name = 'Verstoppertje';
        this.timeLimit = 90;
        this.playerX = 700;
        this.playerY = 300;
        this.playerSize = 25;
        this.hidingSpots = [];
        this.isHiding = false;
        this.robot = new RobotTag(50, 300);
        this.robotFound = false;
    }

    init(width, height) {
        super.init(width, height);
        this.playerX = 700;
        this.playerY = 300;
        this.isHiding = false;
        this.robotFound = false;
        this.robot.x = 50;
        this.robot.y = 300;
        this.hidingSpots = [
            { x: 100, y: 100, w: 120, h: 150, name: 'Boom' },
            { x: 500, y: 100, w: 100, h: 150, name: 'Huis' },
            { x: 300, y: 400, w: 150, h: 100, name: 'Struik' }
        ];

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        for (const spot of this.hidingSpots) {
            if (this.playerX > spot.x && this.playerX < spot.x + spot.w &&
                this.playerY > spot.y && this.playerY < spot.y + spot.h) {
                if (e.key === ' ') {
                    this.isHiding = true;
                }
            }
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.isHiding) {
            // Safe - add time bonus
            return null;
        }

        // Robot searches and moves
        this.robot.update(this.playerX, this.playerY, this.width, this.height);
        this.robot.speed += 0.01; // Gets faster over time

        // Check if robot found player
        if (this.isColliding(this.playerX, this.playerY, this.playerSize, this.robot.x, this.robot.y, this.robot.width)) {
            return 'lose';
        }

        // Win if time runs out and hidden
        if (this.timeRemaining <= 0) {
            return 'win';
        }

        return null;
    }

    isColliding(x1, y1, size1, x2, y2, size2) {
        return x1 < x2 + size2 && x1 + size1 > x2 && y1 < y2 + size2 && y1 + size1 > y2;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw hiding spots
        for (const spot of this.hidingSpots) {
            ctx.fillStyle = this.isHiding && this.playerX > spot.x && this.playerX < spot.x + spot.w ? '#00ff00' : '#444';
            ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);

            ctx.fillStyle = '#00ffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(spot.name, spot.x + spot.w / 2, spot.y + spot.h / 2);
        }

        // Draw player
        ctx.fillStyle = this.isHiding ? '#00ff00' : '#0099ff';
        ctx.beginPath();
        ctx.arc(this.playerX, this.playerY, this.playerSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw robot
        this.robot.draw(ctx);

        // Status
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.isHiding ? 'JE BENT VERBORGEN (Veilig!)' : 'Robot zoekt...', 50, 100);
        ctx.fillText('Druk SPATIE om te verstoppen', 50, 130);
    }
}

// LEVEL 4: FOOTBALL
class Level4Football extends Level {
    constructor() {
        super();
        this.name = 'Voetbal';
        this.timeLimit = 120;
        this.playerX = 150;
        this.playerY = 300;
        this.playerSize = 30;
        this.playerScore = 0;
        this.ballX = 400;
        this.ballY = 300;
        this.ballVX = 0;
        this.ballVY = 0;
        this.ballSize = 12;
        this.robot = new RobotFootball(600, 300);
        this.robotScore = 0;
        this.keysPressed = {};
    }

    init(width, height) {
        super.init(width, height);
        this.playerX = 150;
        this.playerY = 300;
        this.playerScore = 0;
        this.robotScore = 0;
        this.ballX = 400;
        this.ballY = 300;
        this.ballVX = 0;
        this.ballVY = 0;
        this.robot.x = 600;
        this.robot.y = 300;

        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key.toLowerCase()] = true;
            if (e.key === ' ') this.shoot();
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    shoot() {
        const dx = this.ballX - this.playerX;
        const dy = this.ballY - this.playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
            this.ballVX = Math.cos(Math.atan2(dy, dx)) * 8;
            this.ballVY = Math.sin(Math.atan2(dy, dx)) * 8;
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Player movement
        if (this.keysPressed['arrowup'] || this.keysPressed['w']) {
            this.playerY = Math.max(60, this.playerY - 5);
        }
        if (this.keysPressed['arrowdown'] || this.keysPressed['s']) {
            this.playerY = Math.min(this.height - this.playerSize, this.playerY + 5);
        }
        if (this.keysPressed['arrowleft'] || this.keysPressed['a']) {
            this.playerX = Math.max(0, this.playerX - 5);
        }
        if (this.keysPressed['arrowright'] || this.keysPressed['d']) {
            this.playerX = Math.min(400, this.playerX + 5);
        }

        // Ball physics
        this.ballX += this.ballVX;
        this.ballY += this.ballVY;
        this.ballVX *= 0.98; // Friction
        this.ballVY *= 0.98;

        if (this.ballY < 60 || this.ballY > this.height) {
            this.ballVY = -this.ballVY * 0.8;
        }

        // Check goals
        if (this.ballX < 0 && this.ballY > 200 && this.ballY < 400) {
            this.robotScore++;
            this.resetBall();
        }
        if (this.ballX > this.width && this.ballY > 200 && this.ballY < 400) {
            this.playerScore++;
            this.resetBall();
        }

        // Robot AI
        this.robot.update(this.ballX, this.ballY, this.width, this.height);

        // Robot shooting
        if (Math.random() < 0.01) {
            const shot = this.robot.shoot(this.playerX, this.playerY);
            if (Math.abs(this.robot.x - this.ballX) < 60) {
                this.ballVX = shot.vx;
                this.ballVY = shot.vy;
            }
        }

        if (this.playerScore >= 3) return 'win';
        if (this.robotScore >= 3) return 'lose';

        return null;
    }

    resetBall() {
        this.ballX = 400;
        this.ballY = 300;
        this.ballVX = 0;
        this.ballVY = 0;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw goal lines
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 200, 20, 200);
        ctx.strokeRect(this.width - 20, 200, 20, 200);

        // Draw player
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(this.playerX - 15, this.playerY - 15, 30, 30);

        // Draw robot
        this.robot.draw(ctx);

        // Draw ball
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw score
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.playerScore}  -  ${this.robotScore}`, 350, 100);
        ctx.font = '14px Arial';
        ctx.fillText('Pijlen om te bewegen, SPATIE om te schieten', 50, 130);
    }
}

// LEVEL 5: PUZZLE
class Level5Puzzle extends Level {
    constructor() {
        super();
        this.name = 'Schuifpuzzel';
        this.timeLimit = 90;
        this.playerProgress = 0;
        this.robotProgress = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.playerProgress = 0;
        this.robotProgress = 0;
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Simulate puzzle solving
        this.playerProgress += Math.random() * 2;
        this.robotProgress += Math.random() * 1.5 * this.gameState?.difficulty || 1;

        if (this.playerProgress >= 100) return 'win';
        if (this.robotProgress >= 100) return 'lose';

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCHUIFPUZZEL LEVEL (in aanbouw)', this.width / 2, 100);

        // Progress bars
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(100, 300, this.playerProgress * 2, 40);
        ctx.strokeStyle = '#00ffff';
        ctx.strokeRect(100, 300, 200, 40);
        ctx.fillText('Jij', 50, 330);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(100, 400, this.robotProgress * 2, 40);
        ctx.strokeRect(100, 400, 200, 40);
        ctx.fillText('Robot', 50, 430);
    }
}

// LEVEL 6: DANCE
class Level6Dance extends Level {
    constructor() {
        super();
        this.name = 'Dans';
        this.timeLimit = 60;
        this.sequence = [];
        this.playerSequence = [];
        this.robot = new RobotDance(400, 300);
    }

    init(width, height) {
        super.init(width, height);
        this.sequence = ['up', 'right', 'down', 'left'];
        this.playerSequence = [];
        this.robot.generateSequence(4);

        window.addEventListener('keydown', (e) => this.handleDanceInput(e));
    }

    handleDanceInput(e) {
        const keyMap = { 'arrowup': 'up', 'arrowright': 'right', 'arrowdown': 'down', 'arrowleft': 'left' };
        const move = keyMap[e.key.toLowerCase()];
        if (move) {
            this.playerSequence.push(move);
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.playerSequence.length >= this.sequence.length) {
            if (this.playerSequence.join('') === this.sequence.join('')) {
                return 'win';
            } else {
                this.playerSequence = [];
            }
        }

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Volg de dans moves!', this.width / 2, 100);

        // Display the sequence to follow
        ctx.font = '16px Arial';
        ctx.fillText('Sequence: ' + this.sequence.join(' → '), this.width / 2, 150);
        ctx.fillText('Jouw invoer: ' + this.playerSequence.join(' → '), this.width / 2, 200);
    }
}

// LEVEL 7: COOKING
class Level7Cooking extends Level {
    constructor() {
        super();
        this.name = 'Koken';
        this.timeLimit = 120;
        this.ingredients = [];
        this.playerRecipe = [];
    }

    init(width, height) {
        super.init(width, height);
        this.ingredients = ['🍅', '🧂', '🧈', '🍗', '🌶️', '🧄'];
        this.playerRecipe = [];
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.playerRecipe.length >= 3) {
            return 'win';
        }

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Kook het gerecht (in aanbouw)', this.width / 2, 100);

        // Display ingredients
        for (let i = 0; i < this.ingredients.length; i++) {
            ctx.font = '30px Arial';
            ctx.fillText(this.ingredients[i], 150 + (i % 3) * 150, 250 + Math.floor(i / 3) * 100);
        }
    }
}

// LEVEL 8: RACING
class Level8Racing extends Level {
    constructor() {
        super();
        this.name = 'Racen';
        this.timeLimit = 60;
        this.playerPosition = 0;
        this.robotPosition = 0;
        this.trackLength = 1000;
    }

    init(width, height) {
        super.init(width, height);
        this.playerPosition = 0;
        this.robotPosition = 0;

        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') this.playerPosition += 50;
        });
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Robot accelerates
        this.robotPosition += 30 + Math.random() * 20;

        if (this.playerPosition >= this.trackLength) return 'win';
        if (this.robotPosition >= this.trackLength) return 'lose';

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Race tegen de robot! (Druk SPATIE)', this.width / 2, 100);

        // Draw race track
        ctx.fillStyle = '#333';
        ctx.fillRect(50, 200, 700, 50);
        ctx.fillStyle = '#444';
        ctx.fillRect(50, 280, 700, 50);

        // Draw progress bars
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(50, 200, (this.playerPosition / this.trackLength) * 700, 50);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(50, 280, (this.robotPosition / this.trackLength) * 700, 50);
    }
}

// FINAL BOSS: DROOMKONING
class FinalBossDroomkoning extends Level {
    constructor() {
        super();
        this.name = 'Eindbaas - Droomkoning';
        this.timeLimit = 180;
        this.phase = 1;
        this.bossHealth = 100;
        this.playerHealth = 100;
    }

    init(width, height) {
        super.init(width, height);
        this.bossHealth = 100;
        this.playerHealth = 100;
        this.phase = 1;
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Simulate boss fight
        this.bossHealth -= Math.random() * 0.5;
        this.playerHealth -= Math.random() * 0.2;

        if (this.bossHealth <= 0) return 'win';
        if (this.playerHealth <= 0) return 'lose';

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚔️  DROOMKONING  ⚔️', this.width / 2, 80);
        ctx.font = '20px Arial';
        ctx.fillText(`Fase ${this.phase}/4`, this.width / 2, 120);

        // Boss health
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(100, 180, this.bossHealth * 2, 30);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 180, 200, 30);
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Arial';
        ctx.fillText('Boss Health', 50, 205);

        // Player health
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(100, 250, this.playerHealth * 2, 30);
        ctx.strokeStyle = '#00ffff';
        ctx.strokeRect(100, 250, 200, 30);
        ctx.fillText('Jouw Health', 50, 275);

        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fase beschrijving verschijnt hier...', 100, 400);
    }
}
