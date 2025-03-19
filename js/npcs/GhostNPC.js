import { BaseNPC } from './BaseNPC.js';

export class GhostNPC extends BaseNPC {
    constructor({ x, y, name = "Spectral Ghost" }) {
        // Initialize with movement and wall phasing capabilities
        super({ x, y, name, canMove: true, canMoveThruWalls: true });
        
        // Ghost-specific properties
        this.canBeAggressive = true;
        this.speed = 0.7; // Slightly faster than monsters
        this.moveInterval = 5; // More frequent movement decisions
        
        // Visual effect properties
        this.opacity = 0.7;
        this.opacityDirection = -1;
        this.hoverOffset = 0;
        this.hoverDirection = 1;

        //aggro
        this.aggroRange = this.tileSize * 5;
        
        // Configure combat system for ghost
        this.combatSystem.attackDamage = 25;
        this.combatSystem.attackRange = this.tileSize * 1; // Slightly longer range than monsters
        this.combatSystem.attackCooldown = 2000;
        this.combatSystem.healthBar.colors = {
            background: 'rgba(40, 40, 40, 0.6)',
            border: 'rgba(0, 0, 0, 0.6)',
            fill: 'rgba(120, 180, 240, 0.8)', // Ethereal blue for ghosts,
            low: 'rgba(200, 200, 0, 0.8)',
            critical: 'rgba(150, 230, 255, 1.0)' // Bright blue when critical
        };
        
        // Ghost conversation options
        this.conversations = [
            [
                "*A cold chill passes through you*",
                "I was once like you... alive.",
                "Now I wander, trapped between worlds.",
                "Beware the darkness in these woods..."
            ],
            [
                "*The ghost's form wavers and distorts*",
                "You should not linger here.",
                "The barrier between worlds grows thin.",
                "Soon, more will cross over..."
            ],
            [
                "*Ghostly whispers echo around you*",
                "I sense your fear... it draws us to you.",
                "We feed on such emotions.",
                "Leave now, or join us in eternity."
            ]
        ];
    }
    
    update(player, deltaTime, map) {
        // Call the BaseNPC update method first for movement and combat
        super.update(player, deltaTime, map);
        
        // Update visual effects
        this.opacity += 0.01 * this.opacityDirection;
        if (this.opacity >= 0.8) {
            this.opacity = 0.8;
            this.opacityDirection = -1;
        } else if (this.opacity <= 0.4) {
            this.opacity = 0.4;
            this.opacityDirection = 1;
        }
        
        // Hovering effect
        this.hoverOffset += 0.15 * this.hoverDirection;
        if (this.hoverOffset >= 3) {
            this.hoverOffset = 3;
            this.hoverDirection = -1;
        } else if (this.hoverOffset <= -3) {
            this.hoverOffset = -3;
            this.hoverDirection = 1;
        }
    }
    
    _renderNPC(ctx, screenX, screenY) {
        // Apply hover effect to Y position
        const adjustedY = screenY + this.hoverOffset;
        
        // Create a ghostly glow
        const glowRadius = 15;
        const glowGradient = ctx.createRadialGradient(
            screenX + 16, adjustedY + 16, 2,
            screenX + 16, adjustedY + 16, glowRadius
        );
        
        glowGradient.addColorStop(0, `rgba(180, 230, 255, ${this.opacity})`);
        glowGradient.addColorStop(1, `rgba(180, 230, 255, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX + 16, adjustedY + 16, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ghost body - semi-transparent
        ctx.fillStyle = `rgba(220, 240, 255, ${this.opacity - 0.1})`;
        
        // Ghost shape - a rounded form with a wavy bottom
        ctx.beginPath();
        ctx.moveTo(screenX + 8, adjustedY + 8); // Top left
        
        // Top curve
        ctx.arcTo(screenX + 16, adjustedY, screenX + 24, adjustedY + 8, 8);
        
        // Right side
        ctx.lineTo(screenX + 24, adjustedY + 20);
        
        // Wavy bottom
        ctx.bezierCurveTo(
            screenX + 24, adjustedY + 24,
            screenX + 20, adjustedY + 26 + this.hoverOffset,
            screenX + 16, adjustedY + 24
        );
        
        ctx.bezierCurveTo(
            screenX + 12, adjustedY + 26 - this.hoverOffset,
            screenX + 8, adjustedY + 24,
            screenX + 8, adjustedY + 20
        );
        
        ctx.closePath();
        ctx.fill();
        
        // Ghost eyes - more visible when aggressive
        const eyeOpacity = this.isAggressive ? 0.9 : 0.6;
        ctx.fillStyle = `rgba(120, 200, 255, ${eyeOpacity})`;
        
        // Left eye
        ctx.beginPath();
        ctx.ellipse(screenX + 12, adjustedY + 12, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.ellipse(screenX + 20, adjustedY + 12, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add trails/particles when moving
        if (this.isMoving) {
            this._renderTrails(ctx, screenX, adjustedY);
        }
        
        // Draw name above NPC
        ctx.fillStyle = this.isAggressive ? 'rgba(255, 100, 100, 0.9)' : 'rgba(200, 200, 200, 0.9)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, adjustedY - 8);
    }
    
    _renderTrails(ctx, x, y) {
        // Add ghostly trail particles
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * 12;
            const offsetY = (Math.random() - 0.5) * 8;
            const size = 1 + Math.random() * 3;
            const particleOpacity = (this.opacity - 0.2) * Math.random();
            
            ctx.fillStyle = `rgba(180, 230, 255, ${particleOpacity})`;
            ctx.beginPath();
            ctx.arc(x + 16 + offsetX, y + 20 + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    interact(player) {
        // When aggressive is off, show dialog
        if (!this.isAggressive) {
            super.interact(player);
        }
    }
    
    onConversationComplete() {
        // Make ghost aggressive after second conversation
        if (this.conversationIndex >= 2) {
            this.isAggressive = true;
        }
    }
    
    /**
     * Override takeDamage to add special ghost effects
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the ghost was defeated
     */
    takeDamage(amount) {
        // Special visual effect when taking damage
        this.opacity = 0.9; // Flash to more visible when hit
        setTimeout(() => {
            this.opacity = 0.6;
        }, 200);
        
        // Call the parent takeDamage method which uses combat system
        return super.takeDamage(amount);
    }
    
    /**
     * Called when the ghost is defeated
     */
    onDefeat() {
        console.log(`${this.name} has been banished!`);
        // Ghost will be removed in the map's update method
    }
}
