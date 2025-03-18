import { SPRITES } from './colors.js';

// Health bar colors
const HEALTH_BAR = {
    BACKGROUND: '#333333',
    BORDER: '#000000',
    FILL: '#44cc44',
    LOW: '#cc4444',
    CRITICAL: '#ff0000'
};

/**
 * Represents a player character in the game world.
 * Handles movement, collision detection, and rendering of the player sprite.
 */
export class Player {
    /** @type {number} Width of the player sprite in pixels */
    width = 32;
    /** @type {number} Height of the player sprite in pixels */
    height = 32;
    /** @type {number} Size of a single tile in pixels */
    tileSize = 32;
    /** @type {number} Movement speed in pixels per frame */
    speed = 2;
    /** 
     * @type {Object} Collision box dimensions
     * @property {number} width Width of the collision box
     * @property {number} height Height of the collision box
     */
    collision = {
        width: 28,
        height: 28
    };
    /** @type {boolean} Whether debug visualization is enabled */
    debug = false;
    /** @type {boolean} Whether this is the first spawn of the player */
    initialSpawn = true;
    /** @type {boolean} Whether the player is currently moving between tiles */
    isMoving = false;
    /** @type {'up'|'down'|'left'|'right'} Current facing direction of the player */
    direction = 'down';
    /** 
     * @type {Object} Offset for centering the map
     * @property {number} x Horizontal map offset
     * @property {number} y Vertical map offset
     */
    mapOffset = { x: 0, y: 0 };
    /** @type {Map|null} Reference to the current game map */
    map = null;
    /** @type {InputHandler|null} Reference to the input handling system */
    input = null;
    /** @type {Game|null} Reference to the main game instance */
    game = null;
    /** @type {number} Maximum health points of the player */
    maxHealth = 100;
    /** @type {number} Current health points of the player */
    currentHealth = 100;
    /** @type {boolean} Whether the player is currently invulnerable */
    isInvulnerable = false;
    /** @type {number} Duration of invulnerability in milliseconds after taking damage */
    invulnerabilityDuration = 1000;
    /** @type {number} Timestamp when invulnerability will end */
    invulnerabilityEndTime = 0;
    /** @type {boolean} Whether to show the health bar */
    showHealthBar = true;
    /** @type {number} Time in milliseconds to show health bar after taking damage */
    healthBarDisplayTime = 3000;
    /** @type {number} Timestamp when health bar should hide */
    healthBarHideTime = 0;
    /** @type {number} Cooldown duration between attacks in milliseconds */
    attackCooldown = 1000;
    /** @type {number} Timestamp when player can attack again */
    nextAttackTime = 0;

    /**
     * Creates a new Player instance.
     * @param {number} x - Initial x coordinate in pixels
     * @param {number} y - Initial y coordinate in pixels
     */
    constructor(x, y) {
        /** @type {number} Current x position in pixels */
        this.x = x;
        /** @type {number} Current y position in pixels */
        this.y = y;
        /** @type {number} Target x position for movement */
        this.targetX = x;
        /** @type {number} Target y position for movement */
        this.targetY = y;
        /** @type {number} Initialize health values */
        this.currentHealth = this.maxHealth;
        /** @type {number} Initialize health bar display */
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
        
        // Hit animation properties
        this.showingHitAnimation = false;
        this.hitAnimationDuration = 500; // milliseconds
        this.hitAnimationEndTime = 0;
    }

    /**
     * Sets the current map for the player and handles initial spawn positioning.
     * Also calculates map offset for centered rendering.
     * @param {Map} map - The map instance to set
     */
    setMap(map) {
        this.map = map;
        if (this.initialSpawn) {
            this._handleInitialSpawn();
        }
        this._calculateMapOffset();
    }

    /**
     * Handles the initial spawn of the player on the map.
     * Searches for the first walkable tile (type 0) and places the player there.
     * Sets initialSpawn to false after successful placement.
     * @private
     */
    _handleInitialSpawn() {
        for (let y = 0; y < this.map.mapData.length; y++) {
            for (let x = 0; x < this.map.mapData[y].length; x++) {
                if (this.map.mapData[y][x] === 0) {
                    this.x = x * this.map.tileSize;
                    this.y = y * this.map.tileSize;
                    this.initialSpawn = false;
                    break;
                }
            }
            if (!this.initialSpawn) break;
        }
    }

