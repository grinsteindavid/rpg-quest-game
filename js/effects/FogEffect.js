import { BaseEffect } from './BaseEffect.js';

/**
 * Creates a high-performance fog effect that adds ambient, moving fog to a map.
 * Optimized to use fewer, larger cloud-like particles for better performance.
 */
export class FogEffect extends BaseEffect {
    /**
     * Creates a new fog effect instance.
     * @param {Object} config - Configuration options
     * @param {string} [config.name='Fog Effect'] - The name of the effect
     * @param {number} [config.opacity=0.35] - The opacity of the fog (0.0 to 1.0)
     * @param {string} [config.color='#DDDDDD'] - The color of the fog
     * @param {number} [config.speed=0.2] - Movement speed of the fog
     * @param {number} [config.density=0.15] - Density of the fog (0.05 to 1.0)
     * @param {number} [config.cloudSize=1.5] - Relative size of cloud particles (1.0 is default)
     * @param {boolean} [config.animate=true] - Whether to animate fog particles
     */
    constructor(config = {}) {
        super({
            name: config.name || 'Fog Effect',
            opacity: config.opacity !== undefined ? config.opacity : 0.35,
            enabled: config.enabled !== undefined ? config.enabled : true
        });
        
        /** @type {string} The color of the fog */
        this.color = config.color || '#DDDDDD';
        
        /** @type {number} Movement speed of the fog */
        this.speed = config.speed !== undefined ? config.speed : 0.2;
        
        /** @type {number} Density of the fog (controls number of particles) - reduced default value */
        this.density = Math.min(Math.max(config.density || 0.15, 0.05), 1.0);
        
        /** @type {number} Size multiplier for cloud particles */
        this.cloudSize = config.cloudSize || 1.5;
        
        /** @type {boolean} Whether to animate fog particles */
        this.animate = config.animate !== undefined ? config.animate : true;
        
        /** @type {Array} Array of fog cloud particles */
        this.clouds = [];
        
        /** @private @type {boolean} Whether particles have been initialized */
        this._initialized = false;
        
        /** @private @type {number} Time accumulator for varying intensity */
        this._timeAccumulator = 0;
        
        /** @private @type {number} Current intensity multiplier */
        this._intensityMultiplier = 1.0;
        
        /** @private @type {number} Update throttling - only update every N frames */
        this._updateThrottle = 3;
        
        /** @private @type {number} Frame counter for update throttling */
        this._frameCounter = 0;
        
        /** @private @type {Object} Offscreen rendering cache */
        this._cloudCache = {};
        
        /** @private @type {CanvasGradient} Cached radial gradient */
        this._cachedGradient = null;
    }
    
    /**
     * Initialize fog clouds based on canvas dimensions.
     * Creates fewer, larger particles that cover more area for better performance.
     * @param {BaseMap} map - The map this effect is attached to
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @private
     */
    _initClouds(map, ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Calculate a reduced number of clouds based on canvas size and density
        // Fewer particles means better performance
        const cloudCount = Math.floor((canvasWidth * canvasHeight) / 50000 * this.density * 2);
        
        this.clouds = [];
        for (let i = 0; i < cloudCount; i++) {
            this._addCloud(canvasWidth, canvasHeight);
        }
        
        // Create and cache the cloud gradient for reuse
        this._createCloudGradient(ctx);
        
        this._initialized = true;
    }
    
    /**
     * Creates and caches a radial gradient for cloud rendering.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @private
     */
    _createCloudGradient(ctx) {
        // Create a radial gradient for the cloud shape
        const gradientRadius = 100 * this.cloudSize;
        const gradient = ctx.createRadialGradient(gradientRadius, gradientRadius, 0, 
                                                gradientRadius, gradientRadius, gradientRadius);
        
        // Create a soft cloud appearance with transparency at the edges
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.4, this._adjustColor(this.color, 0.9));
        gradient.addColorStop(0.7, this._adjustColor(this.color, 0.5));
        gradient.addColorStop(1, this._adjustColor(this.color, 0));
        
