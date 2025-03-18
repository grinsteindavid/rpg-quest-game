/**
 * HealthBar.js
 * A reusable health bar UI component for entities like players and NPCs.
 */

export class HealthBar {
    /**
     * Creates a new HealthBar instance.
     * @param {Object} config - Configuration for the health bar
     * @param {number} [config.width=32] - Width of the health bar
     * @param {number} [config.height=4] - Height of the health bar
     * @param {number} [config.yOffset=-10] - Y offset relative to the entity
     * @param {Object} [config.colors] - Colors for different parts of the health bar
     */
    constructor(config = {}) {
        this.width = config.width || 32;
        this.height = config.height || 4;
        this.yOffset = config.yOffset || -10;
        
        // Default colors for health bar
        this.colors = {
            background: config.colors?.background || 'rgba(40, 40, 40, 0.8)',
            border: config.colors?.border || 'rgba(0, 0, 0, 0.8)',
            fill: config.colors?.fill || 'rgba(0, 200, 0, 0.8)',
            low: config.colors?.low || 'rgba(200, 200, 0, 0.8)',
            critical: config.colors?.critical || 'rgba(200, 0, 0, 0.8)'
        };
        
        // Thresholds for color changes
        this.criticalThreshold = config.criticalThreshold || 0.3;
        this.lowThreshold = config.lowThreshold || 0.6;
    }
    
    /**
     * Renders a health bar for an entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     * @param {number} currentHealth - Current health value
     * @param {number} maxHealth - Maximum health value
     * @param {number} [width] - Optional width override for the health bar
     */
    render(ctx, screenX, screenY, currentHealth, maxHealth, width) {
        const barWidth = width || this.width;
        const barHeight = this.height;
        const barX = screenX;
        const barY = screenY + this.yOffset;
        
        // Draw border first (slightly larger than the health bar)
        ctx.fillStyle = this.colors.border;
        ctx.fillRect(
            barX - 1, 
            barY - 1, 
            barWidth + 2, 
            barHeight + 2
        );
        
        // Background (empty health)
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate health percentage
        const healthPercentage = currentHealth / maxHealth;
        const currentHealthWidth = barWidth * healthPercentage;
        
        // Determine color based on health percentage
        let healthColor;
        if (healthPercentage <= this.criticalThreshold) {
            healthColor = this.colors.critical;
        } else if (healthPercentage <= this.lowThreshold) {
            healthColor = this.colors.low;
        } else {
            healthColor = this.colors.fill;
        }
        
        // Draw filled health
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, currentHealthWidth, barHeight);
    }
}
