/**
 * Animation.js
 * Base class for all animations in the game.
 */

export class Animation {
    /**
     * @param {Object} config - Configuration for the animation
     */
    constructor(config = {}) {
        this.type = config.type || 'generic';
        this.startTime = Date.now();
        this.duration = config.duration || 500; // ms
        this.endTime = this.startTime + this.duration;
        this.entity = config.entity || null;
        this.id = `${this.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Updates the animation state
     * @returns {boolean} True if animation is still active, false if it has ended
     */
    update() {
        return Date.now() <= this.endTime;
    }

    /**
     * Calculates the current progress of the animation (0 to 1)
     * @returns {number} Progress value from 0 (start) to 1 (end)
     */
    getProgress() {
        const currentTime = Date.now();
        return Math.max(0, Math.min(1, 
            (this.endTime - currentTime) / this.duration
        ));
    }

    /**
     * Renders the animation on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     */
    render(ctx, screenX, screenY, width, height) {
        // Base implementation does nothing - to be overridden by subclasses
    }

    /**
     * Cancels the animation
     */
    cancel() {
        this.endTime = 0;
    }
    
    /**
     * Starts or restarts the animation
     */
    start() {
        this.startTime = Date.now();
        this.endTime = this.startTime + this.duration;
    }
}
