import { BaseNPC } from './BaseNPC.js';

export class MonsterNPC extends BaseNPC {
    constructor({ x, y, name = "Forest Monster" }) {
        // Initialize with movement capabilities
        super({ x, y, name, canMove: true, canMoveThruWalls: false });
        
        // Monster-specific properties - don't override speed as we're using tile-by-tile movement now
        this.canBeAggressive = true; // Start aggressive by default
        
        // Attack properties
        this.attackDamage = 10;
        this.attackRange = 40; // Slightly larger than player's attack range
        this.attackCooldown = 1500; // Milliseconds between attacks
        this.nextAttackTime = 0; // Timestamp when the monster can attack again
        
        // Visual effect properties
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Configure combat system for monster
        this.combatSystem.attackDamage = 10;
        this.combatSystem.attackRange = 40;
        this.combatSystem.attackCooldown = 1500;
        this.combatSystem.healthBarHeight = 5; // Slightly taller for better visibility
        this.combatSystem.healthBarYOffset = -12; // Position a bit higher above the monster
        this.combatSystem.healthBarColors = {
            background: 'rgba(40, 40, 40, 0.8)',
            border: 'rgba(0, 0, 0, 0.8)',
            fill: 'rgba(200, 0, 0, 0.9)', // Red for monsters
            critical: 'rgba(255, 50, 50, 1.0)' // Bright red when critical
        };
        
        // Monster conversation options
        this.conversations = [
            [
                "*The monster growls menacingly*",
                "You shouldn't be here, human.",
                "The dark forest is MY territory.",
                "Leave now... or you'll regret it."
            ],
            [
                "*The monster's eyes glow intensely*",
                "Still here? Brave... or foolish.",
                "Many have entered these woods...",
                "Few have left."
            ],
            [
                "*The monster snarls*",
                "Next time we meet, words won't save you.",
                "The forest grows darker ahead...",
                "Turn back while you still can."
            ]
        ];
    }
    
    update(player, deltaTime, map) {
        // Call the BaseNPC update method first to handle aggro detection, movement, and combat
        super.update(player, deltaTime, map);
        
        // Update visual effects
        this.glowIntensity += 0.05 * this.glowDirection;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.4) {
            this.glowIntensity = 0.4;
            this.glowDirection = 1;
        }
        
        // Check if hit animation should end
        const currentTime = Date.now();
        if (this.showingHitAnimation) {
            if (currentTime >= this.hitAnimationEndTime) {
                this.showingHitAnimation = false;
            }
        }
        
