import { BaseNPC } from './BaseNPC.js';

export class MonsterNPC extends BaseNPC {
    constructor({ x, y, name = "Forest Monster" }) {
        // Initialize with movement capabilities
        super({ x, y, name, canMove: true, canMoveThruWalls: false });
        
        // Monster-specific properties - don't override speed as we're using tile-by-tile movement now
        this.canBeAggressive = true; // Start aggressive by default
        
        // Visual effect properties
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Hit animation properties
        this.showingHitAnimation = false;
        this.hitAnimationDuration = 500; // milliseconds
        this.hitAnimationEndTime = 0;
        this.hitFistSize = 12;
        this.hitFistColor = 'rgba(255, 255, 255, 0.8)';
        
        // Custom health bar appearance for monsters
        this.healthBarHeight = 5; // Slightly taller for better visibility
        this.healthBarYOffset = -12; // Position a bit higher above the monster
        this.healthBarColors = {
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
        // Call the BaseNPC update method first to handle aggro detection and movement
        super.update(player, deltaTime, map);
        
        // We've removed the speed adjustment here since we're using tile-by-tile movement
        // This ensures the monster moves exactly like the player now
        
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
    
    _renderNPC(ctx, screenX, screenY) {
        // Render the hit animation if active
        if (this.showingHitAnimation) {
            this._renderHitAnimation(ctx, screenX, screenY);
        }
        
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
     * Override takeDamage to add additional visual effects
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the monster was defeated
     */
    takeDamage(amount) {
        // Call the parent takeDamage method
        const isDefeated = super.takeDamage(amount);
        
        // Always trigger the hit animation when taking damage
        this.showHitAnimation();
        
        return isDefeated;
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
    
    /**
     * Renders a fist hit animation on the monster
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @private
     */
    _renderHitAnimation(ctx, screenX, screenY) {
        // Calculate animation progress (0 to 1)
        const currentTime = Date.now();
        // Ensure animationProgress is always between 0 and 1
        const animationProgress = Math.max(0, Math.min(1, (this.hitAnimationEndTime - currentTime) / this.hitAnimationDuration));
        
        // Calculate fist position - it should come from the side the player is facing
        // We'll calculate center position for the monster
        const centerX = screenX + 16;
        const centerY = screenY + 16;
        
        // Draw fist
        ctx.save();
        
        // Make the fist appear from a random direction each hit for variety
        const angle = Math.random() * Math.PI * 2;
        const distance = this.width / 2 * (1 - animationProgress);
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
        
        // Flash the monster red when hit
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * animationProgress})`;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        ctx.restore();
    }
}
