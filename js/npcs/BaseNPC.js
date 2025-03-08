import { SPRITES } from '../colors.js';

export class BaseNPC {
    constructor({ x, y, name, canMove = false, canMoveThruWalls = false }) {
        // Store original tile coordinates for spawn position
        this.spawnTileX = x;
        this.spawnTileY = y;
        
        // Convert tile position to pixels for current position
        this.x = x * 32;
        this.y = y * 32;
        this.width = 32;
        this.height = 32;
        this.name = name;
        this.direction = 'down';
        this.debug = false;

        // Movement properties
        this.canMove = canMove;
        this.canMoveThruWalls = canMoveThruWalls;
        this.speed = 0.5;
        this.moveTimer = 0;
        this.moveInterval = 60; // Time between movement decisions in frames
        this.moveRange = 1; // How many tiles it can move from spawn
        this.initialX = this.x; // Store initial pixel position
        this.initialY = this.y;
        
        // Tile-by-tile movement properties
        this.isMoving = false; // Flag for when NPC is moving between tiles
        this.directionX = 0;
        this.directionY = 0;
        this.targetX = this.x; // Target position for movement
        this.targetY = this.y;
        
        // Aggro and targeting properties
        this.isAggressive = false;
        this.aggroRange = 64; // 2 tiles detection range (can be overridden by subclasses)
        this.followDistance = 32; // How close the NPC tries to get to target (1 tile)
        
        // Path tracking properties
        this.lastTargetX = null;
        this.lastTargetY = null;
        this.pathChangeTimer = 0;
        this.pathChangeInterval = 60; // How often to update path when following target

        // Marker properties
        this.showMarker = true;
        this.markerOffset = 0;
        this.markerSpeed = 0.1;
        this.markerTime = 0;

        // Conversation properties
        this.conversationIndex = 0;
        this.isInConversation = false;
        this.conversations = [["Hello!"]]; // Default conversation
    }

    setDebug(debug) {
        this.debug = debug;
    }

    interact(player) {
        if (!this.isInConversation) {
            this.isInConversation = true;
            const currentConversation = this.conversations[this.conversationIndex];
            player.game.showDialog(currentConversation, () => {
                this.isInConversation = false;
                if (this.conversationIndex === 0) {
                    this.showMarker = false;
                }
                this.conversationIndex = (this.conversationIndex + 1) % this.conversations.length;
                this.onConversationComplete?.();
            });
        }
    }

    // Optional callback for subclasses
    onConversationComplete() {}
    
