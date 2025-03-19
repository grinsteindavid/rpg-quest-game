/**
 * LevelUpAnimation.js
 * Animation that displays a level up effect on an entity.
 */

import { Animation } from './Animation.js';

export class LevelUpAnimation extends Animation {
    /**
     * @param {Object} config - Configuration for the level up animation
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'levelup',
            duration: config.duration || 2000
        });
        
        this.text = config.text || 'LEVEL UP!';
        this.primaryColor = config.primaryColor || 'rgba(255, 215, 0, 0.8)'; // Gold
        this.secondaryColor = config.secondaryColor || 'rgba(255, 255, 255, 0.6)'; // White
        this.fontSize = config.fontSize || 14;
        this.fontFamily = config.fontFamily || 'Arial';
        this.riseHeight = config.riseHeight || 40;
    }

    /**
     * Renders the level up animation
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} width - Width of the entity
     * @param {number} height - Height of the entity
     */
    render(ctx, screenX, screenY, width, height) {
        const progress = 1 - this.getProgress(); // Reverse progress for rise effect
        const centerX = screenX + width / 2;
        const textY = screenY - 10 - (this.riseHeight * progress);
        
        ctx.save();
        
        // Draw rising text
        ctx.textAlign = 'center';
        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        
        // Draw text shadow for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (0.8 - progress * 0.8) + ')';
        ctx.fillText(this.text, centerX + 2, textY + 2);
        
        // Draw main text with changing color
        const gradient = ctx.createLinearGradient(
            centerX - 40, textY - 10,
            centerX + 40, textY + 10
        );
        gradient.addColorStop(0, this.primaryColor);
        gradient.addColorStop(0.5, this.secondaryColor);
        gradient.addColorStop(1, this.primaryColor);
        
        ctx.fillStyle = gradient;
        ctx.fillText(this.text, centerX, textY);
        
        // Draw stars or sparkles around the entity
        this._drawSparkles(ctx, centerX, screenY + height / 2, width, height, progress);
        
        // Draw rising particles
        this._drawRisingParticles(ctx, centerX, screenY + height, width, progress);
        
        ctx.restore();
    }
    
    /**
     * Draw sparkles around the entity
     * @private
     */
    _drawSparkles(ctx, centerX, centerY, width, height, progress) {
        const radius = Math.max(width, height) * 0.7;
        const sparkleCount = 8;
        
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2 + (progress * Math.PI);
            const distance = radius * (0.6 + Math.sin(progress * Math.PI * 4) * 0.4);
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const size = 4 + Math.sin(progress * Math.PI * 8 + i) * 4;
            
            // Draw star
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const starAngle = (j / 5) * Math.PI * 2 - Math.PI / 2;
                const len = j % 2 === 0 ? size : size * 0.5;
                
                if (j === 0) {
                    ctx.moveTo(
                        x + Math.cos(starAngle) * len,
                        y + Math.sin(starAngle) * len
                    );
                } else {
                    ctx.lineTo(
                        x + Math.cos(starAngle) * len,
                        y + Math.sin(starAngle) * len
                    );
                }
            }
            ctx.closePath();
            
            // Fill with gradient
            const starGradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, size
            );
            starGradient.addColorStop(0, this.secondaryColor);
            starGradient.addColorStop(1, this.primaryColor);
            
            ctx.fillStyle = starGradient;
            ctx.fill();
        }
    }
    
    /**
     * Draw rising particles
     * @private
     */
    _drawRisingParticles(ctx, centerX, bottomY, width, progress) {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const seed = i / particleCount;
            const x = centerX + (Math.sin(seed * Math.PI * 4) * width * 0.6);
            const yOffset = progress * 80 * (seed + 0.5);
            const y = bottomY - yOffset;
            
            const alpha = Math.max(0, 1 - (yOffset / 80));
            const size = 3 * alpha;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
