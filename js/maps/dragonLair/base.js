import { COLORS } from '../../colors.js';
import { BaseMap } from '../BaseMap.js';
import { DragonNPC } from '../../npcs/DragonNPC.js';
import { DragonBossNPC } from '../../npcs/DragonBossNPC.js';
import { ChestNPC } from '../../npcs/ChestNPC.js';
import { FogEffect } from '../../effects/FogEffect.js';

export class DragonLairMap extends BaseMap {
    constructor(config = {}) {
        super({
            name: 'Dragon Lair',
            game: config.game || null,
            colors: {
                primary: COLORS.DARK_RED,    // Dark red for the volcanic dragon lair
                pattern: COLORS.DARKER_RED   // Even darker red for pattern
            }
        });

        // Define transition points back to the dark forest depths
        this.transitions = {
            darkForestDepths: [ 
                {
                    x: [1], // Valid x coordinates for transition
                    y: 2,   // Y coordinate for transition
                    destination: { x: 2, y: 2 }  // Position on the dark forest depths map
                },
            ]
        };
        
        // Map representation - 1 is wall, 0 is walkable
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
            [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
            [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
            [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        // Add dragon NPCs to the lair
        this.npcs = [
            // Mini dragons guarding the entrance
            new DragonNPC({ x: 4, y: 2, name: "Young Dragon", color: "#A52A2A" }),
            new DragonNPC({ x: 9, y: 3, name: "Fire Drake", color: "#B22222" }),
            
            // Mini dragons in the middle area
            new DragonNPC({ x: 3, y: 6, name: "Cave Wyvern", color: "#8B0000" }),
            new DragonNPC({ x: 8, y: 7, name: "Ember Serpent", color: "#CD5C5C" }),
            
            // Boss dragon in the center of the bottom chamber
            new DragonBossNPC({ x: 8, y: 11, name: "Ancient Inferno" }),
            
            // Treasure chest near the boss
            new ChestNPC({ x: 8, y: 9, name: "Dragon's Treasure" }),
        ];

        // Add a fog effect for the dragon lair atmosphere
        this.addEffect(new FogEffect({
            opacity: 0.5,
            color: '#661111',  // Reddish fog
            density: 3,
            speed: 1.5,
            cloudSize: 0.7
        }));
    }
    
    // Override the background drawing to create a volcanic look
    drawBackground(ctx) {
        // Dark volcanic background
        ctx.fillStyle = '#220000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw some lava cracks
        this._drawLavaCracks(ctx);
    }
    
    /**
     * Draws decorative lava cracks in the background
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    _drawLavaCracks(ctx) {
        // Set lava color
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        
        // Draw random lava cracks
        const crackCount = 15;
        const maxCrackSegments = 8;
        
        for (let i = 0; i < crackCount; i++) {
            const startX = Math.random() * ctx.canvas.width;
            const startY = Math.random() * ctx.canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            let currentX = startX;
            let currentY = startY;
            
            for (let j = 0; j < maxCrackSegments; j++) {
                // Randomly move in a direction
                const angle = Math.random() * Math.PI * 2;
                const length = 20 + Math.random() * 30;
                
                currentX += Math.cos(angle) * length;
                currentY += Math.sin(angle) * length;
                
                ctx.lineTo(currentX, currentY);
            }
            
            ctx.stroke();
        }
    }

    update(player, deltaTime) {
        // First call the parent class update method to handle NPCs
        super.update(player, deltaTime);
        
        // Add custom dragon lair update logic here if needed
    }
}