        // Check if the monster should attack the player
        if (this.isAggressive && player && currentTime >= this.nextAttackTime) {
            this.attackPlayer(player);
            console.log('Monster attacking player!');
        }
    }
    
    /**
     * Trigger the hit animation on the monster
     */
    showHitAnimation() {
        const currentTime = Date.now();
        this.showingHitAnimation = true;
        // Always set a new end time, even if an animation is already in progress
        this.hitAnimationEndTime = currentTime + this.hitAnimationDuration;
    }
    
    /**
     * Attack the player if in range
     * @param {Player} player - The player to attack
     * @returns {boolean} - Whether the player was attacked
     */
    attackPlayer(player) {
        const currentTime = Date.now();
        
        // Calculate distance between monster and player
        const monsterCenterX = this.x + (this.width / 2);
        const monsterCenterY = this.y + (this.height / 2);
        const playerCenterX = player.x + (player.width / 2);
        const playerCenterY = player.y + (player.height / 2);
        
        const dx = playerCenterX - monsterCenterX;
        const dy = playerCenterY - monsterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Attack if player is in range
        if (distance <= this.attackRange) {
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
     * Faces the monster towards a target based on relative position
     * @param {number} dx - X distance to target (target.x - monster.x)
     * @param {number} dy - Y distance to target (target.y - monster.y)
     * @private
     */
    _faceTowardsTarget(dx, dy) {
        // Determine predominant direction (horizontal or vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal direction is predominant
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical direction is predominant
            this.direction = dy > 0 ? 'down' : 'up';
        }
    }
    
    // Override the render method to show health bar only when health < maxHealth
    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        // Render the basic NPC components
        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
        
        // Only show health bar when health is below max
        if (this.health < this.maxHealth) {
            this._renderHealthBar(ctx, screenX, screenY);
        }
    }
    
    // Override the _renderHealthBar method for monsters with custom styling
    _renderHealthBar(ctx, screenX, screenY) {
        const barX = screenX;
        const barY = screenY + this.healthBarYOffset;
        
        // Draw border first (slightly larger than the health bar)
        ctx.fillStyle = this.healthBarColors.border;
        ctx.fillRect(
            barX - 1, 
            barY - 1, 
            this.healthBarWidth + 2, 
            this.healthBarHeight + 2
        );
        
        // Background (empty health)
        ctx.fillStyle = this.healthBarColors.background;
        ctx.fillRect(barX, barY, this.healthBarWidth, this.healthBarHeight);
        
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        const currentHealthWidth = this.healthBarWidth * healthPercentage;
        
        // Determine color based on health percentage
        let healthColor = this.healthBarColors.fill;
        if (healthPercentage <= 0.3) {
            healthColor = this.healthBarColors.critical; // Critical health
        }
        
        // Draw filled health
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, currentHealthWidth, this.healthBarHeight);
    }
    
    // Override the render method 
    render(ctx, mapOffset) {
        super.render(ctx, mapOffset);
    }
    
    _renderNPC(ctx, screenX, screenY) {
        
        // Monster body
        ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
        ctx.fillRect(screenX + 6, screenY + 8, 20, 22);
        
        // Glowing eyes
        const eyeGlow = `rgba(255, ${Math.floor(50 + this.glowIntensity * 100)}, 0, ${0.7 + this.glowIntensity * 0.3})`;
        ctx.fillStyle = eyeGlow;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(screenX + 11, screenY + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(screenX + 21, screenY + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Monster claws/hands
        ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
        
        // Adjust claw positions based on direction
        if (this.direction === 'left') {
            ctx.fillRect(screenX + 2, screenY + 16, 4, 8);
        } else if (this.direction === 'right') {
            ctx.fillRect(screenX + 26, screenY + 16, 4, 8);
        } else if (this.direction === 'up') {
            ctx.fillRect(screenX + 8, screenY + 5, 5, 5);
            ctx.fillRect(screenX + 19, screenY + 5, 5, 5);
        } else { // down
            ctx.fillRect(screenX + 8, screenY + 25, 5, 5);
            ctx.fillRect(screenX + 19, screenY + 25, 5, 5);
        }
        
        // Spikes on top
        ctx.fillStyle = 'rgba(70, 70, 70, 0.9)';
        ctx.beginPath();
        ctx.moveTo(screenX + 11, screenY + 8);
        ctx.lineTo(screenX + 14, screenY + 3);
        ctx.lineTo(screenX + 17, screenY + 8);
        ctx.lineTo(screenX + 20, screenY + 2);
        ctx.lineTo(screenX + 23, screenY + 8);
        ctx.fill();
        
        // Draw name above NPC
        ctx.fillStyle = this.isAggressive ? 'rgba(255, 100, 100, 0.9)' : 'rgba(200, 200, 200, 0.9)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, screenY - 5);
        
        // Draw glow effect when aggressive
        if (this.isAggressive) {
            const radius = 20 + this.glowIntensity * 10;
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY + 16, 5,
                screenX + 16, screenY + 16, radius
            );
            gradient.addColorStop(0, `rgba(255, 100, 0, ${0.3 * this.glowIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 16, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    interact(player) {
        // When aggressive is off, show dialog
        if (this.isAggressive === false) {
            super.interact(player);
        }
    }
    
    onConversationComplete() {
        // Make monster aggressive after first conversation
        if (this.conversationIndex >= 1) {
            this.isAggressive = true;
        }
    }
    
    /**
     * Override takeDamage to add additional effects if needed
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the monster was defeated
     */
    takeDamage(amount) {
        // Call the parent takeDamage method which uses combat system
        return super.takeDamage(amount);
    }
    
    /**
     * Called when the monster is defeated (health <= 0)
     * Marks the monster for removal from the map
     */
    onDefeat() {
        // Monster death animation or effects can be added here
        console.log(`${this.name} has been defeated!`);
        // Monster will be removed in the map's update method
    }
    
    // Hit animation rendering has been moved to the CombatSystem class
}
