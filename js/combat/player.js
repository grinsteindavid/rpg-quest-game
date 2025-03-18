/**
 * Represents the player combat system in the game world.
 * Handles attacks, damage, health management, and combat animations.
 */
export class PlayerCombat {
    /** @type {number} Maximum health points of the player */
    maxHealth = 100;
    /** @type {number} Current health points of the player */
    currentHealth = 100;
    /** @type {boolean} Whether the player is currently invulnerable */
    isInvulnerable = false;
    /** @type {number} Duration of invulnerability in milliseconds after taking damage */
    invulnerabilityDuration = 1000;
    /** @type {number} Timestamp when invulnerability will end */
    invulnerabilityEndTime = 0;
    /** @type {boolean} Whether to show the health bar */
    showHealthBar = true;
    /** @type {number} Time in milliseconds to show health bar after taking damage */
    healthBarDisplayTime = 3000;
    /** @type {number} Timestamp when health bar should hide */
    healthBarHideTime = 0;
    /** @type {number} Cooldown duration between attacks in milliseconds */
    attackCooldown = 1000;
    /** @type {number} Timestamp when player can attack again */
    nextAttackTime = 0;
    
    // Hit animation properties
    /** @type {boolean} Whether the hit animation is currently playing */
    showingHitAnimation = false;
    /** @type {number} Duration of hit animation in milliseconds */
    hitAnimationDuration = 500;
    /** @type {number} Timestamp when hit animation will end */
    hitAnimationEndTime = 0;

    /** @type {Object} Reference to the player object */
    player = null;

    /**
     * Creates a new PlayerCombat instance.
     * @param {Object} player - Reference to the player object
     */
    constructor(player) {
        this.player = player;
        this.currentHealth = this.maxHealth;
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
    }

    /**
     * Attack nearby aggressive monsters.
     * @param {number} damage - Amount of damage to deal
     * @param {number} range - Range in pixels to detect monsters
     * @returns {boolean} - Whether any monsters were attacked
     */
    attack(damage = 20, range = 32) {
        // Check if attack is on cooldown
        const currentTime = Date.now();
        if (currentTime < this.nextAttackTime) {
            return false; // Still on cooldown
        }
        
        if (!this.player.map || !this.player.map.npcs) return false;
        
        let attackedAny = false;
        
        // Get player center position
        const playerCenterX = this.player.x + (this.player.width / 2);
        const playerCenterY = this.player.y + (this.player.height / 2);
        
        this.player.map.npcs.forEach(npc => {
            // Check if the NPC is a monster and can be aggressive
            if (!npc.canBeAggressive) return;
            
            // Get NPC center position
            const npcCenterX = npc.x + (npc.width / 2);
            const npcCenterY = npc.y + (npc.height / 2);
            
            // Calculate distance between player and NPC
            const dx = npcCenterX - playerCenterX;
            const dy = npcCenterY - playerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Attack if in range
            if (distance <= range) {
                // Update player's direction to face the monster
                this.player._faceTowardsTarget(dx, dy);
                
                // Deal damage to the NPC
                const isDefeated = npc.takeDamage(damage);
                attackedAny = true;
                
                // Trigger hit animation on the monster
                if (typeof npc.showHitAnimation === 'function') {
                    npc.showHitAnimation();
                }
                
                // If the NPC is defeated, mark it for removal
                if (isDefeated) {
                    npc.isDefeated = true;
                }
            }
        });
        
        // Set cooldown if attack was successful
        if (attackedAny) {
            this.nextAttackTime = currentTime + this.attackCooldown;
        }
        
        return attackedAny;
    }

    /**
     * Shows hit animation when player takes damage
     */
    showHitAnimation() {
        const currentTime = Date.now();
        this.showingHitAnimation = true;
        this.hitAnimationEndTime = currentTime + this.hitAnimationDuration;
    }

    /**
     * Renders the hit animation effect on the player
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @param {number} width - Width of the player sprite
     * @param {number} height - Height of the player sprite
     */
    renderHitAnimation(ctx, screenX, screenY, width, height) {
        // Calculate animation progress (0 to 1)
        const currentTime = Date.now();
        const animationProgress = Math.max(0, Math.min(1, (this.hitAnimationEndTime - currentTime) / this.hitAnimationDuration));
        
        // Flash the player red when hit
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 * animationProgress})`;
        ctx.fillRect(screenX, screenY, width, height);
        
        // Draw a damage effect (simple white flash)
        ctx.strokeStyle = `rgba(255, 255, 255, ${animationProgress})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, width, height);
    }

    /**
     * Renders the health bar above the player
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @param {number} width - Width of the player sprite
     */
    renderHealthBar(ctx, screenX, screenY, width) {
        const barWidth = width;
        const barHeight = 5;
        const barX = screenX;
        const barY = screenY - 10;
        const healthPercentage = this.currentHealth / this.maxHealth;
        
        // Health bar background
        ctx.fillStyle = 'rgba(51, 51, 51, 1)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill color based on health percentage
        if (healthPercentage <= 0.25) {
            ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        } else if (healthPercentage <= 0.5) {
            ctx.fillStyle = 'rgba(204, 68, 68, 1)';
        } else {
            ctx.fillStyle = 'rgba(68, 204, 68, 1)';
        }
        
        // Health bar fill
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Health bar border
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    /**
     * Takes damage and reduces the player's health
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
        
        // Show hit animation
        this.showHitAnimation();
        
        // Make player invulnerable for a short time
        this.isInvulnerable = true;
        this.invulnerabilityEndTime = Date.now() + this.invulnerabilityDuration;
        
        // Game over if health reaches zero
        if (this.currentHealth <= 0) {
            this._handleGameOver();
        }
    }

    /**
     * Heals the player by increasing health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.healthBarHideTime = Date.now() + this.healthBarDisplayTime;
    }

    /**
     * Resets the player's health to maximum
     */
    resetHealth() {
        this.currentHealth = this.maxHealth;
        this.isInvulnerable = false;
    }

    /**
     * Handles game over when player health reaches zero
     * @private
     */
    _handleGameOver() {
        // For now, just reset health - in a real game, you would
        // trigger game over screen or respawn logic here
        console.log('Game Over!');
        this.resetHealth();
        
        // If the game has a game over handler, call it
        if (this.player.game && typeof this.player.game.handleGameOver === 'function') {
            this.player.game.handleGameOver();
        }
    }

    /**
     * Updates the combat system state each frame.
     */
    update() {
        // Update invulnerability status
        if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) {
            this.isInvulnerable = false;
        }
        
        // Check if hit animation should end
        if (this.showingHitAnimation && Date.now() > this.hitAnimationEndTime) {
            this.showingHitAnimation = false;
        }
        
        // Update health bar visibility
        this.showHealthBar = this.currentHealth < this.maxHealth || Date.now() < this.healthBarHideTime;
    }

    /**
     * Gets whether the player should be currently displayed (handles invulnerability flashing)
     * @returns {boolean} - Whether the player should be visible
     */
    shouldRenderPlayer() {
        return !this.isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0;
    }
}
