/**
 * Represents the player combat system in the game world.
 * Handles attacks, damage, health management, and combat animations.
 * Extends BaseCombat for shared functionality.
 */
import { BaseCombat } from './BaseCombat.js';

export class PlayerCombat extends BaseCombat {
    /** @type {boolean} Whether the player is currently invulnerable */
    isInvulnerable = false;
    /** @type {number} Duration of invulnerability in milliseconds after taking damage */
    invulnerabilityDuration = 1000;
    /** @type {number} Timestamp when invulnerability will end */
    invulnerabilityEndTime = 0;

    /**
     * Creates a new PlayerCombat instance.
     * @param {Object} player - Reference to the player object
     */
    constructor(player) {
        super(player, {
            maxHealth: 100,
            attackDamage: 20,
            attackRange: player.tileSize * 1,
            attackCooldown: 1000,
            healthBarWidth: 32,
            healthBarHeight: 5,
            healthBarYOffset: -10,
            // Stats configuration for player
            strength: { value: 7 }, // Player starts with more strength than NPCs
            vitality: { value: 7 }, // Player starts with more vitality than NPCs
            strengthMultiplier: 3, // Player gets more damage per strength point
            vitalityMultiplier: 10
        });
    }

    /**
     * Attack nearby aggressive monsters.
     * @param {number} damage - Amount of damage to deal (defaults to calculated damage from stats)
     * @param {number} range - Range in pixels to detect monsters (defaults to this.attackRange)
     * @returns {boolean} - Whether any monsters were attacked
     */
    attack(damage = this.getDamage(), range = this.attackRange) {
        // Check if attack is on cooldown
        const currentTime = Date.now();
        if (currentTime < this.nextAttackTime) {
            return false; // Still on cooldown
        }
        
        if (!this.entity.map || !this.entity.map.npcs) return false;
        
        let attackedAny = false;
        
        // Get player center position
        const playerCenterX = this.entity.x + (this.entity.width / 2);
        const playerCenterY = this.entity.y + (this.entity.height / 2);
        
        this.entity.map.npcs.forEach(npc => {
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
                this._faceTowardsTarget(dx, dy);
                
                // Deal damage to the NPC
                npc.takeDamage(damage);
                attackedAny = true;
            }
        });
        
        // Set cooldown if attack was successful
        if (attackedAny) {
            this.nextAttackTime = currentTime + this.attackCooldown;
        }
        
        return attackedAny;
    }

    /**
     * Takes damage and reduces the player's health
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        // Call the base class implementation
        super.takeDamage(amount);
        
        // Make player invulnerable for a short time
        this.isInvulnerable = true;
        this.invulnerabilityEndTime = Date.now() + this.invulnerabilityDuration;
    }

    /**
     * Heals the player by increasing health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        super.heal(amount);
    }

    /**
     * Resets the player's health to maximum
     */
    resetHealth() {
        super.resetHealth();
        this.isInvulnerable = false;
    }

    /**
     * Handles game over when player health reaches zero
     * @protected
     */
    _handleDefeat() {
        console.log('Game Over!'); 
        
        // Don't reset health immediately - let the game over handler handle it
        // Call the game's handleGameOver method if available
        if (this.entity.game && typeof this.entity.game.handleGameOver === 'function') {
            this.entity.game.handleGameOver();
        }
    }

    /**
     * Updates the combat system state each frame.
     */
    update() {
        super.update();
        
        // Update invulnerability status
        if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) {
            this.isInvulnerable = false;
        }
        
        // Update health bar visibility for player-specific logic
        this.showHealthBar = this.currentHealth < this.maxHealth || Date.now() < this.healthBarHideTime;
    }

    /**
     * Gets whether the player should be currently displayed (handles invulnerability flashing)
     * @returns {boolean} - Whether the player should be visible
     */
    shouldRenderEntity() {
        return !this.isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0;
    }

    /**
     * Renders the health bar and animations above the entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    render(ctx, screenX, screenY) {
        // Override the parent render to use entity's properties
        if (this.showHealthBar && this.currentHealth < this.maxHealth) {
            this.healthBar.render(ctx, screenX, screenY, this.currentHealth, this.maxHealth, this.entity.width);
        }

        // Render animations
        this.animations.render(ctx, screenX, screenY, this.entity.width, this.entity.height);
    }
}
