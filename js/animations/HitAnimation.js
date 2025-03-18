/**
 * HitAnimation.js
 * Animation that displays a hit effect on an entity.
 */

import { Animation } from './Animation.js';

export class HitAnimation extends Animation {
    /**
     * @param {Object} config - Configuration for the hit animation
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'hit',
            duration: config.duration || 500
        });
        
        this.fistSize = config.fistSize || 12;
        this.fistColor = config.fistColor || 'rgba(255, 255, 255, 0.8)';
        this.randomDirection = config.randomDirection !== false;
        this.angle = config.angle || (Math.random() * Math.PI * 2);
    }
    
    /**
     * Starts the hit animation
     */
    showHitAnimation() {
        this.start();
    }

    /**
     * Renders the hit animation
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     */
    render(ctx, screenX, screenY, width, height) {
        const progress = this.getProgress();
        const centerX = screenX + width / 2;
        const centerY = screenY + height / 2;
        
        ctx.save();
        
        // Flash effect
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * progress})`;
        ctx.fillRect(screenX, screenY, width, height);
        
        if (this.randomDirection) {
            // Draw fist with impact lines
            const distance = width / 2 * (1 - progress);
            const fistX = centerX + Math.cos(this.angle) * distance;
            const fistY = centerY + Math.sin(this.angle) * distance;
            
            ctx.fillStyle = this.fistColor;
            ctx.beginPath();
            ctx.arc(fistX, fistY, this.fistSize * progress, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw impact lines
            ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
            ctx.lineWidth = 2;
            
            const impactLineLength = this.fistSize * 1.5 * progress;
            for (let i = 0; i < 5; i++) {
                const lineAngle = this.angle + (Math.PI / 4) * i;
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, screenY, width, height);
        }
        
        ctx.restore();
    }
}