    update(player, deltaTime, map) {
        if (!this.canMove || this.isInConversation) return;
        
        if (this.isMoving) {
            // Continue ongoing movement
            this._handleMovementAnimation();
        } else {
            // Increment move timer for random movement
            this.moveTimer += 1;
            
            // Random movement if no target is set
            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0;
                
                // 50% chance to move randomly
                if (Math.random() > 0.5) {
                    this._moveRandomly(player, map);
                }
            }
        }
    }
    
    // Set a target position for the NPC to move toward
    setMoveTarget(x, y) {
        const tileX = Math.floor(x / 32);
        const tileY = Math.floor(y / 32);
        
        // Store the target for pathfinding
        this.lastTargetX = tileX;
        this.lastTargetY = tileY;
    }
    
    // Clear the target position so NPC will roam randomly again
    clearMoveTarget() {
        this.lastTargetX = null;
        this.lastTargetY = null;
    }
    
    // Updates direction property based on movement direction
    _updateDirection() {
        if (this.directionX > 0) {
            this.direction = 'right';
        } else if (this.directionX < 0) {
            this.direction = 'left';
        } else if (this.directionY > 0) {
            this.direction = 'down';
        } else if (this.directionY < 0) {
            this.direction = 'up';
        }
    }
    
    // Handles the movement animation between tiles
    _handleMovementAnimation() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Reached the target - snap to it
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        } else {
            // Continue moving towards target
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    // Internal method to check if a tile move is valid
    _isValidTileMove(tileX, tileY, player, map) {
        // Check map boundaries
        if (tileX < 0 || tileY < 0 || tileX >= map.mapData[0].length || tileY >= map.mapData.length) {
            return false;
        }
        
        // Check if the tile is walkable
        if (!this.canMoveThruWalls && !map.isWalkableTile(map.mapData[tileY][tileX])) {
            return false;
        }
        
        // Check distance from spawn (if moveRange is set)
        if (this.moveRange > 0) {
            const dx = Math.abs(tileX - this.spawnTileX);
            const dy = Math.abs(tileY - this.spawnTileY);
            if (dx > this.moveRange || dy > this.moveRange) {
                return false;
            }
        }
        
        return true;
    }
    
    // Check if the new position is valid (no collisions)
    // This is used during movement animation
    isValidMove(x, y, player, map) {
        const tileX = Math.floor(x / 32);
        const tileY = Math.floor(y / 32);
        return this._isValidTileMove(tileX, tileY, player, map);
    }

    isNearby(player) {
        // Calculate distance to player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Consider nearby if within 48 pixels (1.5 tiles)
        return distance < 48;
    }

    _renderNPC(ctx, screenX, screenY) {
        // Basic NPC appearance
        ctx.fillStyle = SPRITES.PLAYER.body;
        ctx.fillRect(screenX + 8, screenY + 8, 16, 20);

        ctx.fillStyle = SPRITES.PLAYER.skin;
        ctx.fillRect(screenX + 8, screenY + 4, 16, 16);

        // Draw name above NPC
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, screenY - 5);
    }

    _renderMarker(ctx, screenX, screenY) {
        if (this.showMarker) {
            this.markerTime += this.markerSpeed;
            this.markerOffset = Math.sin(this.markerTime) * 4;
            
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(screenX + 16, screenY - 8 + this.markerOffset);
            ctx.lineTo(screenX + 21, screenY - 18 + this.markerOffset);
            ctx.lineTo(screenX + 11, screenY - 18 + this.markerOffset);
            ctx.closePath();
            ctx.fill();
        }
    }

    _renderDebug(ctx, screenX, screenY) {
        if (!this.debug) return;

        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, this.height);

        // Interaction radius
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + 16, 48, 0, Math.PI * 2);
        ctx.stroke();
        
        // NPC name is already displayed elsewhere, so we don't need to show it in debug mode
        
        // Show current tile position
        const tileX = Math.floor(this.x / 32);
        const tileY = Math.floor(this.y / 32);
        ctx.fillStyle = 'yellow';
        ctx.fillText(`Tile: (${tileX},${tileY})`, screenX + this.width / 2, screenY - 18);
        
        // Show aggro state if aggressive
        if (this.isAggressive) {
            // Aggro range circle
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.aggroRange, 0, Math.PI * 2);
            ctx.stroke();
            
            // AGGRO text
            ctx.fillStyle = 'red';
            ctx.font = '12px Arial';
            ctx.fillText('AGGRO', screenX + this.width / 2, screenY - 30);
        }
        
        // Show target with a line if there is one
        if (this.targetX !== null && this.targetY !== null) {
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(screenX + this.width / 2, screenY + this.height / 2);
            
            // Calculate target position on screen
            const targetScreenX = screenX + (this.targetX - this.x);
            const targetScreenY = screenY + (this.targetY - this.y);
            
            ctx.lineTo(targetScreenX, targetScreenY);
            ctx.stroke();
            
            // Draw target point
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(targetScreenX, targetScreenY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Show movement range from spawn
        if (this.moveRange > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            
            // Convert spawn coordinates to screen coordinates
            const spawnScreenX = screenX + ((this.spawnTileX * 32) - this.x);
            const spawnScreenY = screenY + ((this.spawnTileY * 32) - this.y);
            
            // Draw rectangle showing movement range
            const rangeSize = this.moveRange * 32 * 2;
            ctx.strokeRect(
                spawnScreenX - (this.moveRange * 32), 
                spawnScreenY - (this.moveRange * 32),
                rangeSize,
                rangeSize
            );
        }
    }

        // Attempt a random movement in L-shape manner
    _moveRandomly(player, map) {
        // Already moving or can't move
        if (this.isMoving || !this.canMove) return;
        
        // Get current tile position
        const currentTileX = Math.floor(this.x / 32);
        const currentTileY = Math.floor(this.y / 32);
        
        // First, decide if we'll make an L-shape move or just a regular move
        const makeLShapeMove = Math.random() > 0.7; // 30% chance for L-shape move
        
        if (makeLShapeMove) {
            // For L-shape, first we need to move horizontally or vertically
            // Randomly choose direction (horizontal first or vertical first)
            const horizontalFirst = Math.random() > 0.5;
            
            if (horizontalFirst) {
                // Try horizontal move first
                const dx = Math.random() > 0.5 ? 1 : -1; // randomly go left or right
                this._attemptMove(currentTileX + dx, currentTileY, player, map);
            } else {
                // Try vertical move first
                const dy = Math.random() > 0.5 ? 1 : -1; // randomly go up or down
                this._attemptMove(currentTileX, currentTileY + dy, player, map);
            }
        } else {
            // Regular move - choose a random direction (up, down, left, right)
            const direction = Math.floor(Math.random() * 4);
            let targetTileX = currentTileX;
            let targetTileY = currentTileY;
            
            switch (direction) {
                case 0: // Up
                    targetTileY -= 1;
                    break;
                case 1: // Right
                    targetTileX += 1;
                    break;
                case 2: // Down
                    targetTileY += 1;
                    break;
                case 3: // Left
                    targetTileX -= 1;
                    break;
            }
            
            this._attemptMove(targetTileX, targetTileY, player, map);
        }
    }
    
    // Helper method to attempt movement to a specific tile
    _attemptMove(tileX, tileY, player, map) {
        if (this._isValidTileMove(tileX, tileY, player, map)) {
            // Set target position in pixels
            this.targetX = tileX * 32;
            this.targetY = tileY * 32;
            
            // Set movement direction for animation
            this.directionX = tileX - Math.floor(this.x / 32);
            this.directionY = tileY - Math.floor(this.y / 32);
            
            // Update character direction based on movement
            this._updateDirection();
            
            // Start moving
            this.isMoving = true;
        }
    }
    
    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
    }
}
