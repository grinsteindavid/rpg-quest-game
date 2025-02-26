import { SPRITES } from './colors.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 2;
        this.direction = 'down';
        this.moving = false;
        this.collision = {
            width: 28,
            height: 28
        };
        this.map = null; // Will be set by game
        this.input = null;
        this.mapOffset = {
            x: 0,
            y: 0
        };
        this.initialSpawn = true; // New flag for initial spawn
        this.debug = false;
        this.tileSize = 32;
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;
    }

    setMap(map) {
        this.map = map;
        if (this.initialSpawn) {
            // Place player in first empty path (tile type 0)
            for (let y = 0; y < map.mapData.length; y++) {
                for (let x = 0; x < map.mapData[y].length; x++) {
                    if (map.mapData[y][x] === 0) {
                        this.x = x * map.tileSize;
                        this.y = y * map.tileSize;
                        this.initialSpawn = false;
                        break;
                    }
                }
                if (!this.initialSpawn) break;
            }
        }

        // Calculate map offset
        this.mapOffset.x = (800 - this.map.mapData[0].length * this.map.tileSize) / 2;
        this.mapOffset.y = (600 - this.map.mapData.length * this.map.tileSize) / 2;
    }

    setInput(input) {
        this.input = input;
    }

    setDebug(debug) {
        this.debug = debug;
    }

    move(dx, dy) {
        if (!this.map || this.isMoving) return;
        
        // Only allow one direction at a time
        if (dx !== 0 && dy !== 0) return;

        // Calculate target position
        const newX = this.x + (dx * this.tileSize);
        const newY = this.y + (dy * this.tileSize);

        // Convert to tile coordinates
        const tileX = Math.floor(newX / this.tileSize);
        const tileY = Math.floor(newY / this.tileSize);

        // Check if target tile is walkable
        if (tileX >= 0 && tileX < this.map.mapData[0].length &&
            tileY >= 0 && tileY < this.map.mapData.length &&
            this.map.isWalkableTile(this.map.mapData[tileY][tileX])) {
            
            // Set target position
            this.targetX = tileX * this.tileSize;
            this.targetY = tileY * this.tileSize;
            this.isMoving = true;

            // Update direction
            if (dx < 0) this.direction = 'left';
            else if (dx > 0) this.direction = 'right';
            else if (dy < 0) this.direction = 'up';
            else if (dy > 0) this.direction = 'down';
        }
    }

    update() {
        if (!this.input) return;

        // Handle input only when not moving
        if (!this.isMoving) {
            if (this.input.isPressed('ArrowLeft') || this.input.isPressed('a')) {
                this.move(-1, 0);
            } else if (this.input.isPressed('ArrowRight') || this.input.isPressed('d')) {
                this.move(1, 0);
            } else if (this.input.isPressed('ArrowUp') || this.input.isPressed('w')) {
                this.move(0, -1);
            } else if (this.input.isPressed('ArrowDown') || this.input.isPressed('s')) {
                this.move(0, 1);
            }
        }

        // Handle movement animation
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                // Snap to target position when close enough
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
            } else {
                // Move towards target
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        }
    }

    render(ctx) {
        const mapOffset = this.map.getMapOffset();
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        // Draw player
        ctx.fillStyle = SPRITES.PLAYER.body;
        ctx.fillRect(screenX + 8, screenY + 8, 16, 20);

        ctx.fillStyle = SPRITES.PLAYER.skin;
        ctx.fillRect(screenX + 8, screenY + 4, 16, 16);

        ctx.fillStyle = SPRITES.PLAYER.hair;
        ctx.fillRect(screenX + 6, screenY + 4, 20, 4);

        // Draw face
        const eyeOffset = this.direction === 'left' ? -2 : 2;
        ctx.fillRect(screenX + 12 + eyeOffset, screenY + 10, 2, 2);

        // Debug visualization
        if (this.debug) {
            // Only show blue boundary box
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, this.width, this.height);

            // Direction indicator
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(screenX + this.width / 2, screenY + this.height / 2);
            const length = 20;
            let dirX = 0, dirY = 0;
            switch (this.direction) {
                case 'up': dirY = -length; break;
                case 'down': dirY = length; break;
                case 'left': dirX = -length; break;
                case 'right': dirX = length; break;
            }
            ctx.lineTo(screenX + this.width / 2 + dirX, screenY + this.height / 2 + dirY);
            ctx.stroke();
        }
    }
}
