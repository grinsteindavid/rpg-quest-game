import { BaseEffect } from './BaseEffect.js';

/**
 * Creates a fog effect that adds an ambient, moving fog to a map.
 */
export class FogEffect extends BaseEffect {
    /**
     * Creates a new fog effect instance.
     * @param {Object} config - Configuration options
     * @param {string} [config.name='Fog Effect'] - The name of the effect
     * @param {number} [config.opacity=0.4] - The opacity of the fog (0.0 to 1.0)
     * @param {string} [config.color='#CCCCCC'] - The color of the fog
     * @param {number} [config.speed=0.3] - Movement speed of the fog
     * @param {number} [config.density=0.5] - Density of the fog (0.1 to 1.0)
     */
    constructor(config = {}) {
        super({
            name: config.name || 'Fog Effect',
            opacity: config.opacity !== undefined ? config.opacity : 0.4,
            enabled: config.enabled !== undefined ? config.enabled : true
        });
        
        /** @type {string} The color of the fog */
        this.color = config.color || '#CCCCCC';
        
        /** @type {number} Movement speed of the fog */
        this.speed = config.speed !== undefined ? config.speed : 0.3;
        
        /** @type {number} Density of the fog (controls number of particles) */
        this.density = Math.min(Math.max(config.density || 0.5, 0.1), 1.0);
        
        /** @type {Array} Array of fog particles */
        this.particles = [];
        
        /** @type {number} X-offset for fog movement */
        this.offsetX = 0;
        
        /** @private @type {boolean} Whether particles have been initialized */
        this._initialized = false;
    }
    
    /**
     * Initialize fog particles based on map dimensions.
     * @param {BaseMap} map - The map this effect is attached to
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    _initParticles(map, ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Calculate number of particles based on canvas size and density
        const particleCount = Math.floor((canvasWidth * canvasHeight) / 10000 * this.density * 20);
        
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: Math.random() * 20 + 10,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
        
        this._initialized = true;
    }
    
    /**
     * Updates the fog effect animation.
     * @param {number} deltaTime - Time passed since last update in ms
     * @param {BaseMap} map - The map this effect is attached to
     */
    update(deltaTime, map) {
        if (!this.enabled) return;
        
        // Update fog movement
        this.offsetX += this.speed * (deltaTime / 1000);
        
        // Loop offsetX to prevent values becoming too large over time
        if (this.offsetX > 1000) this.offsetX -= 1000;
    }
    
    /**
     * Renders the fog effect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {BaseMap} map - The map this effect is attached to
     */
    render(ctx, map) {
        if (!this.enabled) return;
        
        // Initialize particles if this is the first render
        if (!this._initialized) {
            this._initParticles(map, ctx);
        }
        
        const canvasWidth = ctx.canvas.width;
        
        ctx.save();
        
        // Set global opacity for the entire effect
        ctx.globalAlpha = this.opacity;
        
        // Draw each fog particle
        for (const particle of this.particles) {
            const x = (particle.x + this.offsetX) % canvasWidth;
            
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                x, particle.y, 0,
                x, particle.y, particle.radius
            );
            
            gradient.addColorStop(0, `${this.color}`);
            gradient.addColorStop(1, `${this.color}00`);
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.opacity * particle.alpha;
            ctx.arc(x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Sets the density of the fog.
     * @param {number} density - The density value (0.1 to 1.0)
     */
    setDensity(density) {
        this.density = Math.min(Math.max(density, 0.1), 1.0);
        this._initialized = false; // Force re-initialization of particles
    }
    
    /**
     * Sets the speed of the fog movement.
     * @param {number} speed - The speed value
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * Sets the color of the fog.
     * @param {string} color - The color value (CSS color string)
     */
    setColor(color) {
        this.color = color;
    }
}
