import { COLORS } from '../../colors.js';
import { BaseMap } from '../BaseMap.js';
import { ChestNPC } from '../../npcs/ChestNPC.js';
import { GhostNPC } from '../../npcs/GhostNPC.js';
import { FogEffect } from '../../effects/FogEffect.js';
import { RainEffect } from '../../effects/RainEffect.js';

export class DepthsDarkForestMap extends BaseMap {
    constructor(config = {}) {
        super({
            name: 'Dark Forest - Depths',
            game: config.game || null,
            colors: {
                primary: COLORS.DARK_GREEN,  // Dark green for forest
                pattern: COLORS.DARKER_GREEN   // Even darker green for pattern
            }
        });

        
        // Define transition points
        this.transitions = {
            darkForest: [ 
                {
                    x: [2], // Valid x coordinates for transition
                    y: 1,         // Y coordinate for transition
                    destination: { x: 12, y: 3 }  // Updated: Move to hometown's south exit
                },
            ],
            dragonLair: [ 
                {
                    x: [1], // Valid x coordinates for transition
                    y: 3,         // Y coordinate for transition
                    destination: { x: 1, y: 2 }  // Move to the dragon lair entrance
                },
            ]
        };
        
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
            [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        // Add monster NPCs to the forest
        this.npcs = [
            new GhostNPC({ x: 5, y: 4, name: "Wandering Spirit" }),  // Center monster
            new GhostNPC({ x: 10, y: 8, name: "Wandering Spirit" }), // Right side monster
            new GhostNPC({ x: 2, y: 8, name: "Wandering Spirit" }),   // Bottom left monster
            new ChestNPC({ x: 11, y: 1, name: "Chest" }), // Bottom right chest
        ];

        // Add a rain effect 
        this.addEffect(new RainEffect({
            opacity: 0.2,
            angle: 15,
            speed: 2,
            density: 0.2,
            color: '#aaddff'
        }));

        // Add a fog effect
        this.addEffect(new FogEffect({
            opacity: 0.8,
            color: '#334433',
            density: 4,
            speed: 2,
            cloudSize: 0.8
        }));
    }
    

    update(player, deltaTime) {
        // First call the parent class update method to handle NPCs
        super.update(player, deltaTime);
        
        // Then add custom forest map update logic here
    }
}
