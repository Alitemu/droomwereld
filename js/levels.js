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
        this.clickHandler = null;
        this.turnCount = 0;
        this.cardFlipAnimation = {};
        this.isProcessing = false;
        this.difficulty = 1;
        this.canvas = null;
        this.lastFlippedCards = { cardIndex: -1, cardValue: null, timestamp: 0 };
    }

    init(width, height) {
        super.init(width, height);
        this.cards = this.createCards();
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.robot.memory = [];
        this.robotScore = 0;
        this.turnCount = 0;
        this.isProcessing = false;
        this.cardFlipAnimation = {};
        this.difficulty = 1;
        this.lastFlippedCards = { cardIndex: -1, cardValue: null, timestamp: 0 };

        // Get canvas reference
        this.canvas = document.getElementById('gameCanvas');

        // Remove previous handler if it exists to prevent memory leaks
        if (this.clickHandler) {
            this.canvas.removeEventListener('click', this.clickHandler);
        }

        // Create and bind handler specifically to canvas (not document) for this level
        this.clickHandler = (e) => this.handleClick(e);
        this.canvas.addEventListener('click', this.clickHandler);
    }

    createCards() {
        const values = ['🌙', '⭐', '☁️', '💫', '🌟', '✨', '🌙', '⭐', '☁️', '💫', '🌟', '✨'];
        // Shuffle first, then assign positions so pairs are never in the same spot
        const shuffled = values.map(val => ({
            value: val,
            revealed: false,
            matched: false,
            x: 0,
            y: 0,
            flipProgress: 0,
            flipDirection: 1
        })).sort(() => Math.random() - 0.5);

        shuffled.forEach((card, idx) => {
            card.x = 100 + (idx % 6) * 100;
            card.y = 200 + Math.floor(idx / 6) * 100;
        });

        return shuffled;
    }

    handleClick(e) {
        if (this.isProcessing || this.selectedCards.length >= 2) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if (x > card.x && x < card.x + this.cardSize &&
                y > card.y && y < card.y + this.cardSize &&
                !card.matched && !card.revealed) {

                // Start flip animation
                this.cardFlipAnimation[i] = { progress: 0, duration: 300 };
                this.selectedCards.push(i);
                card.revealed = true;

                // Add visual feedback on flip
                card.flipDirection = 1;

                if (this.selectedCards.length === 2) {
                    this.isProcessing = true;
                    this.checkMatch();
                }
                break;
            }
        }
    }

    checkMatch() {
        const [idx1, idx2] = this.selectedCards;
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        setTimeout(() => {
            if (card1.value === card2.value) {
                card1.matched = true;
                card2.matched = true;
                this.matchedPairs++;

                // Robot learns the matched pair with higher confidence
                this.robot.rememberCard(idx1, card1.value);
                this.robot.rememberCard(idx2, card1.value);

                this.isProcessing = false;
                this.selectedCards = [];
            } else {
                // Cards don't match - flip them back
                card1.revealed = false;
                card2.revealed = false;
                card1.flipDirection = -1;
                card2.flipDirection = -1;

                // Reset flip animation progress for backward flip
                this.cardFlipAnimation[idx1] = { progress: 0.5, duration: 300 };
                this.cardFlipAnimation[idx2] = { progress: 0.5, duration: 300 };

                this.selectedCards = [];
                this.turnCount++;

                // Increase difficulty: robot gets smarter after mismatches
                this.updateDifficulty();

                // Robot takes turn with improved memory system
                this.robotTurn();
            }
        }, 600);
    }

    updateDifficulty() {
        // Difficulty scales from 1.0 to 3.0 based on turn count and robot accuracy
        const baseDifficulty = 1 + (this.turnCount * 0.15);
        const accuracyBonus = (this.robotScore / Math.max(this.matchedPairs + this.robotScore, 1)) * 0.5;
        this.difficulty = Math.min(baseDifficulty + accuracyBonus, 3);
    }

    robotTurn() {
        const availableCards = this.cards
            .map((c, i) => c.matched ? -1 : i)
            .filter(i => i !== -1);

        setTimeout(() => {
            if (availableCards.length === 0) {
                this.isProcessing = false;
                return;
            }

            // Robot AI: try memory-based move with difficulty scaling
            const move = this.robot.getNextMove(availableCards, this.difficulty);

            if (move && this.shouldUseMemory()) {
                this.performRobotMove(move);
            } else {
                // Robot makes calculated or random move
                const randomIndices = availableCards.sort(() => 0.5 - Math.random()).slice(0, 2);
                if (randomIndices.length === 2) {
                    this.performRobotMove({ first: randomIndices[0], second: randomIndices[1] });
                }
            }
        }, 800);
    }

    shouldUseMemory() {
        // Higher difficulty = higher chance of using memory
        const memoryChance = Math.min(this.difficulty / 3, 1.0);
        return Math.random() < memoryChance;
    }

    performRobotMove(move) {
        this.cards[move.first].revealed = true;
        this.cards[move.second].revealed = true;

        // Start flip animations for robot's moves
        this.cardFlipAnimation[move.first] = { progress: 0, duration: 300 };
        this.cardFlipAnimation[move.second] = { progress: 0, duration: 300 };

        setTimeout(() => {
            if (this.cards[move.first].value === this.cards[move.second].value) {
                // Match found!
                this.cards[move.first].matched = true;
                this.cards[move.second].matched = true;
                this.robotScore++;

                // Robot learns the matched pair
                this.robot.rememberCard(move.first, this.cards[move.first].value);
                this.robot.rememberCard(move.second, this.cards[move.first].value);
            } else {
                // No match - flip back
                this.cards[move.first].revealed = false;
                this.cards[move.second].revealed = false;
                this.cards[move.first].flipDirection = -1;
                this.cards[move.second].flipDirection = -1;

                // Reset flip animations for backward flip
                this.cardFlipAnimation[move.first] = { progress: 0.5, duration: 300 };
                this.cardFlipAnimation[move.second] = { progress: 0.5, duration: 300 };
            }

            this.isProcessing = false;
        }, 600);
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Update flip animations with smooth easing
        for (const [cardIdx, anim] of Object.entries(this.cardFlipAnimation)) {
            const card = this.cards[cardIdx];
            if (card.flipDirection === 1) {
                // Flipping forward (card opening)
                anim.progress = Math.min(anim.progress + (1 / 16) * (1000 / anim.duration), 1);
            } else {
                // Flipping backward (card closing)
                anim.progress = Math.max(anim.progress - (1 / 16) * (1000 / anim.duration), 0);
            }

            // Remove animation when complete
            if (anim.progress >= 1 || anim.progress <= 0) {
                delete this.cardFlipAnimation[cardIdx];
            }
        }

        // Update difficulty scaling
        this.updateDifficulty();

        if (this.matchedPairs >= 6) {
            // Clean up event listener before level ends
            if (this.clickHandler && this.canvas) {
                this.canvas.removeEventListener('click', this.clickHandler);
            }
            return 'win';
        }
        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw cards with improved flip animation
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const anim = this.cardFlipAnimation[i];
            const flipProgress = anim ? anim.progress : (card.revealed ? 1 : 0);

            // Calculate 3D flip effect with sine curve
            const flipScale = Math.sin(flipProgress * Math.PI);
            const cardWidth = this.cardSize * flipScale;
            const xOffset = (this.cardSize - cardWidth) / 2;

            ctx.save();

            // Determine card color based on state
            let cardColor = '#0099ff';
            if (card.matched) {
                cardColor = '#00ff00'; // Green for matched
            } else if (card.revealed && flipProgress > 0.5) {
                cardColor = '#ff9900'; // Orange hint when revealing
            }

            // Draw card with flip effect
            if (cardWidth > 0.5) {
                ctx.fillStyle = cardColor;
                ctx.fillRect(card.x + xOffset, card.y, cardWidth, this.cardSize);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(card.x + xOffset, card.y, cardWidth, this.cardSize);
            }

            // Draw card content only when fully revealed (progress > 0.5)
            if ((card.revealed || card.matched) && flipProgress > 0.5) {
                ctx.globalAlpha = Math.min(flipProgress * 2, 1);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(card.value, card.x + this.cardSize / 2, card.y + this.cardSize / 2);
            } else if (!anim && !card.revealed && !card.matched) {
                // Show card back pattern when not flipping
                ctx.fillStyle = '#004d7f';
                ctx.fillRect(card.x + 8, card.y + 8, this.cardSize - 16, this.cardSize - 16);
                ctx.strokeStyle = '#0066cc';
                ctx.lineWidth = 1;
                ctx.strokeRect(card.x + 8, card.y + 8, this.cardSize - 16, this.cardSize - 16);
            }

            ctx.restore();
        }

        // Score display with enhanced formatting
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Jouw pairs: ${this.matchedPairs}/6`, 50, 100);
        ctx.fillText(`Robot pairs: ${this.robotScore}`, 50, 130);
        ctx.fillText(`Moeilijkheid: ${this.difficulty.toFixed(2)}x`, 50, 160);
        ctx.font = '12px Arial';
        ctx.fillText(`Beurten: ${this.turnCount}`, 50, 180);
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
        this.distance = 0;
        this.distanceBonus = 0;
        this.lastX = 400;
        this.lastY = 400;
        this.keysPressed = {};
        this.walls = [];
        this.boundaryWalls = [];
    }

    init(width, height) {
        super.init(width, height);
        this.playerX = 400;
        this.playerY = 400;
        this.lastX = 400;
        this.lastY = 400;
        this.points = 0;
        this.distance = 0;
        this.distanceBonus = 0;
        this.robot.x = 100;
        this.robot.y = 100;
        this.createWalls();
        this.createBoundaryWalls();

        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    createWalls() {
        // Create walls to divide the play area and add obstacles
        this.walls = [
            { x: 200, y: 0, w: 20, h: 250 },      // Left vertical wall (top)
            { x: 200, y: 350, w: 20, h: 250 },    // Left vertical wall (bottom)
            { x: 600, y: 100, w: 20, h: 250 },    // Right vertical wall (top)
            { x: 600, y: 400, w: 20, h: 200 },    // Right vertical wall (bottom)
            { x: 300, y: 150, w: 300, h: 20 },    // Horizontal wall (middle)
        ];
    }

    createBoundaryWalls() {
        // Create outer boundary walls to keep game within bounds
        this.boundaryWalls = [
            { x: 0, y: 0, w: this.width, h: 60 },           // Top wall
            { x: 0, y: this.height - 60, w: this.width, h: 60 }, // Bottom wall
            { x: 0, y: 0, w: 50, h: this.height },          // Left wall
            { x: this.width - 50, y: 0, w: 50, h: this.height } // Right wall
        ];
    }

    checkWallCollision(x, y, size) {
        // Check internal walls
        for (const wall of this.walls) {
            if (x < wall.x + wall.w && x + size > wall.x &&
                y < wall.y + wall.h && y + size > wall.y) {
                return true;
            }
        }
        // Check boundary walls
        for (const wall of this.boundaryWalls) {
            if (x < wall.x + wall.w && x + size > wall.x &&
                y < wall.y + wall.h && y + size > wall.y) {
                return true;
            }
        }
        return false;
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Player movement with wall collision
        let newX = this.playerX;
        let newY = this.playerY;

        if (this.keysPressed['arrowup'] || this.keysPressed['w']) {
            newY = this.playerY - this.playerSpeed;
        }
        if (this.keysPressed['arrowdown'] || this.keysPressed['s']) {
            newY = this.playerY + this.playerSpeed;
        }
        if (this.keysPressed['arrowleft'] || this.keysPressed['a']) {
            newX = this.playerX - this.playerSpeed;
        }
        if (this.keysPressed['arrowright'] || this.keysPressed['d']) {
            newX = this.playerX + this.playerSpeed;
        }

        // Check wall collisions before updating position
        if (!this.checkWallCollision(newX, this.playerY, this.playerSize)) {
            this.playerX = newX;
        }
        if (!this.checkWallCollision(this.playerX, newY, this.playerSize)) {
            this.playerY = newY;
        }

        // Calculate distance traveled for bonus points
        const dx = this.playerX - this.lastX;
        const dy = this.playerY - this.lastY;
        const movementDist = Math.sqrt(dx * dx + dy * dy);
        this.distance += movementDist;
        this.distanceBonus = Math.floor(this.distance / 100);
        this.lastX = this.playerX;
        this.lastY = this.playerY;

        // Robot AI with smarter dodging
        this.robot.update(this.playerX, this.playerY, this.width, this.height);

        // Smart dodging behavior - robot avoids walls intelligently
        const dodgeDistance = 30;
        if (this.checkWallCollision(this.robot.x, this.robot.y, this.robot.width)) {
            // Evaluate all 4 directions and pick the best one
            const directions = [
                { dx: dodgeDistance, dy: 0 },
                { dx: -dodgeDistance, dy: 0 },
                { dx: 0, dy: dodgeDistance },
                { dx: 0, dy: -dodgeDistance }
            ];

            // Calculate distance to player for each direction
            let bestDirection = null;
            let bestDistance = 0;

            for (const dir of directions) {
                if (!this.checkWallCollision(this.robot.x + dir.dx, this.robot.y + dir.dy, this.robot.width)) {
                    const distToPlayer = Math.sqrt(
                        Math.pow(this.playerX - (this.robot.x + dir.dx), 2) +
                        Math.pow(this.playerY - (this.robot.y + dir.dy), 2)
                    );
                    if (distToPlayer > bestDistance) {
                        bestDistance = distToPlayer;
                        bestDirection = dir;
                    }
                }
            }

            if (bestDirection) {
                this.robot.x += bestDirection.dx;
                this.robot.y += bestDirection.dy;
            }
        }

        this.robot.increaseDifficulty();

        // Improved circular collision detection with better accuracy
        if (this.isColliding(this.playerX, this.playerY, this.playerSize, this.robot.x, this.robot.y, this.robot.width)) {
            return 'lose';
        }

        // Points calculation: base on time, distance bonus, and survival
        const timePoints = this.timeRemaining * 10;
        const bonusPoints = this.distanceBonus * 5;
        this.points = Math.floor(timePoints + bonusPoints);

        return null;
    }

    isColliding(x1, y1, size1, x2, y2, size2) {
        // Improved circular collision detection with margin for safety
        const center1X = x1 + size1 / 2;
        const center1Y = y1 + size1 / 2;
        const center2X = x2 + size2 / 2;
        const center2Y = y2 + size2 / 2;
        const distance = Math.sqrt(Math.pow(center2X - center1X, 2) + Math.pow(center2Y - center1Y, 2));
        const minDistance = (size1 / 2 + size2 / 2) * 0.9; // 90% of theoretical distance
        return distance < minDistance;
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw boundary walls
        ctx.fillStyle = '#444444';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff0000';
        for (const wall of this.boundaryWalls) {
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        }

        // Draw internal obstacles/walls
        ctx.fillStyle = '#555555';
        ctx.strokeStyle = '#ffaa00';
        for (const wall of this.walls) {
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
        }

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

        // Draw points and distance bonus
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Punten: ${this.points}`, 50, 100);
        ctx.fillText(`Afstand: ${Math.floor(this.distance)}px (Bonus: +${this.distanceBonus * 5})`, 50, 130);
        ctx.fillText(`Moeilijkheid: ${this.robot.difficulty.toFixed(1)}x`, 50, 160);
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
        this.hidingSpotIndex = -1;
        this.robot = new RobotTag(50, 300);
        this.robotFound = false;
        this.hidingBlinkCounter = 0;
        this.robotSearchPattern = 'circular';
        this.robotSearchPhase = 0;
        this.hiddenMovementX = 0;
        this.hiddenMovementY = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.playerX = 700;
        this.playerY = 300;
        this.isHiding = false;
        this.hidingSpotIndex = -1;
        this.robotFound = false;
        this.hidingBlinkCounter = 0;
        this.robot.x = 50;
        this.robot.y = 300;
        this.robotSearchPattern = 'circular';
        this.robotSearchPhase = 0;
        this.hiddenMovementX = 0;
        this.hiddenMovementY = 0;
        this.hidingSpots = [
            { x: 100, y: 100, w: 120, h: 150, name: 'Boom', discovered: false },
            { x: 500, y: 100, w: 100, h: 150, name: 'Huis', discovered: false },
            { x: 300, y: 400, w: 150, h: 100, name: 'Struik', discovered: false }
        ];

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (this.isHiding) return;

        for (let i = 0; i < this.hidingSpots.length; i++) {
            const spot = this.hidingSpots[i];
            if (this.playerX > spot.x && this.playerX < spot.x + spot.w &&
                this.playerY > spot.y && this.playerY < spot.y + spot.h) {
                if (e.key === ' ') {
                    this.isHiding = true;
                    this.hidingSpotIndex = i;
                    this.hiddenMovementX = 0;
                    this.hiddenMovementY = 0;
                }
            }
        }

        // Allow slow movement while hidden with arrow keys
        if (this.isHiding && this.hidingSpotIndex >= 0) {
            const spot = this.hidingSpots[this.hidingSpotIndex];
            const moveSpeed = 1; // Very slow movement in hiding spot

            if (e.key === 'ArrowUp' || e.key === 'w') {
                this.hiddenMovementY = Math.max(-20, this.hiddenMovementY - moveSpeed);
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.hiddenMovementY = Math.min(20, this.hiddenMovementY + moveSpeed);
            }
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.hiddenMovementX = Math.max(-20, this.hiddenMovementX - moveSpeed);
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                this.hiddenMovementX = Math.min(20, this.hiddenMovementX + moveSpeed);
            }

            // Exit hiding spot with Space
            if (e.key === ' ' && this.isHiding) {
                this.isHiding = false;
                this.hidingSpotIndex = -1;
                this.hiddenMovementX = 0;
                this.hiddenMovementY = 0;
            }
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.isHiding) {
            // Increase blinking for visual feedback
            this.hidingBlinkCounter++;
            return null;
        }

        // Robot searches and moves with improved pattern
        this.robot.update(this.playerX, this.playerY, this.width, this.height);
        this.robot.speed += 0.008; // Gets faster over time, but slower than before

        // Improved robot search pattern - switches between circular and scanning
        this.robotSearchPhase += 1;
        if (this.robotSearchPhase > 300) {
            this.robotSearchPattern = this.robotSearchPattern === 'circular' ? 'scanning' : 'circular';
            this.robotSearchPhase = 0;
        }

        // Check if robot discovers hiding spots
        for (let i = 0; i < this.hidingSpots.length; i++) {
            const spot = this.hidingSpots[i];
            const distToSpot = Math.sqrt(
                Math.pow(this.robot.x - (spot.x + spot.w / 2), 2) +
                Math.pow(this.robot.y - (spot.y + spot.h / 2), 2)
            );
            if (distToSpot < 150) {
                this.hidingSpots[i].discovered = true;
            }
        }

        // Check if robot found player (only if not hiding)
        if (this.isColliding(this.playerX, this.playerY, this.playerSize, this.robot.x, this.robot.y, this.robot.width)) {
            return 'lose';
        }

        // Win if time runs out and hiding
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

        // Draw hiding spots with improved visuals
        for (let i = 0; i < this.hidingSpots.length; i++) {
            const spot = this.hidingSpots[i];
            const isPlayerHere = this.isHiding && this.hidingSpotIndex === i;

            // Background - darker if discovered
            if (spot.discovered) {
                ctx.fillStyle = '#222222';
            } else {
                ctx.fillStyle = isPlayerHere ? '#00aa00' : '#444444';
            }
            ctx.fillRect(spot.x, spot.y, spot.w, spot.h);

            // Border color changes based on state
            if (isPlayerHere) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 4;
            } else {
                ctx.strokeStyle = spot.discovered ? '#ff4444' : '#0099ff';
                ctx.lineWidth = 2;
            }
            ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);

            // Hiding spot name
            ctx.fillStyle = spot.discovered ? '#ff4444' : '#00ffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(spot.name, spot.x + spot.w / 2, spot.y + spot.h / 2);

            // Discovered indicator
            if (spot.discovered) {
                ctx.fillStyle = '#ff4444';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('ONTDEKT!', spot.x + spot.w / 2, spot.y + spot.h / 2 + 20);
            }
        }

        // Draw player with blinking effect when hidden
        if (this.isHiding && this.hidingSpotIndex >= 0) {
            const spot = this.hidingSpots[this.hidingSpotIndex];
            const baseX = spot.x + spot.w / 2 + this.hiddenMovementX;
            const baseY = spot.y + spot.h / 2 + this.hiddenMovementY;

            // Blinking effect - player becomes slightly visible
            const blinkAlpha = (Math.sin(this.hidingBlinkCounter * 0.05) + 1) / 2 * 0.3 + 0.2;
            ctx.globalAlpha = blinkAlpha;
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(baseX, baseY, this.playerSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Glow effect around hiding spot
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(baseX, baseY, this.playerSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = '#0099ff';
            ctx.beginPath();
            ctx.arc(this.playerX, this.playerY, this.playerSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw robot
        this.robot.draw(ctx);

        // Status display
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';

        if (this.isHiding) {
            ctx.fillStyle = '#00ff00';
            ctx.fillText('JE BENT VERBORGEN (Veilig!)', 50, 100);
            ctx.font = '12px Arial';
            ctx.fillText('Pijlen = langzaam bewegen, SPATIE = verlaten', 50, 125);
        } else {
            ctx.fillStyle = '#ffaa00';
            ctx.fillText('Robot zoekt...', 50, 100);
            ctx.font = '12px Arial';
            ctx.fillText('Druk SPATIE om te verstoppen in een verstopplek', 50, 125);
        }

        // Draw discovered spots count
        const discoveredCount = this.hidingSpots.filter(s => s.discovered).length;
        ctx.fillStyle = '#ff4444';
        ctx.font = '12px Arial';
        ctx.fillText(`Spots ontdekt: ${discoveredCount}/${this.hidingSpots.length}`, 50, 145);
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
        this.ballGravity = 0.15;
        this.ballBounceDamping = 0.75;
        this.robot = new RobotFootball(600, 300);
        this.robotScore = 0;
        this.keysPressed = {};
        this.lastGoalTime = 0;
        this.goalFeedback = '';
        this.lastShootTime = 0;
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
        this.lastGoalTime = 0;
        this.goalFeedback = '';
        this.lastShootTime = 0;

        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.key.toLowerCase()] = true;
            if (e.key === ' ') this.shoot();
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShootTime < 300) return; // Prevent rapid shooting
        this.lastShootTime = now;

        const dx = this.ballX - this.playerX;
        const dy = this.ballY - this.playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 60) {
            const angle = Math.atan2(dy, dx);
            const power = 10;
            this.ballVX = Math.cos(angle) * power;
            this.ballVY = Math.sin(angle) * power;
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Player movement with boundary check
        if (this.keysPressed['arrowup'] || this.keysPressed['w']) {
            this.playerY = Math.max(60, this.playerY - 5);
        }
        if (this.keysPressed['arrowdown'] || this.keysPressed['s']) {
            this.playerY = Math.min(this.height - this.playerSize, this.playerY + 5);
        }
        if (this.keysPressed['arrowleft'] || this.keysPressed['a']) {
            this.playerX = Math.max(20, this.playerX - 5);
        }
        if (this.keysPressed['arrowright'] || this.keysPressed['d']) {
            this.playerX = Math.min(400, this.playerX + 5);
        }

        // Advanced ball physics with gravity
        this.ballVY += this.ballGravity; // Apply gravity
        this.ballX += this.ballVX;
        this.ballY += this.ballVY;

        // Friction/air resistance
        this.ballVX *= 0.97;
        this.ballVY *= 0.97;

        // Ground bounce (simulate grass)
        if (this.ballY >= this.height - 60) {
            this.ballY = this.height - 60;
            this.ballVY = -this.ballVY * this.ballBounceDamping;
        }

        // Wall bounces with better physics
        if (this.ballY < 60) {
            this.ballY = 60;
            this.ballVY = -this.ballVY * this.ballBounceDamping;
        }

        // Side wall bounces
        if (this.ballX < 20) {
            this.ballX = 20;
            this.ballVX = -this.ballVX * this.ballBounceDamping;
        }
        if (this.ballX > this.width - 20) {
            this.ballX = this.width - 20;
            this.ballVX = -this.ballVX * this.ballBounceDamping;
        }

        // Check for goals with proper area
        const goalTop = 180;
        const goalBottom = 420;

        if (this.ballX < 20 && this.ballY > goalTop && this.ballY < goalBottom) {
            this.robotScore++;
            this.lastGoalTime = Date.now();
            this.goalFeedback = 'ROBOT GOAL!';
            this.resetBall();
        }
        if (this.ballX > this.width - 20 && this.ballY > goalTop && this.ballY < goalBottom) {
            this.playerScore++;
            this.lastGoalTime = Date.now();
            this.goalFeedback = 'JIJ GOAL!';
            this.resetBall();
        }

        // Robot AI with improved logic
        this.robot.update(this.ballX, this.ballY, this.width, this.height);

        // Robot shooting with better decision making
        const distToBall = Math.sqrt(
            Math.pow(this.robot.x - this.ballX, 2) +
            Math.pow(this.robot.y - this.ballY, 2)
        );

        if (distToBall < 80 && Math.random() < 0.08) {
            const shot = this.robot.shoot(this.playerX, this.playerY);
            if (shot) {
                this.ballVX = shot.vx;
                this.ballVY = shot.vy;
            }
        }

        // Check win/lose
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

        // Draw field background (grass pattern)
        ctx.fillStyle = '#1a4d1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw field lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 60);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();

        // Draw center circle
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Draw goal areas with gradient effect
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(0, 180, 40, 240);
        ctx.fillRect(this.width - 40, 180, 40, 240);

        // Draw goal lines (nets)
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        const goalTop = 180;
        const goalBottom = 420;
        ctx.strokeRect(0, goalTop, 20, goalBottom - goalTop);
        ctx.strokeRect(this.width - 20, goalTop, 20, goalBottom - goalTop);

        // Draw goal zones more clearly
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(0, goalTop, 20, goalBottom - goalTop);
        ctx.fillRect(this.width - 20, goalTop, 20, goalBottom - goalTop);

        // Draw player (blue square with better shape)
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(this.playerX - 15, this.playerY - 15, 30, 30);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.playerX - 15, this.playerY - 15, 30, 30);

        // Draw robot
        this.robot.draw(ctx);

        // Draw ball with rotation effect
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw score with larger font
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.playerScore}`, 350, 100);
        ctx.fillText(`${this.robotScore}`, 450, 100);

        // Draw dash between scores
        ctx.font = 'bold 30px Arial';
        ctx.fillText('-', 400, 100);

        // Draw goal feedback
        if (this.goalFeedback && Date.now() - this.lastGoalTime < 1500) {
            ctx.fillStyle = this.goalFeedback.includes('ROBOT') ? '#ff4444' : '#00ff00';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.max(0, 1 - (Date.now() - this.lastGoalTime) / 1500);
            ctx.fillText(this.goalFeedback, this.width / 2, 150);
            ctx.globalAlpha = 1.0;
        }

        // Draw instructions
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Pijlen: bewegen | SPATIE: schieten', 50, this.height - 30);

        // Draw ball speed indicator
        const ballSpeed = Math.sqrt(this.ballVX * this.ballVX + this.ballVY * this.ballVY);
        ctx.font = '12px Arial';
        ctx.fillText(`Balsnelheid: ${ballSpeed.toFixed(1)}`, 50, this.height - 10);
    }
}

// LEVEL 5: PUZZLE
class Level5Puzzle extends Level {
    constructor() {
        super();
        this.name = 'Schuifpuzzel';
        this.timeLimit = 90;
        this.tileSize = 60;
        this.gridSize = 4;
        this.tiles = [];
        this.emptyTile = 15;
        this.moves = 0;
        this.playerTimer = 0;
        this.robotTimer = 0;
        this.robotMoves = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.tiles = this.createPuzzle();
        this.moves = 0;
        this.playerTimer = 0;
        this.robotTimer = 0;
        this.robotMoves = 0;

        document.addEventListener('click', (e) => this.handlePuzzleClick(e));
    }

    createPuzzle() {
        const tiles = [];
        for (let i = 0; i < 16; i++) {
            tiles.push(i);
        }
        // Shuffle tiles
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
        return tiles;
    }

    handlePuzzleClick(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const gridStartX = 150;
        const gridStartY = 200;

        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const tileX = gridStartX + col * this.tileSize;
            const tileY = gridStartY + row * this.tileSize;

            if (x > tileX && x < tileX + this.tileSize &&
                y > tileY && y < tileY + this.tileSize) {
                this.moveTile(i);
            }
        }
    }

    moveTile(index) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const emptyRow = Math.floor(this.emptyTile / 4);
        const emptyCol = this.emptyTile % 4;

        // Check if adjacent to empty tile
        if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
            [this.tiles[index], this.tiles[this.emptyTile]] = [this.tiles[this.emptyTile], this.tiles[index]];
            this.emptyTile = index;
            this.moves++;
        }
    }

    isSolved() {
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i) return false;
        }
        return true;
    }

    robotSolveStep() {
        // Simulate robot solving puzzle
        if (Math.random() < 0.15) {
            const validMoves = this.getValidMovesForRobot();
            if (validMoves.length > 0) {
                const moveIdx = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.moveTile(moveIdx);
                this.robotMoves++;
                this.robotTimer += 0.5;
            }
        }
    }

    getValidMovesForRobot() {
        const moves = [];
        const emptyRow = Math.floor(this.emptyTile / 4);
        const emptyCol = this.emptyTile % 4;

        // Check all tiles adjacent to empty
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
                moves.push(i);
            }
        }
        return moves;
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        this.playerTimer = Math.floor((Date.now() - this.startTime) / 1000);
        this.robotSolveStep();

        if (this.isSolved()) return 'win';

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCHUIFPUZZEL - Los het puzzel op!', this.width / 2, 100);

        const gridStartX = 150;
        const gridStartY = 200;

        // Draw puzzle grid
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const x = gridStartX + col * this.tileSize;
            const y = gridStartY + row * this.tileSize;

            if (i === this.emptyTile) {
                // Empty space
                ctx.fillStyle = '#222';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
            } else {
                // Tile with number
                ctx.fillStyle = '#0099ff';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, this.tileSize, this.tileSize);

                ctx.fillStyle = '#000';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.tiles[i] + 1, x + this.tileSize / 2, y + this.tileSize / 2);
            }
        }

        // Draw stats
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Jouw zetten: ${this.moves}`, 50, 150);
        ctx.fillText(`Jouw tijd: ${this.playerTimer}s`, 50, 175);
        ctx.fillText(`Robot zetten: ${this.robotMoves}`, 500, 150);
        ctx.fillText(`Robot tijd: ${this.robotTimer.toFixed(1)}s`, 500, 175);
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
        this.currentDisplayIndex = 0;
        this.lastMoveTime = 0;
        this.feedbackMessage = '';
        this.feedbackColor = '#00ffff';
        this.roundsCompleted = 0;
        this.robotSequenceLength = 1;
        this.robot = new RobotDance(400, 300);
        this.danceAnimationFrame = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.generateNewSequence();
        this.playerSequence = [];
        this.currentDisplayIndex = 0;
        this.roundsCompleted = 0;
        this.robot.generateSequence(1);

        this.keyListener = (e) => this.handleDanceInput(e);
        window.addEventListener('keydown', this.keyListener);
    }

    generateNewSequence() {
        const moves = ['up', 'right', 'down', 'left'];
        this.sequence = [];
        for (let i = 0; i < this.robotSequenceLength; i++) {
            this.sequence.push(moves[Math.floor(Math.random() * 4)]);
        }
        this.danceAnimationFrame = 0;
    }

    getMoveColor(move) {
        const colorMap = {
            'up': '#ff0099',
            'right': '#ffff00',
            'down': '#00ff00',
            'left': '#0099ff'
        };
        return colorMap[move] || '#00ffff';
    }

    getMoveSymbol(move) {
        const symbolMap = {
            'up': '↑',
            'right': '→',
            'down': '↓',
            'left': '←'
        };
        return symbolMap[move] || '';
    }

    handleDanceInput(e) {
        const keyMap = { 'arrowup': 'up', 'arrowright': 'right', 'arrowdown': 'down', 'arrowleft': 'left' };
        const move = keyMap[e.key.toLowerCase()];
        if (move) {
            this.lastMoveTime = Date.now();

            if (this.playerSequence.length < this.sequence.length) {
                this.playerSequence.push(move);

                // Check if move is correct
                if (this.playerSequence[this.playerSequence.length - 1] ===
                    this.sequence[this.playerSequence.length - 1]) {
                    this.feedbackMessage = '✓ Correct!';
                    this.feedbackColor = '#00ff00';
                } else {
                    this.feedbackMessage = '✗ Fout!';
                    this.feedbackColor = '#ff0000';
                    this.playerSequence = []; // Reset on wrong move
                }

                // Check if sequence complete
                if (this.playerSequence.length === this.sequence.length) {
                    this.feedbackMessage = '✓ Ronde compleet!';
                    this.feedbackColor = '#00ff00';
                    this.roundsCompleted++;

                    if (this.roundsCompleted >= 5) {
                        // Win after 5 successful rounds
                        window.removeEventListener('keydown', this.keyListener);
                    } else {
                        // Add new move to sequence
                        setTimeout(() => {
                            this.robotSequenceLength++;
                            this.generateNewSequence();
                            this.playerSequence = [];
                            this.danceAnimationFrame = 0;
                        }, 1000);
                    }
                }
            }
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        this.danceAnimationFrame++;

        if (this.roundsCompleted >= 5) {
            return 'win';
        }

        // Reset feedback after 1 second
        if (Date.now() - this.lastMoveTime > 1000) {
            this.feedbackMessage = '';
        }

        return null;
    }

    drawDancePad(ctx, x, y, size, move, isActive) {
        const color = this.getMoveColor(move);
        ctx.fillStyle = isActive ? color : '#333';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, size, size);

        ctx.fillStyle = color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getMoveSymbol(move), x + size / 2, y + size / 2);
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DANS - Volg de sequentie!', this.width / 2, 80);

        ctx.font = '16px Arial';
        ctx.fillText(`Ronde: ${this.roundsCompleted}/5`, this.width / 2, 120);

        // Draw dance pads (arrows)
        const padSize = 60;
        const centerX = 400;
        const centerY = 300;

        this.drawDancePad(ctx, centerX, centerY - padSize - 20, padSize, 'up',
            this.danceAnimationFrame % 40 < 10 && this.currentDisplayIndex < this.sequence.length && this.sequence[this.currentDisplayIndex] === 'up');
        this.drawDancePad(ctx, centerX + padSize + 20, centerY, padSize, 'right',
            this.danceAnimationFrame % 40 < 10 && this.currentDisplayIndex < this.sequence.length && this.sequence[this.currentDisplayIndex] === 'right');
        this.drawDancePad(ctx, centerX, centerY + padSize + 20, padSize, 'down',
            this.danceAnimationFrame % 40 < 10 && this.currentDisplayIndex < this.sequence.length && this.sequence[this.currentDisplayIndex] === 'down');
        this.drawDancePad(ctx, centerX - padSize - 20, centerY, padSize, 'left',
            this.danceAnimationFrame % 40 < 10 && this.currentDisplayIndex < this.sequence.length && this.sequence[this.currentDisplayIndex] === 'left');

        // Display sequence visually
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Sequentie:', 50, 200);

        for (let i = 0; i < this.sequence.length; i++) {
            const color = i < this.playerSequence.length ? '#00ff00' : this.getMoveColor(this.sequence[i]);
            ctx.fillStyle = color;
            ctx.fillText(this.getMoveSymbol(this.sequence[i]), 80 + i * 40, 200);
        }

        // Feedback
        if (this.feedbackMessage) {
            ctx.fillStyle = this.feedbackColor;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.feedbackMessage, this.width / 2, 450);
        }

        ctx.fillStyle = '#00ffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gebruik pijltoetsen om te dansen', this.width / 2, 550);
    }
}

