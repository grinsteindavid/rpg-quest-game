/**
 * DamageNumber.js
 * Animation that displays a floating damage number above an entity.
 */

import { Animation } from './Animation.js';

export class DamageNumberAnimation extends Animation {
    /**
     * @param {Object} config - Configuration for the damage number animation
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'damageNumber',
            duration: config.duration || 1000
        });
        
        this.value = config.value || 0;
        this.isCritical = config.isCritical || false;
        this.isHeal = config.isHeal || false;
        this.color = this.determineColor(config);
        this.fontSize = config.fontSize || (this.isCritical ? 16 : 12);
        this.offsetX = config.offsetX || (Math.random() * 20 - 10); // Random X offset
        this.initialY = config.initialY || 0;
        this.verticalSpeed = config.verticalSpeed || 1;
    }

    /**
     * Determines the color for the damage number based on its type
     * @param {Object} config - Configuration object
     * @returns {string} Color string
     */
    determineColor(config) {
        if (config.color) return config.color;
        if (this.isHeal) return 'rgba(0, 128, 0, 1)';
        if (this.isCritical) return 'rgba(255, 255, 0, 1)';
        return 'rgba(255, 255, 255, 1)';
    }

    /**
     * Renders the damage number animation
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     */
    render(ctx, screenX, screenY, width, height) {
        const progress = this.getProgress();
        const centerX = screenX + width / 2 + this.offsetX;
        
        // Calculate Y position with upward movement
        const floatDistance = 30 * (1 - progress) * this.verticalSpeed;
        const yPos = screenY - floatDistance - this.initialY;
        
        ctx.save();
        
        // Set text properties
        ctx.textAlign = 'center';
        const fontSizeWithEmphasis = this.fontSize * (this.isCritical ? (1.2 - 0.2 * progress) : 1);
        ctx.font = `bold ${fontSizeWithEmphasis}px Arial`;
        
        // Handle opacity fade out
        const alpha = Math.min(1, progress * 2); // Fade out in the second half of animation
        
        // Add text shadow/outline for critical hits
        if (this.isCritical) {
            ctx.fillStyle = 'rgba(255, 50, 50, ' + alpha + ')';
            ctx.fillText(this.value.toString(), centerX + 1, yPos + 1);
            
            // Pulsing effect for criticals
            const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
            ctx.scale(scale, scale);
        }
        
        // Draw the damage number
        const displayValue = this.isHeal ? '+' + this.value : this.value.toString();
        ctx.fillStyle = this.color.replace('1)', alpha + ')');
        ctx.fillText(displayValue, centerX, yPos);
        
        // For healing, add a small cross/plus symbol
        if (this.isHeal && progress > 0.5) {
            ctx.strokeStyle = 'rgba(100, 255, 100, ' + alpha + ')';
            ctx.lineWidth = 1;
            const symbolSize = 4;
            
            // Draw a plus symbol
            ctx.beginPath();
            ctx.moveTo(centerX - symbolSize, yPos + 10);
            ctx.lineTo(centerX + symbolSize, yPos + 10);
            ctx.moveTo(centerX, yPos + 10 - symbolSize);
            ctx.lineTo(centerX, yPos + 10 + symbolSize);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
