import { COLORS } from '../colors.js';
import { BaseMap } from './BaseMap.js';
import { MonsterNPC } from '../npcs/MonsterNPC.js';

export class ForestMap extends BaseMap {
    constructor() {
        super('Dark Forest');
        
        this.mapColors = {
            primary: '#1a3300',  // Dark green for forest
            pattern: '#0d1a00'   // Even darker green for pattern
        };
        
        // Define transition points
        this.transitions = {
            hometown: {
                x: [2, 4], // Valid x coordinates for transition
                y: 1,         // Y coordinate for transition
                destination: { x: 4, y: 1 }  // Updated: Move to hometown's south exit
            }
        };
        
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        // Add monster NPCs to the forest
        this.npcs = [
            new MonsterNPC({ x: 5, y: 4, name: "Forest Monster" }),  // Center monster
            new MonsterNPC({ x: 10, y: 8, name: "Dark Lurker" }), // Right side monster
            new MonsterNPC({ x: 2, y: 8, name: "Shadow Beast" })   // Bottom left monster
        ];
    }
    
    update(player, deltaTime) {
        // Update all NPCs
        for (const npc of this.npcs) {
            if (typeof npc.update === 'function') {
                // Pass this map instance to the NPC for collision detection
                npc.update(player, deltaTime, this);
            }
        }
    }
}