// LEVEL 7: COOKING
class Level7Cooking extends Level {
    constructor() {
        super();
        this.name = 'Koken';
        this.timeLimit = 120;
        this.allIngredients = [
            { emoji: '🍅', name: 'Tomaat', x: 100, y: 250, width: 60, height: 60 },
            { emoji: '🧂', name: 'Zout', x: 200, y: 250, width: 60, height: 60 },
            { emoji: '🧈', name: 'Boter', x: 300, y: 250, width: 60, height: 60 },
            { emoji: '🍗', name: 'Kip', x: 400, y: 250, width: 60, height: 60 },
            { emoji: '🌶️', name: 'Peper', x: 500, y: 250, width: 60, height: 60 },
            { emoji: '🧄', name: 'Knoflook', x: 600, y: 250, width: 60, height: 60 }
        ];
        this.recipe = ['🍅', '🧈', '🍗'];
        this.selectedIngredients = [];
        this.cookingTime = 0;
        this.cookingTimeNeeded = 3;
        this.isCooking = false;
        this.feedbackMessage = '';
        this.feedbackColor = '#00ffff';
        this.recipesCompleted = 0;
    }

    init(width, height) {
        super.init(width, height);
        this.selectedIngredients = [];
        this.cookingTime = 0;
        this.isCooking = false;
        this.recipesCompleted = 0;
        this.generateNewRecipe();

        document.addEventListener('click', (e) => this.handleIngredientClick(e));
    }

