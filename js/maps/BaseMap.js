import { COLORS, SPRITES } from '../colors.js';

/**
 * Base class for game maps providing common functionality for rendering and collision detection.
 * Implements basic map operations like tile checks, collision detection, and rendering.
 */
export class BaseMap {
    /**
     * Creates a new map instance.
     * @param {Object} config - Configuration options
     * @param {string} [config.name='Map'] - The display name of the map
     * @param {Game} [config.game=null] - The game instance this map belongs to
     * @param {Object} [config.colors=null] - Map colors (primary and pattern)
     */
    constructor(config = {}) {
        /** @type {string} The display name of the map */
        this.name = config.name || 'Map';
        
        /** @type {number} Size of each tile in pixels */
        this.tileSize = 32;
        
        /** @type {boolean} Debug mode flag */
        this.debug = false;
        
        /** @type {Array} Array of NPCs on this map */
        this.npcs = [];
        
        /** @type {Array} Array of visual effects on this map */
        this.effects = [];
        
        /** @type {Object} Map colors */
        this.mapColors = config.colors || {
            primary: COLORS.LIGHT,    // Default gray
            pattern: COLORS.WHITE     // Default light gray
        };

        /** @type {Array} Array representing the map data */
        this.mapData = [];
        
        /** @type {Game} Reference to the game instance */
        this.game = config.game || null;
    }

    /**
     * Gets the initial player position for this map.
     * @returns {{x: number, y: number}} The initial position in pixels
     */
    getInitialPlayerPosition() {
        return {
            x: 1 * this.tileSize,
            y: 1 * this.tileSize
        };
    }

    /**
     * Gets the map's color scheme.
     * @returns {{primary: string, pattern: string}} The color scheme
     */
    getColors() {
        return this.mapColors;
    }

    /**
     * Calculates the offset needed to center the map on the canvas.
     * @returns {{x: number, y: number}} The x and y offsets in pixels
     */
    getMapOffset() {
        return {
            x: (800 - this.mapData[0].length * this.tileSize) / 2,
            y: (600 - this.mapData.length * this.tileSize) / 2
        };
    }

    /**
     * Determines if a tile type represents a solid (non-walkable) tile.
     * @param {number} type - The tile type to check
     * @returns {boolean} True if the tile is solid
     */
    isSolidTile(type) {
        return type === 1;
    }

    /**
     * Determines if a tile type represents a walkable tile.
     * @param {number} type - The tile type to check
     * @returns {boolean} True if the tile is walkable
     */
    isWalkableTile(type) {
        return type === 0;
    }

