import { BaseEffect } from './BaseEffect.js';

/**
 * Creates a rain effect that adds falling rain droplets to a map.
 */
export class RainEffect extends BaseEffect {
    /**
     * Creates a new rain effect instance.
     * @param {Object} config - Configuration options
     * @param {string} [config.name='Rain Effect'] - The name of the effect
     * @param {number} [config.opacity=0.7] - The opacity of the rain (0.0 to 1.0)
     * @param {string} [config.color='#CCCCFF'] - The color of the rain
     * @param {number} [config.speed=15] - The falling speed of the rain
     * @param {number} [config.angle=15] - The angle of the rainfall in degrees
     * @param {number} [config.density=0.4] - Density of the rain (0.1 to 1.0)
     * @param {boolean} [config.includeSound=true] - Whether to include rain sound
     */
    constructor(config = {}) {
        super({
            name: config.name || 'Rain Effect',
            opacity: config.opacity !== undefined ? config.opacity : 0.7,
            enabled: config.enabled !== undefined ? config.enabled : true
        });
        
        /** @type {string} The color of the rain */
        this.color = config.color || '#CCCCFF';
        
        /** @type {number} Falling speed of the rain */
        this.speed = config.speed !== undefined ? config.speed : 15;
        
        /** @type {number} The angle of the rain in degrees */
        this.angle = config.angle !== undefined ? config.angle : 15;
        
        /** @type {number} Density of the rain (controls number of drops) */
        this.density = Math.min(Math.max(config.density || 0.4, 0.1), 1.0);
        
        /** @type {boolean} Whether to include ambient rain sound */
        this.includeSound = config.includeSound !== undefined ? config.includeSound : true;
        
        /** @type {Array} Array of rain drop particles */
        this.drops = [];
        
        /** @private @type {boolean} Whether particles have been initialized */
        this._initialized = false;
        
        /** @private @type {number} Time accumulator for varying intensity */
        this._timeAccumulator = 0;
        
        /** @private @type {number} Current intensity multiplier */
        this._intensityMultiplier = 1.0;
    }
    
    /**
     * Initialize rain drops based on canvas dimensions.
     * @param {BaseMap} map - The map this effect is attached to
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    _initParticles(map, ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Calculate number of drops based on canvas size and density
        const dropCount = Math.floor((canvasWidth * canvasHeight) / 5000 * this.density * 20);
        
        this.drops = [];
        for (let i = 0; i < dropCount; i++) {
            this._addDrop(canvasWidth, canvasHeight, true);
        }
        
        this._initialized = true;
    }
    
    /**
     * Adds a new raindrop to the effect.
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @param {boolean} randomY - Whether to randomize Y position (for initialization)
     * @private
     */
    _addDrop(canvasWidth, canvasHeight, randomY = false) {
        // Calculate the horizontal offset based on the angle
        const angleRad = (this.angle * Math.PI) / 180;
        const horizontalOffset = canvasHeight * Math.tan(angleRad);
        
        this.drops.push({
            x: Math.random() * (canvasWidth + horizontalOffset) - horizontalOffset,
            y: randomY ? Math.random() * canvasHeight : -10 - Math.random() * 20, // Start above the canvas
            length: Math.random() * 10 + 10, // Length of the drop
            speed: (Math.random() * 0.5 + 0.75) * this.speed, // Slight speed variation
            thickness: Math.random() * 1.5 + 0.5 // Thickness of the drop
        });
    }
    
    /**
     * Updates the rain effect animation.
     * @param {number} deltaTime - Time passed since last update in ms
     * @param {BaseMap} map - The map this effect is attached to
     */
    update(deltaTime, map) {
        if (!this.enabled) return;
        
        // Update intensity variation over time
        this._timeAccumulator += deltaTime / 1000;
        // Create a slow pulsing intensity using a sine wave
        this._intensityMultiplier = 0.8 + 0.2 * Math.sin(this._timeAccumulator * 0.1);
        
        if (!this._initialized || !this.drops.length) return;
        
        const canvasWidth = map.game ? map.game._canvas.width : 800;
        const canvasHeight = map.game ? map.game._canvas.height : 600;
        const angleRad = (this.angle * Math.PI) / 180;
        
        // Update each drop's position
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            
            // Move the drop based on angle and speed
            drop.y += drop.speed * (deltaTime / 16); // Normalize for 60fps
            drop.x += Math.tan(angleRad) * drop.speed * (deltaTime / 16);
            
            // If the drop moves out of the canvas, reset it
            if (drop.y > canvasHeight || drop.x > canvasWidth || drop.x < -drop.length) {
                // Remove the drop and add a new one at the top
                this.drops.splice(i, 1);
                this._addDrop(canvasWidth, canvasHeight);
                i--; // Adjust index after splicing
            }
        }
    }
    
    /**
     * Renders the rain effect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {BaseMap} map - The map this effect is attached to
     */
    render(ctx, map) {
        if (!this.enabled) return;
        
        // Initialize particles if this is the first render
        if (!this._initialized) {
            this._initParticles(map, ctx);
        }
        
        ctx.save();
        
        // Set global opacity for the entire effect
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.color;
        
        // Draw each raindrop
        for (const drop of this.drops) {
            const startX = drop.x;
            const startY = drop.y;
            const endX = startX - Math.sin((this.angle * Math.PI) / 180) * drop.length;
            const endY = startY - Math.cos((this.angle * Math.PI) / 180) * drop.length;
            
            ctx.beginPath();
            ctx.lineWidth = drop.thickness;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Create a slight blue overlay for heavy rain effect
        ctx.fillStyle = 'rgba(0, 0, 50, 0.03)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.restore();
    }
    
    /**
     * Sets the density of the rain.
     * @param {number} density - The density value (0.1 to 1.0)
     */
    setDensity(density) {
        this.density = Math.min(Math.max(density, 0.1), 1.0);
        this._initialized = false; // Force re-initialization of particles
    }
    
    /**
     * Sets the speed of the rain.
     * @param {number} speed - The speed value
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * Sets the angle of the rainfall.
     * @param {number} angle - The angle in degrees
     */
    setAngle(angle) {
        this.angle = angle;
    }
    
    /**
     * Sets the color of the rain.
     * @param {string} color - The color value (CSS color string)
     */
    setColor(color) {
        this.color = color;
    }
}
