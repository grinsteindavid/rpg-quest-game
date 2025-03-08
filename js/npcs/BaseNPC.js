import { SPRITES } from '../colors.js';

export class BaseNPC {
    constructor({ x, y, name, canMove = false, canMoveThruWalls = false }) {
        this.x = x * 32; // Convert tile position to pixels
        this.y = y * 32;
        this.width = 32;
        this.height = 32;
        this.name = name;
        this.direction = 'down';
        this.debug = false;

        // Movement properties
        this.canMove = canMove;
        this.canMoveThruWalls = canMoveThruWalls;
        this.speed = 1;
        this.moveTimer = 0;
        this.moveInterval = 60; // Time between movement in frames
        this.moveRange = 2; // How many tiles it can move from spawn
        this.initialX = this.x; // Store initial position (already converted to pixels)
        this.initialY = this.y;
        
        // Movement direction tracking
        this.directionX = 0;
        this.directionY = 0;
        this.targetX = null;
        this.targetY = null;
        
        // Aggro and targeting properties
        this.isAggressive = false;
        this.aggroRange = 96; // 3 tiles detection range (can be overridden by subclasses)
        this.followDistance = 32; // How close the NPC tries to get to target (1 tile)
        
        // Path tracking properties
        this.lastTargetX = null;
        this.lastTargetY = null;
        this.pathChangeTimer = 0;
        this.pathChangeInterval = 30; // How often to update path when following target

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
        if (!this.canMove) return;
        
        // Check for player aggro first
        if (player) {
            const distanceToPlayer = Math.sqrt(
                Math.pow((player.x - this.x), 2) + 
                Math.pow((player.y - this.y), 2)
            );
            
            // Set aggro based on distance to player
            this.isAggressive = distanceToPlayer <= this.aggroRange;
            
            // If aggressive, set player as movement target
            if (this.isAggressive) {
                // Only update target if we're not already close enough
                if (distanceToPlayer > this.followDistance) {
                    this.setMoveTarget(player.x, player.y);
                } else {
                    // If close enough, stop moving toward player
                    this.clearMoveTarget();
                }
            } else {
                // If not aggressive, clear target to allow random movement
                this.clearMoveTarget();
            }
        }
        
        // Handle NPC movement - tile by tile, L-shaped pattern
        this.moveTimer++;
        
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // Get current tile position
            const currentTileX = Math.floor(this.x / 32);
            const currentTileY = Math.floor(this.y / 32);
            
            // Decide on a new direction
            if (!this.targetX && !this.targetY) {
                // Random movement when no target - one direction at a time (tile by tile)
                if (Math.random() > 0.5) {
                    // Move horizontally only
                    this.directionX = Math.random() > 0.5 ? 1 : -1;
                    this.directionY = 0;
                } else {
                    // Move vertically only
                    this.directionX = 0;
                    this.directionY = Math.random() > 0.5 ? 1 : -1;
                }
            } else {
                // Move toward target using strict L-shaped movement
                // Calculate target tile position
                const targetTileX = Math.floor(this.targetX / 32);
                const targetTileY = Math.floor(this.targetY / 32);
                
                // Determine if we need to move on X axis first (L-shaped movement)
                if (currentTileX !== targetTileX) {
                    // Move horizontally first - exactly one tile at a time
                    this.directionX = targetTileX > currentTileX ? 1 : -1;
                    this.directionY = 0;
                } else if (currentTileY !== targetTileY) {
                    // Once X is aligned, move vertically - exactly one tile at a time
                    this.directionX = 0;
                    this.directionY = targetTileY > currentTileY ? 1 : -1;
                } else {
                    // If we're at the target position, clear it
                    this.clearMoveTarget();
                    this.directionX = 0;
                    this.directionY = 0;
                }
            }
            
            // Set direction for rendering
            if (this.directionX > 0) {
                this.direction = 'right';
            } else if (this.directionX < 0) {
                this.direction = 'left';
            } else if (this.directionY > 0) {
                this.direction = 'down';
            } else if (this.directionY < 0) {
                this.direction = 'up';
            }
            
            // Calculate next position - move full tile width in the direction
            const nextX = this.x + (this.directionX * this.speed);
            const nextY = this.y + (this.directionY * this.speed);
            
            // Check if move is valid (checking walls and player collision)
            const canMove = this.canMoveThruWalls || this.isValidMove(nextX, nextY, player, map);
            
            if (canMove) {
                // Apply movement
                this.x = nextX;
                this.y = nextY;
            } else {
                // If we can't move, reset direction
                this.directionX = 0;
                this.directionY = 0;
            }
        }
        
        // Constrain to move range if not targeting something specific
        if (!this.targetX && !this.targetY) {
            const distanceFromSpawn = Math.sqrt(
                Math.pow((this.initialX - this.x), 2) + 
                Math.pow((this.initialY - this.y), 2)
            );
            
            if (distanceFromSpawn > this.moveRange * 32) {
                // Move back toward spawn point
                const angle = Math.atan2(this.initialY - this.y, this.initialX - this.x);
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;
            }
        }
    }
    
    // Set a target position for the NPC to move toward
    setMoveTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    // Clear the target position so NPC will roam randomly again
    clearMoveTarget() {
        this.targetX = null;
        this.targetY = null;
    }
    
    // Check if the new position is valid (no collisions)
    isValidMove(x, y, player, map) {
        if (!map) return true; // If no map is provided, we can't check wall collisions
        
        // Check for player collision
        const npcRect = {
            x: x,
            y: y,
            width: this.width,
            height: this.height
        };
        
        const playerRect = {
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height
        };
        
        // Simple rectangle collision detection with player
        if (npcRect.x < playerRect.x + playerRect.width &&
            npcRect.x + npcRect.width > playerRect.x &&
            npcRect.y < playerRect.y + playerRect.height &&
            npcRect.y + npcRect.height > playerRect.y) {
            return false; // Collision with player detected
        }
        
        // Check for wall collisions - check the four corners of the NPC
        // Check top-left corner
        if (map.isSolidTile(map.getTileAt(x, y))) {
            return false;
        }
        
        // Check top-right corner
        if (map.isSolidTile(map.getTileAt(x + this.width - 1, y))) {
            return false;
        }
        
        // Check bottom-left corner
        if (map.isSolidTile(map.getTileAt(x, y + this.height - 1))) {
            return false;
        }
        
        // Check bottom-right corner
        if (map.isSolidTile(map.getTileAt(x + this.width - 1, y + this.height - 1))) {
            return false;
        }
        
        return true; // No collision detected
    }

    isNearby(player) {
        const distance = Math.sqrt(
            Math.pow((player.x - this.x), 2) + 
            Math.pow((player.y - this.y), 2)
        );
        return distance <= 48; // Within 1.5 tiles
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
    }

    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
    }
}
