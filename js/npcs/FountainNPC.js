import { BaseNPC } from './BaseNPC.js';

/**
 * Represents a water fountain in the town that heals the player
 * when they interact with it.
 */
export class FountainNPC extends BaseNPC {
    /**
     * Creates a new FountainNPC instance.
     * @param {Object} config - Configuration object
     * @param {number} config.x - Tile X coordinate
     * @param {number} config.y - Tile Y coordinate
     * @param {string} config.name - Name of the fountain
     */
    constructor({ x, y, name = "Town Fountain" }) {
        super({ x, y, name, canMove: false });
        
        // UI display properties
        this.showNameTag = true;
        this.showMarker = true;
        
        // Ensure width and height are properly set (standard NPC size)
        this.width = 32;
        this.height = 32;
        
        // Set conversations for the fountain
        this.conversations = [
            [
                "This is a magical water fountain...",
                "The water looks pure and refreshing.",
                "You take a drink and feel revitalized!"
            ],
            [
                "The fountain's water shimmers with magical energy.",
                "You take another drink and feel your strength return!"
            ]
        ];
    }

    /**
     * Custom render method to draw the fountain
     * @override
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {{x: number, y: number}} mapOffset - Map offset coordinates
     */
    render(ctx, mapOffset) {
        // Calculate screen coordinates
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;
        
        // Make the fountain slightly larger for better visibility
        const originalWidth = this.width;
        const originalHeight = this.height;
        
        // Draw a circular fountain base
        ctx.fillStyle = '#6699cc'; // Blue-gray color for the fountain base
        ctx.beginPath();
        ctx.ellipse(
            screenX + this.width / 2,
            screenY + this.height * 0.8,
            this.width / 2 - 2,
            this.height / 4,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw fountain water
        ctx.fillStyle = '#44ccff'; // Bright blue for water
        ctx.beginPath();
        ctx.ellipse(
            screenX + this.width / 2,
            screenY + this.height * 0.8,
            this.width / 2 - 6,
            this.height / 4 - 4,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw fountain column
        ctx.fillStyle = '#888888'; // Gray for stone column
        ctx.fillRect(
            screenX + this.width / 2 - 4,
            screenY + this.height * 0.4,
            8,
            this.height * 0.4
        );
        
        // Draw water spray animation
        this._drawWaterSpray(ctx, screenX, screenY);
        
        // If in debug mode, draw the bounding box
        if (this.debug) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, this.width, this.height);
        }
        
        // Draw the name tag if visible
        if (this.showNameTag) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, screenX + this.width/2, screenY - 5);
        }
        
        // Draw marker if visible
        if (this.showMarker && this.marker) {
            this.marker.render(ctx, screenX, screenY - 8);  
        }
        
        // Restore original dimensions
        this.width = originalWidth;
        this.height = originalHeight;
        
        // Render any combat-related UI (health bar, etc.)
        this.combatSystem.render(ctx, screenX, screenY);
    }
    
    /**
     * Draws the animated water spray
     * @private
     */
    _drawWaterSpray(ctx, screenX, screenY) {
        const time = Date.now() / 200;
        const centerX = screenX + this.width / 2;
        const topY = screenY + this.height * 0.4;
        
        // Add a subtle glowing effect
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00aaff';
        
        // Simple blue glow for the water
        ctx.fillStyle = '#44ccff';
        ctx.beginPath();
        ctx.arc(centerX, topY - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Create multiple water droplets in a fountain pattern
        ctx.fillStyle = '#44ccff'; // Water color
        for (let i = 0; i < 12; i++) {
            const angle = (time + i) * 0.4;
            const height = 5 + Math.sin(time + i) * 3;
            const x = centerX + Math.cos(angle) * 8;
            const y = topY - height - Math.sin(time * 0.5) * 3;
            
            ctx.beginPath();
            ctx.ellipse(x, y, 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Stores the player reference when interacting
     * @override
     */
    interact(player) {
        // Store player reference for later use in onConversationComplete
        this.currentPlayer = player;
        
        // Call the parent class interact method
        super.interact(player);
    }

    /**
     * Called when conversation with this NPC is completed
     * Heals the player to full health and displays buff animation
     */
    onConversationComplete() {
        // Use the stored player reference from interact method
        if (!this.currentPlayer) return;
        
        // Fully restore player health
        this.currentPlayer.combat.resetHealth();
        
        // Play the buff animation on the player
        this.currentPlayer.combat.animations.play('buff', {
            duration: 2000,
            name: 'Health Restored!',
            color: 'rgba(0, 255, 128, 0.5)'
        });
    }
}
