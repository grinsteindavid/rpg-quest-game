/**
 * BuffAnimation.js
 * Animation that displays a buff/debuff effect on an entity.
 */

import { Animation } from './Animation.js';

export class BuffAnimation extends Animation {
    /**
     * @param {Object} config - Configuration for the buff animation
     */
    constructor(config = {}) {
        super({
            ...config,
            type: config.isDebuff ? 'debuff' : 'buff',
            duration: config.duration || 1000
        });
        
        this.isDebuff = config.isDebuff || false;
        this.color = config.color || (this.isDebuff ? 'rgba(255, 0, 255, 0.5)' : 'rgba(0, 255, 0, 0.5)');
        this.buffName = config.name || (this.isDebuff ? 'Debuff' : 'Buff');
        this.showText = config.showText !== false;
    }

    /**
     * Renders the buff/debuff animation
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
        
        if (this.isDebuff) {
            this.renderDebuff(ctx, screenX, screenY, width, height, centerX, centerY, progress);
        } else {
            this.renderBuff(ctx, screenX, screenY, width, height, centerX, centerY, progress);
        }
        
        // Show buff/debuff name if enabled
        if (this.showText) {
            ctx.textAlign = 'center';
            ctx.font = '10px Arial';
            // Using more intense colors for better visibility
            ctx.fillStyle = this.isDebuff ? 'rgba(255, 80, 0, ' + (1-progress) + ')' : 
                                          'rgba(255, 255, 50, ' + (1-progress) + ')';
            
            // Add shadow effect
            ctx.shadowColor = 'rgba(0, 0, 0, ' + (0.7 * (1-progress)) + ')';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            ctx.fillText(this.buffName, centerX, screenY - 5);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        ctx.restore();
    }
    
    /**
     * Renders a buff effect
     * @private
     */
    renderBuff(ctx, screenX, screenY, width, height, centerX, centerY, progress) {
        // Create a rising aura effect
        const radius = Math.max(width, height) * 0.6;
        const riseDistance = height * progress;
        
        ctx.globalAlpha = 0.7 * (1 - progress);
        ctx.fillStyle = this.color;
        
        for (let i = 0; i < 3; i++) {
            const offsetProgress = (progress + i * 0.2) % 1;
            const y = screenY + height - riseDistance * offsetProgress;
            
            // Draw rising particles
            ctx.beginPath();
            ctx.ellipse(centerX, y, width * 0.3, height * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Outer glow
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = (1 - progress) * 0.5;
        ctx.strokeRect(screenX - 2, screenY - 2, width + 4, height + 4);
    }
    
    /**
     * Renders a debuff effect
     * @private
     */
    renderDebuff(ctx, screenX, screenY, width, height, centerX, centerY, progress) {
        // Create a pulsing effect
        const pulseSize = 0.8 + Math.sin(progress * Math.PI * 4) * 0.2;
        const radius = Math.max(width, height) * 0.6 * pulseSize;
        
        ctx.globalAlpha = 0.5 * (1 - progress);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        
        // Draw rotating triangles
        for (let i = 0; i < 3; i++) {
            const angle = progress * Math.PI * 2 + (i * Math.PI * 2 / 3);
            
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * radius * 0.7,
                centerY + Math.sin(angle) * radius * 0.7
            );
            ctx.lineTo(
                centerX + Math.cos(angle + Math.PI * 2/3) * radius * 0.7,
                centerY + Math.sin(angle + Math.PI * 2/3) * radius * 0.7
            );
            ctx.lineTo(
                centerX + Math.cos(angle + Math.PI * 4/3) * radius * 0.7,
                centerY + Math.sin(angle + Math.PI * 4/3) * radius * 0.7
            );
            ctx.closePath();
            ctx.stroke();
        }
        
        // Inner dark glow
        ctx.fillStyle = `rgba(50, 0, 50, ${0.3 * (1 - progress)})`;
        ctx.fillRect(screenX, screenY, width, height);
    }
}