    generateNewRecipe() {
        const availableEmojis = ['🍅', '🧈', '🍗', '🍖', '🥘'];
        this.recipe = [];
        const recipeLength = 2 + this.recipesCompleted;
        for (let i = 0; i < recipeLength; i++) {
            this.recipe.push(availableEmojis[Math.floor(Math.random() * availableEmojis.length)]);
        }
        this.selectedIngredients = [];
        this.isCooking = false;
        this.cookingTime = 0;
    }

    handleIngredientClick(e) {
        if (this.isCooking) return;

        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const ingredient of this.allIngredients) {
            if (x > ingredient.x && x < ingredient.x + ingredient.width &&
                y > ingredient.y && y < ingredient.y + ingredient.height) {
                this.addIngredient(ingredient.emoji);
                return;
            }
        }
    }

    addIngredient(emoji) {
        if (this.selectedIngredients.length < this.recipe.length) {
            this.selectedIngredients.push(emoji);

            // Check if correct so far
            if (this.selectedIngredients[this.selectedIngredients.length - 1] ===
                this.recipe[this.selectedIngredients.length - 1]) {
                this.feedbackMessage = '✓ Correct!';
                this.feedbackColor = '#00ff00';
            } else {
                this.feedbackMessage = '✗ Fout! -10 seconden';
                this.feedbackColor = '#ff0000';
                this.timeRemaining -= 10;
                this.selectedIngredients = [];
            }

            // Recipe complete
            if (this.selectedIngredients.length === this.recipe.length) {
                this.isCooking = true;
                this.feedbackMessage = 'Aan het koken...';
                this.feedbackColor = '#ffaa00';
                this.cookingTime = 0;
            }
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        if (this.isCooking) {
            this.cookingTime += 0.016; // Approximately 16ms per frame
            if (this.cookingTime >= this.cookingTimeNeeded) {
                this.feedbackMessage = '✓ Gerecht klaar!';
                this.feedbackColor = '#00ff00';
                this.recipesCompleted++;

                if (this.recipesCompleted >= 3) {
                    return 'win';
                }

                setTimeout(() => {
                    this.generateNewRecipe();
                }, 1500);
            }
        }

        // Reset feedback after delay
        if (this.feedbackMessage && Date.now() % 2000 > 1000) {
            // Flash feedback for a bit
        }

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('KOKEN - Volg het recept!', this.width / 2, 80);

        ctx.font = '16px Arial';
        ctx.fillText(`Gerechten klaar: ${this.recipesCompleted}/3`, this.width / 2, 120);

        // Draw recipe box
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.fillRect(50, 150, 700, 80);
        ctx.strokeRect(50, 150, 700, 80);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Recept:', 60, 170);

        // Draw recipe ingredients
        for (let i = 0; i < this.recipe.length; i++) {
            const color = i < this.selectedIngredients.length ? '#00ff00' : '#0099ff';
            ctx.fillStyle = color;
            ctx.font = '24px Arial';
            ctx.fillText(this.recipe[i], 100 + i * 70, 200);
        }

        // Draw selected ingredients
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Geselecteerd:', 60, 230);

        for (let i = 0; i < this.selectedIngredients.length; i++) {
            ctx.font = '24px Arial';
            ctx.fillText(this.selectedIngredients[i], 100 + i * 70, 260);
        }

        // Draw ingredients to click
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Ingrediënten:', 50, 330);

        for (const ingredient of this.allIngredients) {
            ctx.fillStyle = '#333';
            ctx.fillRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);
            ctx.strokeStyle = '#0099ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);

            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ingredient.emoji, ingredient.x + ingredient.width / 2, ingredient.y + ingredient.height / 2);
        }

        // Draw cooking progress
        if (this.isCooking) {
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(150, 400, (this.cookingTime / this.cookingTimeNeeded) * 500, 40);
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(150, 400, 500, 40);

            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Aan het koken...', 400, 425);
        }

        // Feedback message
        if (this.feedbackMessage) {
            ctx.fillStyle = this.feedbackColor;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.feedbackMessage, this.width / 2, 500);
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
        this.obstacles = [];
        this.powerUps = [];
        this.spacebarPresses = 0;
        this.lastSpacebarTime = 0;
        this.spacebarCooldown = 100; // ms between presses
        this.playerVelocity = 0;
        this.robotVelocity = 1;
        this.playerSpeed = 5;
        this.feedbackMessage = '';
        this.feedbackColor = '#00ffff';
        this.boost = 0;
        this.boostMax = 100;
        this.spacePressed = false;
    }

    init(width, height) {
        super.init(width, height);
        this.playerPosition = 0;
        this.robotPosition = 0;
        this.spacebarPresses = 0;
        this.playerVelocity = 0;
        this.robotVelocity = 1;
        this.boost = 0;
        this.generateObstaclesAndPowerUps();

        this.keyListener = (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                if (now - this.lastSpacebarTime > this.spacebarCooldown) {
                    this.playerPosition += this.playerSpeed;
                    this.spacebarPresses++;
                    this.boost = Math.min(this.boost + 10, this.boostMax);
                    this.lastSpacebarTime = now;
                    this.feedbackMessage = 'BOOST!';
                    this.feedbackColor = '#ffaa00';
                }
            }
        };
        window.addEventListener('keydown', this.keyListener);
    }

    generateObstaclesAndPowerUps() {
        this.obstacles = [];
        this.powerUps = [];

        for (let i = 200; i < this.trackLength; i += 150) {
            this.obstacles.push({
                position: i + Math.random() * 50,
                active: true
            });
        }

        for (let i = 300; i < this.trackLength; i += 250) {
            this.powerUps.push({
                position: i + Math.random() * 50,
                active: true,
                type: Math.random() > 0.5 ? 'speed' : 'slow'
            });
        }
    }

    checkCollisions() {
        for (const obstacle of this.obstacles) {
            if (obstacle.active && Math.abs(this.playerPosition - obstacle.position) < 30) {
                obstacle.active = false;
                this.playerPosition -= 80; // Setback for hitting obstacle
                this.feedbackMessage = '✗ Obstakel geraakt!';
                this.feedbackColor = '#ff0000';
            }
        }

        for (const powerUp of this.powerUps) {
            if (powerUp.active && Math.abs(this.playerPosition - powerUp.position) < 30) {
                powerUp.active = false;
                if (powerUp.type === 'speed') {
                    this.playerSpeed += 2;
                    this.feedbackMessage = '✓ Sneller!';
                    this.feedbackColor = '#00ff00';
                } else {
                    this.robotVelocity -= 0.5;
                    this.feedbackMessage = '✓ Robot vertraagd!';
                }
            }
        }
    }

    update(gameState) {
        const result = super.update(gameState);
        if (result) return result;

        // Robot AI - accelerates over time with some variation
        this.robotVelocity += 0.015;
        this.robotPosition += this.robotVelocity + Math.random() * 0.5;

        // Player boost system - can be used to accelerate
        if (this.boost > 0) {
            this.boost -= 0.5;
        }

        // Check collisions
        this.checkCollisions();

        // Clamp positions to track
        this.playerPosition = Math.max(0, Math.min(this.playerPosition, this.trackLength));
        this.robotPosition = Math.max(0, Math.min(this.robotPosition, this.trackLength));

        // Win/lose conditions
        if (this.playerPosition >= this.trackLength) return 'win';
        if (this.robotPosition >= this.trackLength) return 'lose';

        // Reset feedback message
        if (Date.now() % 1000 > 500) {
            // Flash effect
        }

        return null;
    }

    draw(ctx) {
        super.draw(ctx);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RACE - Spam SPATIE om te racen!', this.width / 2, 80);

        const trackWidth = 600;
        const trackStartX = 100;
        const trackStartY = 150;
        const trackHeight = 120;

        // Draw track background
        ctx.fillStyle = '#222';
        ctx.fillRect(trackStartX, trackStartY, trackWidth, trackHeight);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(trackStartX, trackStartY, trackWidth, trackHeight);

        // Draw finish line
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trackStartX + trackWidth - 10, trackStartY);
        ctx.lineTo(trackStartX + trackWidth - 10, trackStartY + trackHeight);
        ctx.stroke();

        // Draw obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle.active) {
                const x = trackStartX + (obstacle.position / this.trackLength) * trackWidth;
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(x - 5, trackStartY + 20, 10, 40);
            }
        }

        // Draw power-ups
        for (const powerUp of this.powerUps) {
            if (powerUp.active) {
                const x = trackStartX + (powerUp.position / this.trackLength) * trackWidth;
                ctx.fillStyle = powerUp.type === 'speed' ? '#ffff00' : '#0099ff';
                ctx.beginPath();
                ctx.arc(x, trackStartY + 30, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw player
        const playerX = trackStartX + (this.playerPosition / this.trackLength) * trackWidth;
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(playerX - 8, trackStartY + 10, 16, 30);
        ctx.fillText('JIJ', playerX - 10, trackStartY + 60);

        // Draw robot
        const robotX = trackStartX + (this.robotPosition / this.trackLength) * trackWidth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(robotX - 8, trackStartY + 70, 16, 30);
        ctx.fillText('ROBOT', robotX - 20, trackStartY + 120);

        // Draw progress text
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Jij: ${Math.floor(this.playerPosition)}/${this.trackLength}`, 50, 300);
        ctx.fillText(`Robot: ${Math.floor(this.robotPosition)}/${this.trackLength}`, 50, 330);
        ctx.fillText(`Snelheid: ${this.playerSpeed}`, 50, 360);
        ctx.fillText(`Spacebar presses: ${this.spacebarPresses}`, 50, 390);

        // Draw boost bar
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(100, 410, (this.boost / this.boostMax) * 300, 20);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 410, 300, 20);
        ctx.fillStyle = '#00ffff';
        ctx.font = '12px Arial';
        ctx.fillText('BOOST', 50, 423);

        // Feedback message
        if (this.feedbackMessage) {
            ctx.fillStyle = this.feedbackColor;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.feedbackMessage, this.width / 2, 500);
        }

        ctx.fillStyle = '#00ffff';
        ctx.font = '12px Arial';
        ctx.fillText('🔴 Obstakels | 🟡 Powerups (snelheid/vertraging)', this.width / 2, 550);
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
