import { SPRITES } from './colors.js';
import { PlayerCombat } from './combat/player.js';

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
    /** @type {PlayerCombat} The player's combat system */
    combat = null;

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
        // Initialize the combat system
        this.combat = new PlayerCombat(this);
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
        return this.combat.attack(damage, range);
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
        // First check if the tile is within map boundaries and is a walkable tile type
        const isWalkableTile = tileX >= 0 && 
               tileX < this.map.mapData[0].length &&
               tileY >= 0 && 
               tileY < this.map.mapData.length &&
               this.map.isWalkableTile(this.map.mapData[tileY][tileX]);
        
        // If the tile is not walkable, return false immediately
        if (!isWalkableTile) return false;
        
        // Check if any NPC with canMoveThruWalls=false is at this position
        if (this.map.npcs) {
            for (const npc of this.map.npcs) {
                // Skip NPCs that can be walked through
                if (npc.canMoveThruWalls) continue;
                
                // Handle both current position and target position (for moving NPCs)
                // Check current position
                const npcTileX = Math.floor(npc.x / this.tileSize);
                const npcTileY = Math.floor(npc.y / this.tileSize);
                
                // Check target position (if NPC is moving)
                const npcTargetTileX = npc.isMoving ? Math.floor(npc.targetX / this.tileSize) : npcTileX;
                const npcTargetTileY = npc.isMoving ? Math.floor(npc.targetY / this.tileSize) : npcTileY;
                
                // Check if either current position or target position matches player's target
                if ((npcTileX === tileX && npcTileY === tileY) || 
                    (npcTargetTileX === tileX && npcTargetTileY === tileY)) {
                    // NPC is blocking the way (either at current position or will be at target)
                    return false;
                }
            }
        }
        
        // No blocking NPCs found, position is valid
        return true;
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
        
        // Update combat system
        this.combat.update();
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
        ctx.fillText(`HP: ${this.combat.currentHealth}/${this.combat.maxHealth}`, screenX, screenY - 5);
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

        // Flash player when invulnerable using combat system logic
        if (this.combat.shouldRenderPlayer()) {
            this._renderPlayer(ctx, screenX, screenY);
            
            // Show hit animation if active
            if (this.combat.showingHitAnimation) {
                this.combat.renderHitAnimation(ctx, screenX, screenY, this.width, this.height);
            }
        }
        
        // Render health bar if needed
        if (this.combat.showHealthBar) {
            this.combat.renderHealthBar(ctx, screenX, screenY, this.width);
        }
        
        if (this.debug) {
            this._renderDebug(ctx, screenX, screenY);
        }
    }

    /**
     * Shows hit animation when player takes damage
     */
    showHitAnimation() {
        this.combat.showHitAnimation();
    }
    
    /**
     * Takes damage and reduces the player's health
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        this.combat.takeDamage(amount);
    }
    
    /**
     * Heals the player by increasing health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.combat.heal(amount);
    }
    
    /**
     * Resets the player's health to maximum
     */
    resetHealth() {
        this.combat.resetHealth();
    }
}
