class Robot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = '#00ff00';
        this.difficulty = 1;
    }

    update(playerState, gameWidth, gameHeight) {
        // Override in subclasses
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw simple robot face
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 26, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 14, this.y + 22, 12, 4);
    }

    increaseDifficulty() {
        this.difficulty = Math.min(this.difficulty + 0.2, 3);
    }
}

class RobotMemory extends Robot {
    constructor(x, y) {
        super(x, y);
        this.cards = [];
        this.memory = [];
    }

    rememberCard(index, cardValue) {
        this.memory.push({ index, cardValue });
    }

    getNextMove(availableCards) {
        // Try to find a matching pair from memory
        if (this.memory.length > 0) {
            const known = this.memory[Math.floor(Math.random() * this.memory.length)];
            const match = this.memory.find(m => m.cardValue === known.cardValue && m.index !== known.index);
            if (match && availableCards.includes(match.index)) {
                return { first: known.index, second: match.index };
            }
        }
        return null;
    }
}

class RobotTag extends Robot {
    constructor(x, y) {
        super(x, y);
        this.vx = 0;
        this.vy = 0;
        this.speed = 2;
    }

    update(playerX, playerY, gameWidth, gameHeight) {
        // Chase player with increasing speed based on difficulty
        const speed = this.speed * this.difficulty;
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        this.x = Math.max(0, Math.min(this.x, gameWidth - this.width));
        this.y = Math.max(60, Math.min(this.y, gameHeight - this.height));
    }
}

class RobotFootball extends Robot {
    constructor(x, y) {
        super(x, y);
        this.ballX = 0;
        this.ballY = 0;
        this.speed = 3;
    }

    update(ballX, ballY, gameWidth, gameHeight) {
        const speed = this.speed * (0.5 + this.difficulty * 0.3);
        const dx = ballX - this.x;
        const dy = ballY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > speed) {
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }

        this.x = Math.max(0, Math.min(this.x, gameWidth - this.width));
        this.y = Math.max(60, Math.min(this.y, gameHeight - this.height));
    }

    shoot(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        const force = 5 + this.difficulty;
        return {
            vx: Math.cos(angle) * force,
            vy: Math.sin(angle) * force
        };
    }
}

class RobotDance extends Robot {
    constructor(x, y) {
        super(x, y);
        this.sequence = [];
        this.currentIndex = 0;
    }

    generateSequence(length) {
        const moves = ['up', 'down', 'left', 'right'];
        this.sequence = [];
        for (let i = 0; i < length; i++) {
            this.sequence.push(moves[Math.floor(Math.random() * moves.length)]);
        }
    }

    getNextMove() {
        if (this.currentIndex < this.sequence.length) {
            return this.sequence[this.currentIndex++];
        }
        return null;
    }

    resetSequence() {
        this.currentIndex = 0;
    }
}
