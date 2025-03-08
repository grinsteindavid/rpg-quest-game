import { BaseNPC } from './BaseNPC.js';
import { SPRITES } from '../colors.js';

export class MonsterNPC extends BaseNPC {
    constructor({ x, y, name = "Forest Monster" }) {
        super({ x, y, name });
        
        // Monster-specific properties
        this.speed = 0.5;
        this.moveTimer = 0;
        this.moveInterval = 120; // Time between movement in frames
        this.moveRange = 2; // How many tiles it can move from spawn
        this.initialX = this.x; // Store initial position (already converted to pixels)
        this.initialY = this.y;
        this.isAggressive = false;
        this.aggroRange = 96; // 3 tiles detection range
        
        // Movement direction tracking
        this.directionX = 0;
        this.directionY = 0;
        
        // Visual effect properties
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
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
    
    update(player, deltaTime) {
        // Detect if player is in aggro range
        const distanceToPlayer = Math.sqrt(
            Math.pow((player.x - this.x), 2) + 
            Math.pow((player.y - this.y), 2)
        );
        
        this.isAggressive = distanceToPlayer <= this.aggroRange;
        
        // Handle monster movement
        this.moveTimer++;
        
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // Decide on a new direction if not aggressive
            if (!this.isAggressive) {
                this.directionX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                this.directionY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            } else {
                // Move toward player when aggressive
                this.directionX = player.x > this.x ? 1 : (player.x < this.x ? -1 : 0);
                this.directionY = player.y > this.y ? 1 : (player.y < this.y ? -1 : 0);
            }
            
            // Set direction for rendering
            if (Math.abs(this.directionX) > Math.abs(this.directionY)) {
                this.direction = this.directionX > 0 ? 'right' : 'left';
            } else if (this.directionY !== 0) {
                this.direction = this.directionY > 0 ? 'down' : 'up';
            }
        }
        
        // Apply movement
        const moveSpeed = this.isAggressive ? this.speed * 1.5 : this.speed;
        this.x += this.directionX * moveSpeed;
        this.y += this.directionY * moveSpeed;
        
        // Constrain to move range if not aggressive
        if (!this.isAggressive) {
            const distanceFromSpawn = Math.sqrt(
                Math.pow((this.initialX - this.x), 2) + 
                Math.pow((this.initialY - this.y), 2)
            );
            
            if (distanceFromSpawn > this.moveRange * 32) {
                // Move back toward spawn point
                const angle = Math.atan2(this.initialY - this.y, this.initialX - this.x);
                this.x += Math.cos(angle) * moveSpeed;
                this.y += Math.sin(angle) * moveSpeed;
            }
        }
        
        // Update visual effects
        this.glowIntensity += 0.05 * this.glowDirection;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.4) {
            this.glowIntensity = 0.4;
            this.glowDirection = 1;
        }
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
        // Flip between aggressive and normal when interacted with
        if (this.isAggressive) {
            // If aggressive, still show dialog but remain aggressive
            super.interact(player);
        } else {
            // If not aggressive, show dialog normally
            super.interact(player);
        }
    }
    
    onConversationComplete() {
        // Make monster aggressive after first conversation
        if (this.conversationIndex >= 1) {
            this.isAggressive = true;
        }
    }
}
