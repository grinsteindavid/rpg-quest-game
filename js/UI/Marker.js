/**
 * Marker.js
 * A reusable floating marker UI component for indicating interactive NPCs or points of interest.
 */

export class Marker {
    /**
     * Creates a new Marker instance
     * @param {Object} config - Configuration for the marker
     * @param {boolean} [config.visible=true] - Whether the marker is visible
     * @param {number} [config.speed=0.1] - Animation speed of the marker
     * @param {string} [config.color='yellow'] - Color of the marker
     */
    constructor(config = {}) {
        this.visible = config.visible !== undefined ? config.visible : true;
        this.offset = 0;
        this.speed = config.speed || 0.1;
        this.time = 0;
        this.color = config.color || 'yellow';
        this.amplitude = config.amplitude || 4; // How much the marker moves up and down
    }
    
    /**
     * Renders the floating marker above an entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} [width=32] - Width of the entity (to center the marker)
     */
    render(ctx, screenX, screenY, width = 32) {
        if (!this.visible) return;
        
        // Update animation
        this.time += this.speed;
        this.offset = Math.sin(this.time) * this.amplitude;
        
        // Calculate center position for the entity
        const centerX = screenX + width / 2;
        
        // Draw the marker (triangle shape)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, screenY - 8 + this.offset);
        ctx.lineTo(centerX + 5, screenY - 18 + this.offset);
        ctx.lineTo(centerX - 5, screenY - 18 + this.offset);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Sets the visibility of the marker
     * @param {boolean} visible - Whether the marker should be visible
     */
    setVisible(visible) {
        this.visible = visible;
    }
    
    /**
     * Sets the color of the marker
     * @param {string} color - CSS color for the marker
     */
    setColor(color) {
        this.color = color;
    }
}