        this._cachedGradient = gradient;
    }
    
    /**
     * Adjusts a color's opacity for gradient effects.
     * @param {string} color - The base color
     * @param {number} opacity - Target opacity (0-1)
     * @returns {string} RGBA color string with adjusted opacity
     * @private
     */
    _adjustColor(color, opacity) {
        // Extract RGB components from hex color
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    /**
     * Adds a new cloud particle to the effect.
     * @param {number} canvasWidth - Width of the canvas
     * @param {number} canvasHeight - Height of the canvas
     * @private
     */
    _addCloud(canvasWidth, canvasHeight) {
        // Create larger, more varied clouds
        const sizeVariation = Math.random() * 0.5 + 0.75;
        const size = this.cloudSize * 100 * sizeVariation; // Base size * variation
        
        this.clouds.push({
            // Randomly position clouds across and above the canvas
            x: Math.random() * (canvasWidth + size * 2) - size,
            y: Math.random() * (canvasHeight + size * 2) - size,
            // Create variation in size
            size: size,
            // Create variation in opacity for depth effect
            opacity: Math.random() * 0.3 + 0.3,
            // Create variation in movement speed
            speedMultiplier: Math.random() * 0.5 + 0.75,
            // Create a slightly different shade for each cloud
            colorShift: Math.random() * 20 - 10
        });
    }
    
    /**
     * Updates the fog effect animation.
     * Optimized to update less frequently for better performance.
     * @param {number} deltaTime - Time passed since last update in ms
     * @param {BaseMap} map - The map this effect is attached to
     */
    update(deltaTime, map) {
        if (!this.enabled || !this.animate) return;
        
        // Performance optimization: only update every few frames
        this._frameCounter++;
        if (this._frameCounter % this._updateThrottle !== 0) return;
        
        // Update intensity variation over time
        this._timeAccumulator += deltaTime / 1000;
        // Create a very slow pulsing intensity using a sine wave
        this._intensityMultiplier = 0.9 + 0.1 * Math.sin(this._timeAccumulator * 0.03);
        
        if (!this._initialized || !this.clouds.length) return;
        
        const canvasWidth = map.game ? map.game._canvas.width : 800;
        const canvasHeight = map.game ? map.game._canvas.height : 600;
        
        // Update each cloud's position
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            
            // Move the cloud horizontally with the cloud's speed variation
            cloud.x += this.speed * cloud.speedMultiplier * (deltaTime / 16);
            
            // If the cloud moves out of the canvas, reset it on the other side
            if (cloud.x > canvasWidth + cloud.size) {
                cloud.x = -cloud.size * 2;
                cloud.y = Math.random() * (canvasHeight + cloud.size * 2) - cloud.size;
            }
        }
    }
    
    /**
     * Renders the fog effect with large, cloud-like particles.
     * Optimized for performance with cached rendering.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {BaseMap} map - The map this effect is attached to
     */
    render(ctx, map) {
        if (!this.enabled) return;
        
        // Initialize clouds if this is the first render
        if (!this._initialized) {
            this._initClouds(map, ctx);
        }
        
        ctx.save();
        
        // Set global alpha for the entire effect
        const effectiveOpacity = this.opacity * this._intensityMultiplier;
        ctx.globalAlpha = effectiveOpacity;
        ctx.globalCompositeOperation = 'lighter'; // Creates a more atmospheric effect
        
        // Render each cloud
        for (const cloud of this.clouds) {
            this._renderCloud(ctx, cloud);
        }
        
        ctx.restore();
    }
    
    /**
     * Render an individual cloud using the cached gradient.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Object} cloud - The cloud particle to render
     * @private
     */
    _renderCloud(ctx, cloud) {
        ctx.save();
        
        // Apply cloud-specific opacity for depth effect
        ctx.globalAlpha *= cloud.opacity;
        
        // Draw the cloud using the cached gradient
        ctx.fillStyle = this._cachedGradient;
        
        // Scale the context to the cloud's size
        const scale = cloud.size / (100 * this.cloudSize);
        ctx.translate(cloud.x, cloud.y);
        ctx.scale(scale, scale);
        
        // Draw a circle with the gradient fill
        ctx.beginPath();
        ctx.arc(100 * this.cloudSize, 100 * this.cloudSize, 100 * this.cloudSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Sets the density of the fog.
     * @param {number} density - The density value (0.05 to 1.0)
     */
    setDensity(density) {
        this.density = Math.min(Math.max(density, 0.05), 1.0);
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
        if (this._initialized) {
            this._createCloudGradient(this._lastContext);
        }
    }
    
    /**
     * Sets the cloud size multiplier.
     * @param {number} size - The size multiplier (0.5 to 3.0 recommended)
     */
    setCloudSize(size) {
        this.cloudSize = Math.max(size, 0.5);
        this._initialized = false; // Force re-initialization of particles
    }
}