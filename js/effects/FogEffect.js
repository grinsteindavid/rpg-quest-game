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
     * @param {number} [config.verticalSpeed=0.1] - Vertical movement speed of the fog
     * @param {boolean} [config.animate=true] - Whether to animate fog particles
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
        
        /** @type {number} Vertical movement speed of the fog */
        this.verticalSpeed = config.verticalSpeed !== undefined ? config.verticalSpeed : 0.1;
        
        /** @type {number} Density of the fog (controls number of particles) */
        this.density = Math.min(Math.max(config.density || 0.5, 0.1), 1.0);
        
        /** @type {boolean} Whether to animate fog particles */
        this.animate = config.animate !== undefined ? config.animate : true;
        
        /** @type {Array} Array of fog particles */
        this.particles = [];
        
        /** @type {number} X-offset for fog movement */
        this.offsetX = 0;
        
        /** @private @type {boolean} Whether particles have been initialized */
        this._initialized = false;
        
        /** @private @type {number} Time accumulator for varying intensity */
        this._timeAccumulator = 0;
        
        /** @private @type {number} Current intensity multiplier */
        this._intensityMultiplier = 1.0;
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
            this._addFogParticle(canvasWidth, canvasHeight, true);
        }
        
        this._initialized = true;
    }
    
    /**
     * Adds a new fog particle to the effect.
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @param {boolean} randomPosition - Whether to randomize position (for initialization)
     * @private
     */
    _addFogParticle(canvasWidth, canvasHeight, randomPosition = false) {
        this.particles.push({
            x: Math.random() * canvasWidth,
            y: randomPosition ? Math.random() * canvasHeight : Math.random() < 0.5 ? -30 : canvasHeight + 30,
            radius: Math.random() * 20 + 10,
            alpha: Math.random() * 0.5 + 0.2,
            speedModifier: Math.random() * 0.4 + 0.8, // Individual speed variation
            fadeDirection: Math.random() < 0.5 ? 1 : -1, // Whether particle is fading in or out
            fadeSpeed: Math.random() * 0.02 + 0.01, // Speed of fade effect
            growDirection: Math.random() < 0.5 ? 1 : -1, // Whether particle is growing or shrinking
            growSpeed: Math.random() * 0.05 + 0.02, // Speed of size change
            verticalDirection: Math.random() < 0.5 ? 1 : -1 // Direction of vertical movement
        });
    }
    
    /**
     * Updates the fog effect animation.
     * @param {number} deltaTime - Time passed since last update in ms
     * @param {BaseMap} map - The map this effect is attached to
     */
    update(deltaTime, map) {
        if (!this.enabled) return;
        
        // Update time-based effects
        this._timeAccumulator += deltaTime / 1000;
        // Create a slow pulsing intensity using a sine wave
        this._intensityMultiplier = 0.9 + 0.1 * Math.sin(this._timeAccumulator * 0.2);
        
        // Update fog horizontal movement
        this.offsetX += this.speed * (deltaTime / 1000);
        
        // Loop offsetX to prevent values becoming too large over time
        if (this.offsetX > 1000) this.offsetX -= 1000;
        
        if (!this._initialized || !this.particles.length || !this.animate) return;
        
        const canvasWidth = map.game ? map.game._canvas.width : 800;
        const canvasHeight = map.game ? map.game._canvas.height : 600;
        
        // Update each fog particle
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Move the particle
            particle.x += this.speed * particle.speedModifier * (deltaTime / 16);
            particle.y += this.verticalSpeed * particle.verticalDirection * particle.speedModifier * (deltaTime / 16);
            
            // Animate alpha (fading in/out)
            particle.alpha += particle.fadeDirection * particle.fadeSpeed * (deltaTime / 16);
            if (particle.alpha > 0.7) {
                particle.fadeDirection = -1;
            } else if (particle.alpha < 0.2) {
                particle.fadeDirection = 1;
            }
            
            // Animate size (growing/shrinking)
            particle.radius += particle.growDirection * particle.growSpeed * (deltaTime / 16);
            if (particle.radius > 30) {
                particle.growDirection = -1;
            } else if (particle.radius < 10) {
                particle.growDirection = 1;
            }
            
            // If the particle moves out of the canvas, recycle it
            if (particle.x > canvasWidth + particle.radius || 
                particle.y > canvasHeight + particle.radius || 
                particle.y < -particle.radius) {
                // Remove the particle and add a new one
                this.particles.splice(i, 1);
                this._addFogParticle(canvasWidth, canvasHeight);
                i--; // Adjust index after splicing
            }
        }
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
        
        // Set global opacity for the entire effect, modulated by intensity multiplier
        ctx.globalAlpha = this.opacity * this._intensityMultiplier;
        
        // Draw each fog particle
        for (const particle of this.particles) {
            // Handle wrapping around the canvas
            let x = particle.x;
            if (this.animate) {
                x = (particle.x + this.offsetX) % canvasWidth;
                // Wrap around negative positions too
                if (x < -particle.radius) x += canvasWidth + particle.radius * 2;
            } else {
                x = (particle.x + this.offsetX) % canvasWidth;
            }
            
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(
                x, particle.y, 0,
                x, particle.y, particle.radius
            );
            
            gradient.addColorStop(0, `${this.color}`);
            gradient.addColorStop(1, `${this.color}00`);
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.opacity * particle.alpha * this._intensityMultiplier;
            ctx.arc(x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add a very subtle overlay for fog atmosphere
        ctx.fillStyle = `rgba(${this.color.slice(1, 3)}, ${this.color.slice(3, 5)}, ${this.color.slice(5, 7)}, 0.02)`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
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
     * Sets the vertical speed of the fog movement.
     * @param {number} speed - The vertical speed value
     */
    setVerticalSpeed(speed) {
        this.verticalSpeed = speed;
    }
    
    /**
     * Enables or disables fog particle animation.
     * @param {boolean} enable - Whether to enable animation
     */
    setAnimation(enable) {
        this.animate = enable;
    }
    
    /**
     * Sets the color of the fog.
     * @param {string} color - The color value (CSS color string)
     */
    setColor(color) {
        this.color = color;
    }
}
