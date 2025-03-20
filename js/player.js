import { SPRITES } from './colors.js';
import { PlayerCombat } from './combat/player.js';
import { MovementSystem } from './MovementSystem.js';

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
    /** @type {boolean} Whether the player is in a map transition */
    isTransitioning = false;
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
        // Initialize the combat system
        this.combat = new PlayerCombat(this);
        
        // Initialize the movement system
        this.movementSystem = new MovementSystem(this, {
            speed: this.speed,
            tileSize: this.tileSize,
            direction: this.direction
        });
        
        // Set initial target position
        this.targetX = x;
        this.targetY = y;
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
    attack(damage = 20, range = this.tileSize * 1) {
        return this.combat.attack(damage, range);
    }

    // _updateDirection method removed - now handled by movement.updateDirection

    // _faceTowardsTarget method removed - now handled by movement.faceTowardsTarget

    /**
     * Checks if a move to the specified tile coordinates is valid.
     * @param {number} tileX - Target tile X coordinate
     * @param {number} tileY - Target tile Y coordinate
     * @returns {boolean} Whether the move is valid
     * @private
     */
    _isValidMove(tileX, tileY) {
        // Use the movement system to check validity
        return this.movementSystem.isValidTileMove(tileX, tileY, this.map, null);
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

        // Calculate target tile position
        const currentTileX = Math.floor(this.x / this.tileSize);
        const currentTileY = Math.floor(this.y / this.tileSize);
        const targetTileX = currentTileX + dx;
        const targetTileY = currentTileY + dy;
        
        // Check for NPC collisions
        const npcs = this.map?.npcs || [];
        
        // Attempt to move using the movement system
        // Pass all NPCs to check for collisions
        const startedMoving = this.movementSystem.attemptMove(targetTileX, targetTileY, dx, dy, this.map, npcs);
        
        if (startedMoving) {
            this.isMoving = true;
            // Direction is automatically updated by the movement system
            this.direction = this.movementSystem.direction;
        }
    }

    /**
     * Handles the continuous movement animation between tiles.
     * @private
     */
    _handleMovementAnimation() {
        // Use movement system to handle animation
        const reachedTarget = this.movementSystem.handleMovementAnimation();
        
        if (reachedTarget) {
            // Ensure player state is synchronized with movement system
            this.isMoving = false;
            this._checkMapTransition();
        }
    }

    // _snapToTarget method removed - now handled by movementSystem.handleMovementAnimation

    /**
     * Checks if the player's current position triggers a map transition.
     * @private
     */
    _checkMapTransition() {
        // Don't check for transitions if we're already transitioning
        if (this.isTransitioning || (this.game._transition && this.game._transition.isActive())) {
            return;
        }
        
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

    // _moveTowardsTarget method removed - now handled by movementSystem.handleMovementAnimation

    /**
     * Processes keyboard input for player movement.
     * @private
     */
    _handleInput() {
        // Don't process movement input if dialog is active or player is in transition
        if (this.game._dialog.isActive() || this.isTransitioning) return;
        
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
            // Make sure direction is synchronized with movement system
            this.direction = this.movementSystem.direction;
        } else if (!this.isTransitioning) { // Only process input if not in transition
            this._handleInput();
        }
        
        // Handle attack with 'q' key - only if not in transition
        if (this.input.isPressed('q') && !this.isMoving && !this.game._dialog.isActive() && !this.isTransitioning) {
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
            this.combat.render(ctx, screenX, screenY);
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
     * Renders the hit animation effect on the player
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    _renderHitAnimation(ctx, screenX, screenY) {
        this.combat.renderHitAnimation(ctx, screenX, screenY, this.width, this.height);
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
