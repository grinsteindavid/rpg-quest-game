/**
 * SkillAnimation.js
 * Animation that displays a skill effect on an entity.
 */

import { Animation } from './Animation.js';

export class SkillAnimation extends Animation {
    /**
     * @param {Object} config - Configuration for the skill animation
     */
    constructor(config = {}) {
        super({
            ...config,
            type: 'skill',
            duration: config.duration || 800
        });
        
        this.color = config.color || 'rgba(0, 255, 255, 0.7)';
        this.skillName = config.skillName || 'generic';
    }

    /**
     * Renders the skill animation
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
        
        // Create a glowing aura effect
        const radius = Math.max(width, height) * (0.5 + progress * 0.5);
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalAlpha = 0.7 * (1 - progress);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some particle effects
        ctx.fillStyle = this.color;
        const numParticles = 8;
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const particleDistance = radius * 0.7 * progress;
            const particleX = centerX + Math.cos(angle) * particleDistance;
            const particleY = centerY + Math.sin(angle) * particleDistance;
            const particleSize = 4 * (1 - progress);
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Display skill name if provided
        if (this.skillName !== 'generic') {
            ctx.textAlign = 'center';
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 1 - progress;
            ctx.fillText(this.skillName, centerX, screenY - 10);
        }
        
        ctx.restore();
    }
}
