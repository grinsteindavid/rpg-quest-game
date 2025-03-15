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
        this.moveRange = 4; // How many tiles it can move from spawn
        this.initialX = this.x; // Store initial pixel position
        this.initialY = this.y;
        
        // Tile-by-tile movement properties
        this.isMoving = false; // Flag for when NPC is moving between tiles
        this.directionX = 0;
        this.directionY = 0;
        this.targetX = this.x; // Target position for movement
        this.targetY = this.y;
        
        // Aggro and targeting properties
        this.isAggressive = false; // Whether the NPC is currently aggressive (can change dynamically)
        this.canBeAggressive = false; // Whether the NPC can become aggressive when player is in range
        this.followPlayer = false; // Whether the NPC should always follow the player when in range (friendly or not)
        this.aggroRange = 96; // 3 tiles detection range (can be overridden by subclasses)
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
        
        // Health properties
        this.maxHealth = 100; // Default maximum health
        this.health = this.maxHealth; // Current health
        this.showHealthBar = true; // Whether to display the health bar
        this.healthBarWidth = 32; // Width of health bar (same as NPC width)
        this.healthBarHeight = 4; // Height of health bar
        this.healthBarYOffset = -10; // Position above the NPC
        this.isDamaged = false; // Flag for damage visual effect
        this.damageEffectDuration = 20; // Frames to show damage effect
        this.damageEffectTimer = 0; // Timer for damage effect
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
    
    // Take damage from player or other sources
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.isDamaged = true;
        this.damageEffectTimer = this.damageEffectDuration;
        
        // Check if NPC is defeated
        if (this.health <= 0) {
            this.onDefeat?.();
        }
        
        return this.health <= 0; // Return true if defeated
    }
    
    // Heal the NPC
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    // Reset health to max
    resetHealth() {
        this.health = this.maxHealth;
        this.isDamaged = false;
    }
    
    // Optional callback for when NPC is defeated
    onDefeat() {}
    
    update(player, deltaTime, map) {
        // Update damage effect timer if active
        if (this.isDamaged) {
            this.damageEffectTimer--;
            if (this.damageEffectTimer <= 0) {
                this.isDamaged = false;
            }
        }
        
        // Don't update if NPC can't move or is in conversation
        if (!this.canMove || this.isInConversation) return;
        
        if (this.isMoving) {
            // Continue ongoing movement
            this._handleMovementAnimation();
            return; // Exit early to avoid starting new movements while already moving
        }

        // Calculate distance to player for all NPCs
        const distanceToPlayer = this._getDistanceToPlayer(player);
        const distanceFromSpawn = this._getDistanceFromSpawn();
        
        // Dynamically update aggressive state based on player proximity - only for aggressive NPCs
        if (this.canBeAggressive) {
            // Check if player is in aggro range
            if (distanceToPlayer <= this.aggroRange) {
                // Set NPC to aggressive when player is in range
                this.isAggressive = true;
            } else {
                // Set NPC back to non-aggressive when player is out of range
                this.isAggressive = false;
            }
        }
        
        // Handle NPC movement based on current state
        if (this.followPlayer) {
            // Always follow player when followPlayer is true, regardless of range
            this._followTarget(player, map);
            return; // Skip random movement when following player
        } else if (this.isAggressive && distanceToPlayer <= this.aggroRange) {
            // Aggressive NPC follows player only when in aggro range
            this._followTarget(player, map);
            return; // Skip random movement when following player
        } else if (this.canBeAggressive && distanceFromSpawn > 10) { // If aggressive NPC is out of spawn area, return home
            // Return to spawn position (only for aggressive NPCs)
            this._returnToSpawn(map);
            return; // Skip random movement when returning to spawn
        }
        
        // Increment move timer for random movement
        this.moveTimer += 1;
        
        // Random movement if no aggro behavior is triggered
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // 50% chance to move randomly
            if (Math.random() > 0.5) {
                this._moveRandomly(player, map);
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
        
        // Check distance from spawn (if moveRange is set and NPC isn't set to follow player)
        if (this.moveRange > 0 && !this.followPlayer) {
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

    // Calculate distance to player for aggro detection
    _getDistanceToPlayer(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate distance from spawn point
    _getDistanceFromSpawn() {
        const dx = this.x - (this.spawnTileX * 32);
        const dy = this.y - (this.spawnTileY * 32);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Make NPC follow a target (player)
    _followTarget(player, map) {
        // Don't try to follow if already moving between tiles
        if (this.isMoving) return;
        
        // Calculate distance to player in pixels
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if player is beyond the follow distance
        if (distanceToPlayer <= this.followDistance) {
            return;
        }
        
        // Calculate direction to move towards player
        const playerTileX = Math.floor(player.x / 32);
        const playerTileY = Math.floor(player.y / 32);
        const npcTileX = Math.floor(this.x / 32);
        const npcTileY = Math.floor(this.y / 32);
        
        // Already at same tile as player
        if (playerTileX === npcTileX && playerTileY === npcTileY) {
            return;
        }
        
        // Update path change timer to avoid constant recalculation
        this.pathChangeTimer += 1;
        if (this.pathChangeTimer < this.pathChangeInterval / 4) {
            return;
        }
        this.pathChangeTimer = 0;
        
        // Determine which direction to move (simple pathfinding)
        let dirX = 0;
        let dirY = 0;
        
        // Move horizontally or vertically based on largest distance
        if (Math.abs(playerTileX - npcTileX) > Math.abs(playerTileY - npcTileY)) {
            // Move horizontally
            dirX = playerTileX > npcTileX ? 1 : -1;
        } else {
            // Move vertically
            dirY = playerTileY > npcTileY ? 1 : -1;
        }
        
        // Try to move in the chosen direction
        const newTileX = npcTileX + dirX;
        const newTileY = npcTileY + dirY;
        
        if (this._isValidTileMove(newTileX, newTileY, player, map)) {
            this.targetX = newTileX * 32;
            this.targetY = newTileY * 32;
            this.directionX = dirX;
            this.directionY = dirY;
            this.isMoving = true;
            this._updateDirection();
        } else {
            // If primary direction is blocked, try the other direction
            if (dirX !== 0) {
                dirX = 0;
                dirY = playerTileY > npcTileY ? 1 : -1;
            } else {
                dirY = 0;
                dirX = playerTileX > npcTileX ? 1 : -1;
            }
            
            const altTileX = npcTileX + dirX;
            const altTileY = npcTileY + dirY;
            
            if (this._isValidTileMove(altTileX, altTileY, player, map)) {
                this.targetX = altTileX * 32;
                this.targetY = altTileY * 32;
                this.directionX = dirX;
                this.directionY = dirY;
                this.isMoving = true;
                this._updateDirection();
            }
        }
    }
    
    // Make NPC return to spawn position
    _returnToSpawn(map) {
        const currentTileX = Math.floor(this.x / 32);
        const currentTileY = Math.floor(this.y / 32);
        
        // Already at spawn position
        if (currentTileX === this.spawnTileX && currentTileY === this.spawnTileY) {
            return;
        }
        
        // Determine direction to move towards spawn
        let dirX = 0;
        let dirY = 0;
        
        // Move horizontally or vertically based on largest distance
        if (Math.abs(this.spawnTileX - currentTileX) > Math.abs(this.spawnTileY - currentTileY)) {
            // Move horizontally
            dirX = this.spawnTileX > currentTileX ? 1 : -1;
        } else {
            // Move vertically
            dirY = this.spawnTileY > currentTileY ? 1 : -1;
        }
        
        // Try to move in the chosen direction
        const newTileX = currentTileX + dirX;
        const newTileY = currentTileY + dirY;
        
        // Use null as player since we don't need to check player collision
        if (this._isValidTileMove(newTileX, newTileY, null, map)) {
            this.targetX = newTileX * 32;
            this.targetY = newTileY * 32;
            this.directionX = dirX;
            this.directionY = dirY;
            this.isMoving = true;
            this._updateDirection();
        } else {
            // If primary direction is blocked, try the other direction
            if (dirX !== 0) {
                dirX = 0;
                dirY = this.spawnTileY > currentTileY ? 1 : -1;
            } else {
                dirY = 0;
                dirX = this.spawnTileX > currentTileX ? 1 : -1;
            }
            
            const altTileX = currentTileX + dirX;
            const altTileY = currentTileY + dirY;
            
            if (this._isValidTileMove(altTileX, altTileY, null, map)) {
                this.targetX = altTileX * 32;
                this.targetY = altTileY * 32;
                this.directionX = dirX;
                this.directionY = dirY;
                this.isMoving = true;
                this._updateDirection();
            }
        }
    }

    _renderNPC(ctx, screenX, screenY) {
        // Basic NPC appearance with damage effect if damaged
        if (this.isDamaged) {
            // Flash red when damaged
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        } else {
            // Normal appearance
            ctx.fillStyle = SPRITES[this.name] || SPRITES.PLAYER.body;
            ctx.fillRect(screenX + 8, screenY + 8, 16, 20);
    
            ctx.fillStyle = SPRITES.PLAYER.skin;
            ctx.fillRect(screenX + 8, screenY + 4, 16, 16);
        }
        
        // Draw name above NPC
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, screenY - 5);
        
        // Draw health bar if enabled and not at full health
        if (this.showHealthBar && this.health < this.maxHealth) {
            this._renderHealthBar(ctx, screenX, screenY);
        }
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
        
        // Show health info in debug mode
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`HP: ${this.health}/${this.maxHealth}`, screenX + this.width / 2, screenY - 30);
        
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
            
            // Calculate target position on screen, pointing to center of the tile
            const targetScreenX = screenX + (this.targetX - this.x) + 16; // +16 to point to center
            const targetScreenY = screenY + (this.targetY - this.y) + 16; // +16 to point to center
            
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

        // Attempt a random movement in cardinal directions (up, down, left, right)
    _moveRandomly(player, map) {
        // Already moving or can't move
        if (this.isMoving || !this.canMove) return;
        
        // Get current tile position
        const currentTileX = Math.floor(this.x / 32);
        const currentTileY = Math.floor(this.y / 32);
        
        // Choose a random cardinal direction (up, down, left, right)
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
    
    // Draw health bar above the NPC
    _renderHealthBar(ctx, screenX, screenY) {
        const barX = screenX;
        const barY = screenY + this.healthBarYOffset;
        
        // Background (empty health)
        ctx.fillStyle = 'rgba(40, 40, 40, 0.7)';
        ctx.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight);
        
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        const currentHealthWidth = this.healthBarWidth * healthPercentage;
        
        // Determine color based on health percentage
        let healthColor;
        if (healthPercentage > 0.6) {
            healthColor = 'rgba(0, 200, 0, 0.8)'; // Green for high health
        } else if (healthPercentage > 0.3) {
            healthColor = 'rgba(200, 200, 0, 0.8)'; // Yellow for medium health
        } else {
            healthColor = 'rgba(200, 0, 0, 0.8)'; // Red for low health
        }
        
        // Draw filled health
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, currentHealthWidth, this.healthBarHeight);
    }
    
    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
    }
}
