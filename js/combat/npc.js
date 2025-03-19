/**
 * CombatSystem.js
 * Handles all combat-related functionality for NPCs and potentially other game entities
 */
import { HealthBar } from '../UI/HealthBar.js';
import { AnimationManager } from '../animations/AnimationManager.js';
import { DamageNumberAnimation } from '../animations/DamageNumber.js';
import { HitAnimation } from '../animations/HitAnimation.js';

export class CombatSystem {
    constructor(entity) {
        // Reference to the entity (NPC) that owns this combat system
        this.entity = entity;
        
        // Health properties
        this.maxHealth = 100; // Default maximum health
        this.health = this.maxHealth; // Current health
        this.showHealthBar = true; // Whether to display the health bar
        this.isDamaged = false; // Flag for damage visual effect
        this.damageEffectDuration = 20; // Frames to show damage effect
        this.damageEffectTimer = 0; // Timer for damage effect
        
        // Attack properties
        this.attackDamage = 10;
        this.attackRange = 40; // Slightly larger than player's attack range
        this.attackCooldown = 1500; // Milliseconds between attacks
        this.nextAttackTime = 0; // Timestamp when the entity can attack again
        
        // Initialize UI components
        this.healthBar = new HealthBar({
            width: 32,
            height: 4,
            yOffset: -10,
            colors: {
                fill: 'rgba(200, 0, 0, 0.9)',
                critical: 'rgba(255, 50, 50, 1.0)'
            }
        });
        
        // Initialize animations
        this.animations = new AnimationManager(this.entity);
        this.animations.registerAnimationType('hit', HitAnimation);
        this.animations.registerAnimationType('damage', DamageNumberAnimation);
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
        
        // Update animations
        this.animations.update();
        
        // Get current time for cooldown checks
        const currentTime = Date.now();
        
        // Check if the entity should attack the player
        if (this.entity.isAggressive && player && currentTime >= this.nextAttackTime) {
            if (this.isPlayerInAttackRange(player)) {
                this.attackPlayer(player);
            }
        }
    }

    /**
     * Renders the health bar and animations above the entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    render(ctx, screenX, screenY) {
        // Draw health bar if enabled and not at full health
        if (this.showHealthBar && this.health < this.maxHealth) {
            this.healthBar.render(ctx, screenX, screenY, this.health, this.maxHealth, this.entity.width);
        }

        // Render animations
        this.animations.render(ctx, screenX, screenY, this.entity.width, this.entity.height);
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
        this.animations.play('hit');
        this.animations.play('damage', {value: amount});
        
        // Check if entity is defeated
        if (this.health <= 0) {
            this.onDefeat();
        }
        
        return this.health <= 0; // Return true if defeated
    }
    
    /**
     * Heal the entity
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.animations.play('heal', {value: amount});
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
}