    /**
     * Gets the tile type at the specified pixel coordinates.
     * @param {number} x - The x coordinate in pixels
     * @param {number} y - The y coordinate in pixels
     * @returns {number} The tile type at the specified location
     */
    getTileAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.mapData[0].length ||
            tileY < 0 || tileY >= this.mapData.length) {
            return 1;
        }
        
        return this.mapData[tileY][tileX];
    }

    /**
     * Sets the debug mode state.
     * @param {boolean} debug - The debug state to set
     */
    setDebug(debug) {
        this.debug = debug;
    }

    /**
     * Draws the map name at the top of the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawMapName(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, ctx.canvas.width / 2, 30);
        ctx.restore();
    }

    /**
     * Renders the complete map including background, tiles, exits, map name, and effects.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    render(ctx) {
        this.drawBackground(ctx);
        this.drawAllTiles(ctx);
        this.drawAllExits(ctx);
        this.drawMapName(ctx);

        // Render all NPCs if they exist
        if (this.npcs.length > 0) {
            const mapOffset = this.getMapOffset();
            this.npcs.forEach(npc => {
                npc.setDebug(this.debug);
                npc.render(ctx, mapOffset);
            });
        }
        
        // Render all active effects
        this.renderEffects(ctx);
    }

    /**
     * Fills the canvas with the background color.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawBackground(ctx) {
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    /**
     * Draws all tiles in the map based on the mapData array.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawAllTiles(ctx) {
        const offset = this.getMapOffset();
        
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const posX = x * this.tileSize + offset.x;
                const posY = y * this.tileSize + offset.y;
                const type = this.mapData[y][x];
                
                this.drawTile(ctx, type, posX, posY);
                
                if (this.debug) {
                    this.drawDebugTile(ctx, type, posX, posY);
                }
            }
        }
    }

    /**
     * Draws all map exits if transitions are defined.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawAllExits(ctx) {
        if (!this.transitions) return;

        const offset = this.getMapOffset();
        for (const [mapName, transitions] of Object.entries(this.transitions)) {
            for (const transition of transitions) {
                this.drawExit(ctx, mapName, transition, offset);
            }
        }
    }

    /**
     * Draws a single map exit with appropriate coloring and arrow indicators.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {string} mapName - Name of the destination map
     * @param {Object} transition - Transition data containing x and y coordinates
     * @param {{x: number, y: number}} offset - Map offset for centered rendering
     */
    drawExit(ctx, mapName, transition, offset) {
        let colors = { primary: '#666', pattern: '#999' }; // Default fallback colors
        
        // Get colors from the destination map if available via game instance
        if (this.game && this.game._maps && this.game._maps[mapName]) {
            colors = this.game._maps[mapName].getColors();
        }
        
        for (const x of transition.x) {
            const screenX = x * this.tileSize + offset.x;
            const screenY = transition.y * this.tileSize + offset.y;
            
            this.drawExitBase(ctx, screenX, screenY, colors.primary);
            this.drawExitArrow(ctx, screenX, screenY, transition.y, colors.pattern);
        }
    }

    /**
     * Draws the base rectangle for an exit tile.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - The x coordinate in pixels
     * @param {number} y - The y coordinate in pixels
     * @param {string} color - The fill color for the exit
     */
    drawExitBase(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    /**
     * Draws direction arrows on exit tiles.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - The x coordinate in pixels
     * @param {number} y - The y coordinate in pixels
     * @param {number} transitionY - The y position of the transition
     * @param {string} color - The arrow color
     */
    drawExitArrow(ctx, x, y, transitionY, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        const mid = this.tileSize / 2;
        const arrowSize = this.tileSize / 3;
        
        if (transitionY === 0) { // Top exit
            this.drawUpArrow(ctx, x, y, mid, arrowSize);
        } else if (transitionY === this.mapData.length - 1) { // Bottom exit
            this.drawDownArrow(ctx, x, y, mid, arrowSize);
        }
        
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws an upward pointing arrow for top exits.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - The x coordinate in pixels
     * @param {number} y - The y coordinate in pixels
     * @param {number} mid - Middle point of the tile
     * @param {number} arrowSize - Size of the arrow
     */
    drawUpArrow(ctx, x, y, mid, arrowSize) {
        ctx.moveTo(x + mid, y + arrowSize);
        ctx.lineTo(x + mid + arrowSize, y + this.tileSize - arrowSize);
        ctx.lineTo(x + mid - arrowSize, y + this.tileSize - arrowSize);
    }

    /**
     * Draws a downward pointing arrow for bottom exits.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - The x coordinate in pixels
     * @param {number} y - The y coordinate in pixels
     * @param {number} mid - Middle point of the tile
     * @param {number} arrowSize - Size of the arrow
     */
    drawDownArrow(ctx, x, y, mid, arrowSize) {
        ctx.moveTo(x + mid, y + this.tileSize - arrowSize);
        ctx.lineTo(x + mid + arrowSize, y + arrowSize);
        ctx.lineTo(x + mid - arrowSize, y + arrowSize);
    }

    /**
     * Draws a single tile with appropriate styling based on its type.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} type - The tile type to draw
     * @param {number} posX - The x coordinate in pixels
     * @param {number} posY - The y coordinate in pixels
     */
    drawTile(ctx, type, posX, posY) {
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        if (type === 1) {
            ctx.fillStyle = SPRITES.BUILDING;
            ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        }
    }

    /**
     * Draws debug information for a tile when debug mode is enabled.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} type - The tile type
     * @param {number} posX - The x coordinate in pixels
     * @param {number} posY - The y coordinate in pixels
     */
    drawDebugTile(ctx, type, posX, posY) {
        ctx.fillStyle = this.isSolidTile(type) ? 
            'rgba(255, 0, 0, 0.3)' : 
            'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        ctx.strokeStyle = this.isSolidTile(type) ? 'red' : 'green';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(type.toString(), posX + 4, posY + 12);
    }

    /**
     * Finds the nearest NPC within interaction range of the player
     * @param {Player} player - The player to check against
     * @returns {BaseNPC|undefined} The nearby NPC or undefined if none found
     */
    getNearbyNPC(player) {
        return this.npcs.find(npc => npc.isNearby(player));
    }
    
    /**
     * Updates all NPCs, effects, and other active entities on the map
     * @param {Player} player - The player entity for NPC interactions
     * @param {number} deltaTime - Time passed since last update in ms
     */
    update(player, deltaTime) {
        // Remove any defeated NPCs before updating
        this.removeDefeatedNPCs();
        
        // Update all remaining NPCs
        for (const npc of this.npcs) {
            if (typeof npc.update === 'function') {
                // Pass this map instance to the NPC for collision detection
                npc.update(player, deltaTime, this);
            }
        }
        
        // Update all active effects
        this.updateEffects(deltaTime);
    }

    /**
     * Removes all defeated NPCs from the map.
     */
    removeDefeatedNPCs() {
        this.npcs = this.npcs.filter(npc => !npc.isDefeated);
    }

    /**
     * Updates all active effects on the map.
     * @param {number} deltaTime - Time passed since last update in ms
     */
    updateEffects(deltaTime) {
        // Additional safety check for very large deltaTime values
        // This can happen when the tab becomes inactive and then active again
        const safeDeltaTime = Math.min(deltaTime || 16, 100);
        
        for (const effect of this.effects) {
            if (effect.enabled && typeof effect.update === 'function') {
                // Even though we've added protection in individual effects,
                // this provides an additional safeguard at the map level
                effect.update(safeDeltaTime, this);
            }
        }
    }
    
    /**
     * Renders all active effects on the map.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    renderEffects(ctx) {
        for (const effect of this.effects) {
            if (effect.enabled && typeof effect.render === 'function') {
                effect.render(ctx, this);
            }
        }
    }
    
    /**
     * Adds an effect to the map.
     * @param {BaseEffect} effect - The effect to add
     * @returns {BaseEffect} The added effect for chaining
     */
    addEffect(effect) {
        this.effects.push(effect);
        return effect;
    }
    
    /**
     * Removes an effect from the map.
     * @param {BaseEffect} effect - The effect to remove
     * @returns {boolean} True if the effect was removed, false otherwise
     */
    removeEffect(effect) {
        const index = this.effects.indexOf(effect);
        if (index !== -1) {
            this.effects.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Removes all effects from the map.
     */
    clearEffects() {
        this.effects = [];
    }
    
    /**
     * Gets an effect by name.
     * @param {string} name - The name of the effect to get
     * @returns {BaseEffect|undefined} The effect or undefined if not found
     */
    getEffectByName(name) {
        return this.effects.find(effect => effect.name === name);
    }
    
    /**
     * Enables or disables an effect by name.
     * @param {string} name - The name of the effect to toggle
     * @param {boolean} enabled - Whether to enable or disable the effect
     * @returns {boolean} True if the effect was found and toggled, false otherwise
     */
    toggleEffect(name, enabled) {
        const effect = this.getEffectByName(name);
        if (effect) {
            effect.setEnabled(enabled);
            return true;
        }
        return false;
    }
}
