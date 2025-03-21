/**
 * NpcCombat.js
 * Handles all combat-related functionality for NPCs, extending the BaseCombat system
 */
import { BaseCombat } from './BaseCombat.js';

export class CombatSystem extends BaseCombat {
    /**
     * Creates a new NPC combat system
     * @param {Object} entity - The NPC entity
     */
    constructor(entity) {
        super(entity, {
            attackDamage: 10,
            attackRange: entity.tileSize * 1,  // Slightly larger than default player's attack range
            attackCooldown: 1500, // Milliseconds between attacks
            healthBarWidth: 32,
            healthBarHeight: 4,
            healthBarYOffset: -23,
            healthBarColors: {
                background: 'rgba(40, 40, 40, 0.8)',
                border: 'rgba(0, 0, 0, 0.8)',
                fill: 'rgba(200, 0, 0, 0.9)',
                low: 'rgba(200, 200, 0, 0.8)',
                critical:'rgba(255, 50, 50, 1.0)'
            },
            // Stats configuration
            strength: { value: 5, modifier: 2 },
            vitality: { value: 5, modifier: 10 },
        });
    }
    
    /**
     * Update combat-related systems
     * @param {Object} player - The player object
     */
    update(player) {
        // Call base class update
        super.update();
        
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
        super.render(ctx, screenX, screenY);
    }
    
    /**
     * Check if player is in attack range
     * @param {Object} player - The player object
     * @returns {boolean} - Whether player is in attack range
     */
    isPlayerInAttackRange(player) {
        return this.isTargetInAttackRange(player);
    }
    
    /**
     * Attack the player if in range
     * @param {Object} player - The player to attack
     * @returns {boolean} - Whether the player was attacked
     */
    attackPlayer(player) {
        const currentTime = Date.now();
        
        // Check if cooldown has expired
        if (currentTime < this.nextAttackTime) {
            return false;
        }
        
        // Calculate distance between entity and player for direction facing
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
            
            // Deal damage to the player using calculated damage from stats
            player.takeDamage(this.stats.calculateDamage());
            
            // Set cooldown for next attack
            this.nextAttackTime = currentTime + this.attackCooldown;
            
            return true;
        }
        
        return false;
    }
    
    // _faceTowardsTarget is now provided by BaseCombat
    
    /**
     * Take damage from player or other sources
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the entity was defeated
     */
    takeDamage(amount) {
        const defeated = super.takeDamage(amount);
        return defeated;
    }
    
    /**
     * Heal the entity
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        super.heal(amount);
    }
    
    /**
     * Reset health to max
     */
    resetHealth() {
        super.resetHealth();
    }
    
    /**
     * Called when the entity is defeated (health <= 0)
     * Overrides the BaseCombat._handleDefeat method
     * @protected
     */
    _handleDefeat() {
        // Call the entity's onDefeat method if it exists
        if (typeof this.entity.onDefeat === 'function') {
            this.entity.onDefeat();
        }
    }
}
