/**
 * CombatAnimations.js
 * Provides reusable combat animation effects for game entities.
 */

export class CombatAnimations {
    /**
     * Creates a new CombatAnimations instance.
     * @param {Object} config - Configuration for the animations
     */
    constructor(config = {}) {
        // Hit animation properties
        this.showingHitAnimation = false;
        this.hitAnimationDuration = config.hitAnimationDuration || 500; // milliseconds
        this.hitAnimationEndTime = 0;
        this.hitFistSize = config.hitFistSize || 12;
        this.hitFistColor = config.hitFistColor || 'rgba(255, 255, 255, 0.8)';
    }
    
    /**
     * Triggers the hit animation
     */
    showHitAnimation() {
        const currentTime = Date.now();
        this.showingHitAnimation = true;
        this.hitAnimationEndTime = currentTime + this.hitAnimationDuration;
    }
    
    /**
     * Updates the animation state
     */
    update() {
        // Check if hit animation should end
        if (this.showingHitAnimation && Date.now() > this.hitAnimationEndTime) {
            this.showingHitAnimation = false;
        }
    }
    
    /**
     * Renders a hit animation effect for an entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     * @param {boolean} [randomDirection=true] - Whether to use random hit direction or not
     */
    renderHitAnimation(ctx, screenX, screenY, width, height, randomDirection = true) {
        // Calculate animation progress (0 to 1)
        const currentTime = Date.now();
        const animationProgress = Math.max(0, Math.min(1, 
            (this.hitAnimationEndTime - currentTime) / this.hitAnimationDuration
        ));
        
        // We'll calculate center position for the entity
        const centerX = screenX + width / 2;
        const centerY = screenY + height / 2;
        
        ctx.save();
        
        // Flash the entity red when hit
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * animationProgress})`;
        ctx.fillRect(screenX, screenY, width, height);
        
        if (randomDirection) {
            // Make the fist appear from a random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = width / 2 * (1 - animationProgress);
            const fistX = centerX + Math.cos(angle) * distance;
            const fistY = centerY + Math.sin(angle) * distance;
            
            // Draw the fist (simple circle)
            ctx.fillStyle = this.hitFistColor;
            ctx.beginPath();
            ctx.arc(fistX, fistY, this.hitFistSize * animationProgress, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw impact lines
            ctx.strokeStyle = `rgba(255, 255, 255, ${animationProgress})`;
            ctx.lineWidth = 2;
            
            const impactLineLength = this.hitFistSize * 1.5 * animationProgress;
            for (let i = 0; i < 5; i++) {
                const lineAngle = angle + (Math.PI / 4) * i;
                ctx.beginPath();
                ctx.moveTo(fistX, fistY);
                ctx.lineTo(
                    fistX + Math.cos(lineAngle) * impactLineLength,
                    fistY + Math.sin(lineAngle) * impactLineLength
                );
                ctx.stroke();
            }
        } else {
            // Simpler hit effect with just a flash
            ctx.strokeStyle = `rgba(255, 255, 255, ${animationProgress})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, screenY, width, height);
        }
        
        ctx.restore();
    }
    
    /**
     * Render a simple damage number above an entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} amount - Damage amount to display
     */
    renderDamageNumber(ctx, screenX, screenY, width, amount) {
        // Implemented in future iteration if needed
    }
}
