/**
 * CombatSystemExample.js
 * Example of how to integrate the AnimationManager with your existing CombatSystem
 */

import { HealthBar } from '../UI/HealthBar.js';
import { AnimationManager } from './AnimationManager.js';

export class CombatSystemExample {
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
        
        // Initialize animation manager
        this.animations = new AnimationManager(entity);
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
     * Take damage from player or other sources
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the entity was defeated
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.isDamaged = true;
        this.damageEffectTimer = this.damageEffectDuration;
        
        // Play the hit animation
        this.animations.playHit();
        
        // Check if entity is defeated
        if (this.health <= 0) {
            this.onDefeat();
        }
        
        return this.health <= 0; // Return true if defeated
    }
    
    /**
     * Called when the entity is defeated (health <= 0)
     */
    onDefeat() {
        // Play a death animation
        this.animations.playHit({
            duration: 1000,
            randomDirection: false
        });
        
        // Call the entity's onDefeat method if it exists
        if (typeof this.entity.onDefeat === 'function') {
            this.entity.onDefeat();
        }
    }
    
    /**
     * Apply a buff to the entity
     * @param {string} name - Name of the buff
     * @param {Object} config - Additional configuration
     */
    applyBuff(name, config = {}) {
        this.animations.playBuff({
            name: name,
            color: config.color || 'rgba(0, 255, 0, 0.5)',
            duration: config.duration || 2000,
            ...config
        });
        
        // Apply the actual buff effect to the entity
        // This would depend on the specific buff type
        // ...
    }
    
    /**
     * Apply a debuff to the entity
     * @param {string} name - Name of the debuff
     * @param {Object} config - Additional configuration
     */
    applyDebuff(name, config = {}) {
        this.animations.playDebuff({
            name: name,
            color: config.color || 'rgba(255, 0, 255, 0.5)',
            duration: config.duration || 2000,
            ...config
        });
        
        // Apply the actual debuff effect to the entity
        // This would depend on the specific debuff type
        // ...
    }
    
    /**
     * Draw health bar and animations above the entity
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    render(ctx, screenX, screenY) {
        // Render health bar
        if (this.showHealthBar) {
            this.healthBar.render(ctx, screenX, screenY, this.health, this.maxHealth, this.entity.width);
        }
        
        // Render all animations
        this.animations.render(ctx, screenX, screenY);
    }
}
