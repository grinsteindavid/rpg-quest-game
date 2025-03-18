/**
 * CombatSystem.js
 * Handles all combat-related functionality for NPCs and potentially other game entities
 */

export class CombatSystem {
    constructor(entity) {
        // Reference to the entity (NPC) that owns this combat system
        this.entity = entity;
        
        // Health properties
        this.maxHealth = 100; // Default maximum health
        this.health = this.maxHealth; // Current health
        this.showHealthBar = true; // Whether to display the health bar
        this.healthBarWidth = 32; // Width of health bar (same as entity width)
        this.healthBarHeight = 4; // Height of health bar
        this.healthBarYOffset = -10; // Position above the entity
        this.isDamaged = false; // Flag for damage visual effect
        this.damageEffectDuration = 20; // Frames to show damage effect
        this.damageEffectTimer = 0; // Timer for damage effect
        
        // Attack properties
        this.attackDamage = 10;
        this.attackRange = 40; // Slightly larger than player's attack range
        this.attackCooldown = 1500; // Milliseconds between attacks
        this.nextAttackTime = 0; // Timestamp when the entity can attack again
        
        // Hit animation properties
        this.showingHitAnimation = false;
        this.hitAnimationDuration = 500; // milliseconds
        this.hitAnimationEndTime = 0;
        this.hitFistSize = 12;
        this.hitFistColor = 'rgba(255, 255, 255, 0.8)';
        
        // Health bar styling
        this.healthBarColors = {
            background: 'rgba(40, 40, 40, 0.8)',
            border: 'rgba(0, 0, 0, 0.8)',
            fill: 'rgba(200, 0, 0, 0.9)',
            critical: 'rgba(255, 50, 50, 1.0)'
        };
    }
    
    /**
     * Update combat-related systems
     * @param {Object} player - The player object
     */
    update(player) {
        // Update damage effect timer if active
        if (this.isDamaged) {
            this.damageEffectTimer--;
            if (this.damageEffectTimer <= 0) {
                this.isDamaged = false;
            }
        }
        
        // Check if hit animation should end
        const currentTime = Date.now();
        if (this.showingHitAnimation) {
            if (currentTime >= this.hitAnimationEndTime) {
                this.showingHitAnimation = false;
            }
        }
        
        // Check if the entity should attack the player
        if (this.entity.isAggressive && player && currentTime >= this.nextAttackTime) {
            if (this.isPlayerInAttackRange(player)) {
                this.attackPlayer(player);
            }
        }
    }
    
    /**
     * Check if player is in attack range
     * @param {Object} player - The player object
     * @returns {boolean} - Whether player is in attack range
     */
    isPlayerInAttackRange(player) {
        // Calculate distance between entity and player
        const entityCenterX = this.entity.x + (this.entity.width / 2);
        const entityCenterY = this.entity.y + (this.entity.height / 2);
        const playerCenterX = player.x + (player.width / 2);
        const playerCenterY = player.y + (player.height / 2);
        
        const dx = playerCenterX - entityCenterX;
        const dy = playerCenterY - entityCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.attackRange;
    }
    
