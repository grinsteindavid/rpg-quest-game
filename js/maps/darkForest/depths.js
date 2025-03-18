import { COLORS } from '../../colors.js';
import { BaseMap } from '../BaseMap.js';
import { MonsterNPC } from '../../npcs/MonsterNPC.js';
import { ChestNPC } from '../../npcs/ChestNPC.js';
import { GhostNPC } from '../../npcs/GhostNPC.js';

export class DepthsDarkForestMap extends BaseMap {
    constructor() {
        super('Dark Forest - Depths');
        
        this.mapColors = {
            primary: COLORS.DARK_GREEN,  // Dark green for forest
            pattern: COLORS.DARKER_GREEN   // Even darker green for pattern
        };
        
        // Define transition points
        this.transitions = {
            darkForest: [ 
                {
                    x: [2], // Valid x coordinates for transition
                    y: 1,         // Y coordinate for transition
                    destination: { x: 12, y: 3 }  // Updated: Move to hometown's south exit
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
    }
    

    update(player, deltaTime) {
        // First call the parent class update method to handle NPCs
        super.update(player, deltaTime);
        
        // Then add custom forest map update logic here
    }
}