    /**
     * Calculates the offset required to center the map on screen.
     * Uses the map dimensions and canvas size (800x600) to determine offset.
     * Updates mapOffset.x and mapOffset.y with the calculated values.
     * @private
     */
    _calculateMapOffset() {
        this.mapOffset.x = (800 - this.map.mapData[0].length * this.map.tileSize) / 2;
        this.mapOffset.y = (600 - this.map.mapData.length * this.map.tileSize) / 2;
    }

    /**
     * Sets the input handler for player controls.
     * @param {InputHandler} input - The input handler instance
     */
    setInput(input) {
        this.input = input;
    }

    /**
     * Toggles debug visualization mode.
     * @param {boolean} debug - Whether debug mode should be enabled
     */
    setDebug(debug) {
        this.debug = debug;
    }

    /**
     * Sets the game instance reference.
     * @param {Game} game - The main game instance
     */
    setGame(game) {
        this.game = game;
    }

    /**
     * Attack nearby aggressive monsters.
     * @param {number} damage - Amount of damage to deal
     * @param {number} range - Range in pixels to detect monsters
     * @returns {boolean} - Whether any monsters were attacked
     */
    attack(damage = 20, range = 32) {
        // Check if attack is on cooldown
        const currentTime = Date.now();
        if (currentTime < this.nextAttackTime) {
            return false; // Still on cooldown
        }
        
        if (!this.map || !this.map.npcs) return false;
        
        let attackedAny = false;
        
        // Get player center position
        const playerCenterX = this.x + (this.width / 2);
        const playerCenterY = this.y + (this.height / 2);
        
        this.map.npcs.forEach(npc => {
            // Check if the NPC is a monster and can be aggressive
            if (!npc.canBeAggressive) return;
            
            // Get NPC center position
            const npcCenterX = npc.x + (npc.width / 2);
            const npcCenterY = npc.y + (npc.height / 2);
            
            // Calculate distance between player and NPC
            const dx = npcCenterX - playerCenterX;
            const dy = npcCenterY - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Attack if in range
            if (distance <= range) {
                // Update player's direction to face the monster
                this._faceTowardsTarget(dx, dy);
                
                // Deal damage to the NPC
                const isDefeated = npc.takeDamage(damage);
                attackedAny = true;
                
                // Trigger hit animation on the monster
                if (typeof npc.showHitAnimation === 'function') {
                    npc.showHitAnimation();
                }
                
                // If the NPC is defeated, mark it for removal
                if (isDefeated) {
                    npc.isDefeated = true;
                }
            }
        });
        
        // Set cooldown if attack was successful
        if (attackedAny) {
            this.nextAttackTime = currentTime + this.attackCooldown;
        }
        
        return attackedAny;
    }

    /**
     * Updates the player's facing direction based on movement input.
     * @param {number} dx - Horizontal movement direction (-1, 0, or 1)
     * @param {number} dy - Vertical movement direction (-1, 0, or 1)
     * @private
     */
    _updateDirection(dx, dy) {
        if (dx < 0) this.direction = 'left';
        else if (dx > 0) this.direction = 'right';
        else if (dy < 0) this.direction = 'up';
        else if (dy > 0) this.direction = 'down';
    }