    /**
     * Attack the player if in range
     * @param {Object} player - The player to attack
     * @returns {boolean} - Whether the player was attacked
     */
    attackPlayer(player) {
        const currentTime = Date.now();
        
        // Calculate distance between entity and player
        const entityCenterX = this.entity.x + (this.entity.width / 2);
        const entityCenterY = this.entity.y + (this.entity.height / 2);
        const playerCenterX = player.x + (player.width / 2);
        const playerCenterY = player.y + (player.height / 2);
        
        const dx = playerCenterX - entityCenterX;
        const dy = playerCenterY - entityCenterY;
        
        // Attack if player is in range
        if (this.isPlayerInAttackRange(player)) {
            // Face towards the player before attacking
            this._faceTowardsTarget(dx, dy);
            
            // Deal damage to the player
            player.takeDamage(this.attackDamage);
            
            // Set cooldown for next attack
            this.nextAttackTime = currentTime + this.attackCooldown;
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Faces the entity towards a target based on relative position
     * @param {number} dx - X distance to target (target.x - entity.x)
     * @param {number} dy - Y distance to target (target.y - entity.y)
     * @private
     */
    _faceTowardsTarget(dx, dy) {
        // Determine predominant direction (horizontal or vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal direction is predominant
            this.entity.direction = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical direction is predominant
            this.entity.direction = dy > 0 ? 'down' : 'up';
        }
    }
    
    /**
     * Take damage from player or other sources
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the entity was defeated
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.isDamaged = true;
        this.damageEffectTimer = this.damageEffectDuration;
        
        // Always trigger the hit animation when taking damage
        this.showHitAnimation();
        
        // Check if entity is defeated
        if (this.health <= 0) {
            this.onDefeat();
        }
        
        return this.health <= 0; // Return true if defeated
    }
    
    /**
     * Trigger the hit animation on the entity
     */
    showHitAnimation() {
        const currentTime = Date.now();
        this.showingHitAnimation = true;
        // Always set a new end time, even if an animation is already in progress
        this.hitAnimationEndTime = currentTime + this.hitAnimationDuration;
    }
    
    /**
     * Heal the entity
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    /**
     * Reset health to max
     */
    resetHealth() {
        this.health = this.maxHealth;
        this.isDamaged = false;
    }
    
    /**
     * Called when the entity is defeated (health <= 0)
     * Calls the entity's onDefeat method if it exists
     */
    onDefeat() {
        // Call the entity's onDefeat method if it exists
        if (typeof this.entity.onDefeat === 'function') {
            this.entity.onDefeat();
        }
    }
    
    /**
     * Draw health bar above the entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    renderHealthBar(ctx, screenX, screenY) {
        const barX = screenX;
        const barY = screenY + this.healthBarYOffset;
        
        // Draw border first (slightly larger than the health bar)
        ctx.fillStyle = this.healthBarColors.border || 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(
            barX - 1, 
            barY - 1, 
            this.healthBarWidth + 2, 
            this.healthBarHeight + 2
        );
        
        // Background (empty health)
        ctx.fillStyle = this.healthBarColors.background || 'rgba(40, 40, 40, 0.7)';
        ctx.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight);
        
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        const currentHealthWidth = this.healthBarWidth * healthPercentage;
        
        // Determine color based on health percentage
        let healthColor;
        if (healthPercentage <= 0.3) {
            healthColor = this.healthBarColors.critical || 'rgba(200, 0, 0, 0.8)';
        } else if (healthPercentage <= 0.6) {
            healthColor = this.healthBarColors.fill || 'rgba(200, 200, 0, 0.8)';
        } else {
            healthColor = this.healthBarColors.fill || 'rgba(0, 200, 0, 0.8)';
        }
        
        // Draw filled health
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, currentHealthWidth, this.healthBarHeight);
    }
    
    /**
     * Renders a hit animation on the entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    renderHitAnimation(ctx, screenX, screenY) {
        // Calculate animation progress (0 to 1)
        const currentTime = Date.now();
        // Ensure animationProgress is always between 0 and 1
        const animationProgress = Math.max(0, Math.min(1, (this.hitAnimationEndTime - currentTime) / this.hitAnimationDuration));
        
        // Calculate fist position - it should come from the side the player is facing
        // We'll calculate center position for the entity
        const centerX = screenX + this.entity.width / 2;
        const centerY = screenY + this.entity.height / 2;
        
        ctx.save();
        
        // Make the fist appear from a random direction each hit for variety
        const angle = Math.random() * Math.PI * 2;
        const distance = this.entity.width / 2 * (1 - animationProgress);
        const fistX = centerX + Math.cos(angle) * distance;
        const fistY = centerY + Math.sin(angle) * distance;
        
        // Draw the fist (simple circle)
        ctx.fillStyle = this.hitFistColor;
        ctx.beginPath();
        ctx.arc(fistX, fistY, this.hitFistSize * animationProgress, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw impact lines
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + animationProgress + ')';
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
        
        // Flash the entity red when hit
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * animationProgress})`;
        ctx.fillRect(screenX, screenY, this.entity.width, this.entity.height);
        
        ctx.restore();
    }
}
