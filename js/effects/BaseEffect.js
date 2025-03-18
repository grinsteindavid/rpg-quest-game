/**
 * Base class for all visual effects that can be applied to maps.
 * Effects are rendered on top of the map and have their own update and render cycles.
 */
export class BaseEffect {
    /**
     * Creates a new effect instance.
     * @param {Object} config - Configuration options
     * @param {string} [config.name='Effect'] - The name of the effect
     * @param {number} [config.opacity=1.0] - The opacity of the effect (0.0 to 1.0)
     * @param {boolean} [config.enabled=true] - Whether the effect is enabled by default
     */
    constructor(config = {}) {
        /** @type {string} The display name of the effect */
        this.name = config.name || 'Effect';
        
        /** @type {number} The opacity of the effect */
        this.opacity = config.opacity !== undefined ? config.opacity : 1.0;
        
        /** @type {boolean} Whether the effect is currently enabled */
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        
        /** @type {boolean} Whether the effect should persist across map changes */
        this.persistent = config.persistent || false;
    }
    
    /**
     * Updates the effect state.
     * @param {number} deltaTime - Time passed since last update in ms
     * @param {BaseMap} map - The map this effect is attached to
     */
    update(deltaTime, map) {
        // Base implementation does nothing, to be overridden by subclasses
    }
    
    /**
     * Renders the effect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {BaseMap} map - The map this effect is attached to
     */
    render(ctx, map) {
        // Base implementation does nothing, to be overridden by subclasses
    }
    
    /**
     * Sets the enabled state of the effect.
     * @param {boolean} enabled - The enabled state to set
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Sets the opacity of the effect.
     * @param {number} opacity - The opacity value (0.0 to 1.0)
     */
    setOpacity(opacity) {
        this.opacity = Math.min(Math.max(opacity, 0), 1);
    }
    
    /**
     * Returns the current opacity of the effect.
     * @returns {number} The current opacity
     */
    getOpacity() {
        return this.opacity;
    }
}