    /**
     * Faces the player towards a target based on relative position
     * @param {number} dx - X distance to target (target.x - player.x)
     * @param {number} dy - Y distance to target (target.y - player.y)
     * @private
     */
    _faceTowardsTarget(dx, dy) {
        // Determine predominant direction (horizontal or vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal direction is predominant
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical direction is predominant
            this.direction = dy > 0 ? 'down' : 'up';
        }
    }

    /**
     * Checks if a move to the specified tile coordinates is valid.
     * @param {number} tileX - Target tile X coordinate
     * @param {number} tileY - Target tile Y coordinate
     * @returns {boolean} Whether the move is valid
     * @private
     */
    _isValidMove(tileX, tileY) {
        return tileX >= 0 && 
               tileX < this.map.mapData[0].length &&
               tileY >= 0 && 
               tileY < this.map.mapData.length &&
               this.map.isWalkableTile(this.map.mapData[tileY][tileX]);
    }

    /**
     * Handles player movement in the specified direction.
     * Checks for collisions and updates player position accordingly.
     * @param {number} dx - Horizontal movement direction (-1, 0, or 1)
     * @param {number} dy - Vertical movement direction (-1, 0, or 1)
     */
    move(dx, dy) {
        if (!this.map || this.isMoving) return;
        if (dx !== 0 && dy !== 0) return;

        this._updateDirection(dx, dy);

        const newX = this.x + (dx * this.tileSize);
        const newY = this.y + (dy * this.tileSize);
        const tileX = Math.floor(newX / this.tileSize);
        const tileY = Math.floor(newY / this.tileSize);

        if (this._isValidMove(tileX, tileY)) {
            this.targetX = tileX * this.tileSize;
            this.targetY = tileY * this.tileSize;
            this.isMoving = true;
        }
    }

    /**
     * Handles the continuous movement animation between tiles.
     * @private
     */
    _handleMovementAnimation() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this._snapToTarget();
            this._checkMapTransition();
        } else {
            this._moveTowardsTarget(dx, dy, distance);
        }
    }

    /**
     * Snaps the player to the target position when close enough.
     * @private
     */
    _snapToTarget() {
        this.x = this.targetX;
        this.y = this.targetY;
        this.isMoving = false;
    }

    /**
     * Checks if the player's current position triggers a map transition.
     * @private
     */
    _checkMapTransition() {
        const tileX = Math.floor((this.x + this.width/2) / this.tileSize);
        const tileY = Math.floor((this.y + this.height/2) / this.tileSize);
        
        for (const [mapName, transitions] of Object.entries(this.map.transitions)) {
            for (const transition of transitions) {
                if (transition.x.includes(tileX) && tileY === transition.y) {
                    this.game.changeMap(mapName, transition.destination);
                    break;
                }
            }
        }
    }

    /**
     * Moves the player towards their target position.
     * @param {number} dx - Distance to target X
     * @param {number} dy - Distance to target Y
     * @param {number} distance - Total distance to target
     * @private
     */
    _moveTowardsTarget(dx, dy, distance) {
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
    }

    /**
     * Processes keyboard input for player movement.
     * @private
     */
    _handleInput() {
        // Don't process movement input if dialog is active
        if (this.game._dialog.isActive()) return;
        
        if (this.input.isPressed('ArrowLeft') || this.input.isPressed('a')) {
            this.move(-1, 0);
        } else if (this.input.isPressed('ArrowRight') || this.input.isPressed('d')) {
            this.move(1, 0);
        } else if (this.input.isPressed('ArrowUp') || this.input.isPressed('w')) {
            this.move(0, -1);
        } else if (this.input.isPressed('ArrowDown') || this.input.isPressed('s')) {
            this.move(0, 1);
        } else if (this.input.isPressed('e')) {
            this._interact();
        }
    }

    _interact() {
        if (!this.map.getNearbyNPC) return;
        
        const nearbyNPC = this.map.getNearbyNPC(this);
        if (nearbyNPC) {
            nearbyNPC.interact(this);
        }
    }

    /**
     * Updates the player's state each frame.
     * Handles movement animation and input processing.
     */
    update() {
        if (!this.input) return;

        if (this.isMoving) {
            this._handleMovementAnimation();
        } else {
            this._handleInput();
        }
        
        // Handle attack with 'q' key
        if (this.input.isPressed('q') && !this.isMoving && !this.game._dialog.isActive()) {
            // Perform attack and show visual feedback if successful
            const didAttack = this.attack();
            if (didAttack) {
                console.log('Player attacked nearby monsters!');
                // Visual feedback could be added here in the future
            }
        }
        
        // Update invulnerability status
        if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) {
            this.isInvulnerable = false;
        }
        
        // Check if hit animation should end
        if (this.showingHitAnimation && Date.now() > this.hitAnimationEndTime) {
            this.showingHitAnimation = false;
        }
        
        // Update health bar visibility
        this.showHealthBar = this.currentHealth < this.maxHealth || Date.now() < this.healthBarHideTime;
    }

    /**
     * Renders the player sprite on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @private
     */
    _renderPlayer(ctx, screenX, screenY) {
        ctx.fillStyle = SPRITES.PLAYER.body;
        ctx.fillRect(screenX + 8, screenY + 8, 16, 20);

        ctx.fillStyle = SPRITES.PLAYER.skin;
        ctx.fillRect(screenX + 8, screenY + 4, 16, 16);

        // Enhanced hair styling
        ctx.fillStyle = SPRITES.PLAYER.hair;
        ctx.fillRect(screenX + 6, screenY + 4, 20, 4); // Top hair
        
        // Side hair based on direction
        if (this.direction !== 'right') {
            ctx.fillRect(screenX + 6, screenY + 8, 3, 6); // Left side hair
        }
        if (this.direction !== 'left') {
            ctx.fillRect(screenX + 23, screenY + 8, 3, 6); // Right side hair
        }

        // Only draw eyes if not facing up
        if (this.direction !== 'up') {
            // Left eye with direction offset
            const leftEyeOffset = this.direction === 'left' ? -2 : 0;
            ctx.fillStyle = '#000000'; // Black for eyes
            ctx.fillRect(screenX + 12 + leftEyeOffset, screenY + 10, 2, 2);
            
            // Right eye with direction offset
            const rightEyeOffset = this.direction === 'right' ? 2 : 0;
            ctx.fillRect(screenX + 18 + rightEyeOffset, screenY + 10, 2, 2);
        }
    }

    /**
     * Renders debug visualization for the player.
     * Shows collision box and direction indicator.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @private
     */
    _renderDebug(ctx, screenX, screenY) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, this.height);

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
        
        // Debug health info
        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`HP: ${this.currentHealth}/${this.maxHealth}`, screenX, screenY - 5);
    }

    /**
     * Renders the player character to the canvas.
     * Includes debug visualization when enabled.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        const mapOffset = this.map.getMapOffset();
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        // Flash player when invulnerable
        if (!this.isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
            this._renderPlayer(ctx, screenX, screenY);
            
            // Show hit animation if active
            if (this.showingHitAnimation) {
                this._renderHitAnimation(ctx, screenX, screenY);
            }
        }
        
        // Render health bar if needed
        if (this.showHealthBar) {
            this._renderHealthBar(ctx, screenX, screenY);
        }
        
        if (this.debug) {
            this._renderDebug(ctx, screenX, screenY);
        }
    }

    /**
     * Renders the health bar above the player
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @private
     */
    _renderHealthBar(ctx, screenX, screenY) {
        const barWidth = this.width;
        const barHeight = 5;
        const barX = screenX;
        const barY = screenY - 10;
        const healthPercentage = this.currentHealth / this.maxHealth;
        
        // Health bar background
        ctx.fillStyle = HEALTH_BAR.BACKGROUND;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill color based on health percentage
        if (healthPercentage <= 0.25) {
            ctx.fillStyle = HEALTH_BAR.CRITICAL;
        } else if (healthPercentage <= 0.5) {
            ctx.fillStyle = HEALTH_BAR.LOW;
        } else {
            ctx.fillStyle = HEALTH_BAR.FILL;
        }
        
        // Health bar fill
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Health bar border
        ctx.strokeStyle = HEALTH_BAR.BORDER;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Shows hit animation when player takes damage
     */
    showHitAnimation() {
        const currentTime = Date.now();
        this.showingHitAnimation = true;
        this.hitAnimationEndTime = currentTime + this.hitAnimationDuration;
    }
    
    /**
     * Renders the hit animation effect on the player
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    _renderHitAnimation(ctx, screenX, screenY) {
        // Calculate animation progress (0 to 1)
        const currentTime = Date.now();
        const animationProgress = Math.max(0, Math.min(1, (this.hitAnimationEndTime - currentTime) / this.hitAnimationDuration));
        
        // Flash the player red when hit
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 * animationProgress})`;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Draw a damage effect (simple white flash)
        ctx.strokeStyle = `rgba(255, 255, 255, ${animationProgress})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, this.width, this.height);
    }
    
    /**
     * Takes damage and reduces the player's health
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
        
        // Show hit animation
        this.showHitAnimation();
        
        // Make player invulnerable for a short time
        this.isInvulnerable = true;
        this.invulnerabilityEndTime = Date.now() + this.invulnerabilityDuration;
        
        // Game over if health reaches zero
        if (this.currentHealth <= 0) {
            this._handleGameOver();
        }
    }
    
    /**
     * Heals the player by increasing health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
    }
    
    /**
     * Resets the player's health to maximum
     */
    resetHealth() {
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false;
    }
    
    /**
     * Handles game over when player health reaches zero
     * @private
     */
    _handleGameOver() {
        // For now, just reset health - in a real game, you would
        // trigger game over screen or respawn logic here
        console.log('Game Over!');
        this.resetHealth();
        
        // If the game has a game over handler, call it
        if (this.game && typeof this.game.handleGameOver === 'function') {
            this.game.handleGameOver();
        }
    }
}
