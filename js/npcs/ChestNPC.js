import { BaseNPC } from './BaseNPC.js';
import { SPRITES } from '../colors.js';

export class ChestNPC extends BaseNPC {
    constructor({ x, y, name = 'Treasure Chest', loot = [] }) {
        // Initialize with no movement capabilities
        super({ x, y, name, canMove: false, canMoveThruWalls: false });
        
        // Chest-specific properties
        this.isOpen = false;
        this.loot = loot;
        this.showMarker = true;
        
        // Override combat system properties to make chest non-combat
        this.combatSystem.attackDamage = 0;
        this.combatSystem.attackRange = 0;
        
        // Visual effect properties
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Custom conversations based on chest state
        this.conversations = [
            [
                "You found a treasure chest!",
                "Press E to open it."
            ],
            [
                "The chest is empty now.",
                "Perhaps you'll find more treasures elsewhere."
            ]
        ];
    }
    
    /**
     * Override the interact method to handle chest opening behavior
     * @param {Player} player - The player interacting with the chest
     */
    interact(player) {
        if (!this.isOpen) {
            // First interaction opens the chest
            this.isOpen = true;
            
            // Show custom opening message
            const lootMessage = this.loot.length > 0 ?
                [`You found: ${this.loot.join(', ')}!`, "What a lucky find!"] :
                ["Unfortunately, the chest is empty.", "Better luck next time!"];
            
            player.game.showDialog(lootMessage, () => {
                this.isInConversation = false;
                this.showMarker = false;
                this.conversationIndex = 1; // Set to the 'empty chest' conversation
                
                // Call onOpen callback which can be overridden by maps
                this.onOpen?.(player);
            });
            
            this.isInConversation = true;
        } else {
            // If already open, use the standard conversation system
            super.interact(player);
        }
    }
    
    /**
     * Optional callback for when chest is opened
     * @param {Player} player - The player who opened the chest
     */
    onOpen(player) {
        console.log(`${player.name} opened the chest and found: ${this.loot.join(', ')}`);
        // Map can override this to implement special effects or rewards
    }
    
    /**
     * Update method override to add visual effects
     * @param {Player} player - The player entity
     * @param {number} deltaTime - Time passed since last update
     * @param {Map} map - Current map instance
     */
    update(player, deltaTime, map) {
        // Skip most of the base update functionality since chests don't move
        // but we'll keep the visual effects
        
        // Update glow effect intensity
        if (!this.isOpen) {
            this.glowIntensity += 0.03 * this.glowDirection;
            if (this.glowIntensity >= 1) {
                this.glowIntensity = 1;
                this.glowDirection = -1;
            } else if (this.glowIntensity <= 0.4) {
                this.glowIntensity = 0.4;
                this.glowDirection = 1;
            }
        } else {
            // No glow when open
            this.glowIntensity = 0;
        }
    }
    
    /**
     * Renders the chest with appropriate visuals for open/closed states
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     */
    _renderNPC(ctx, screenX, screenY) {
        if (this.isOpen) {
            this._renderOpenChest(ctx, screenX, screenY);
        } else {
            this._renderClosedChest(ctx, screenX, screenY);
        }
        
        // Draw name above chest only if not opened yet
        if (!this.isOpen || this.debug) {
            ctx.fillStyle = 'rgba(245, 223, 77, 0.9)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, screenX + 16, screenY - 5);
        }
        
        // Add glow effect for unopened chests
        if (!this.isOpen) {
            this._renderGlowEffect(ctx, screenX, screenY);
        }
    }
    
    /**
     * Renders a closed treasure chest
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @private
     */
    _renderClosedChest(ctx, x, y) {
        // Base of chest (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 12, 24, 18);
        
        // Top of chest (darker brown)
        ctx.fillStyle = '#5D2906';
        ctx.fillRect(x + 4, y + 6, 24, 6);
        
        // Gold lock and trim
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(x + 14, y + 12, 4, 4); // Lock
        ctx.fillRect(x + 4, y + 12, 24, 2);  // Top trim
        
        // Chest edges (darker outlines)
        ctx.strokeStyle = '#3D1C02';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, y + 6, 24, 24);
    }
    
    /**
     * Renders an open treasure chest
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @private
     */
    _renderOpenChest(ctx, x, y) {
        // Base of chest (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 12, 24, 18);
        
        // Open lid (tilted back)
        ctx.fillStyle = '#5D2906';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 12);
        ctx.lineTo(x + 28, y + 12);
        ctx.lineTo(x + 28, y + 2);
        ctx.lineTo(x + 4, y + 2);
        ctx.closePath();
        ctx.fill();
        
        // Gold trim
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(x + 4, y + 12, 24, 2);  // Top trim
        
        // Chest contents glow/sparkle
        if (this.loot.length > 0) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
            ctx.fillRect(x + 8, y + 15, 16, 12);
        }
        
        // Chest edges (darker outlines)
        ctx.strokeStyle = '#3D1C02';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, y + 12, 24, 18); // Base outline
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 12);
        ctx.lineTo(x + 28, y + 12);
        ctx.lineTo(x + 28, y + 2);
        ctx.lineTo(x + 4, y + 2);
        ctx.closePath();
        ctx.stroke(); // Lid outline
    }
    
    /**
     * Renders a glow effect around the chest
     * @param {CanvasRenderingContext2D} ctx - Rendering context
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @private
     */
    _renderGlowEffect(ctx, x, y) {
        const radius = 20 + this.glowIntensity * 8;
        const gradient = ctx.createRadialGradient(
            x + 16, y + 16, 5,
            x + 16, y + 16, radius
        );
        
        // Gold/yellow glow for treasure
        gradient.addColorStop(0, `rgba(255, 215, 0, ${0.4 * this.glowIntensity})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
