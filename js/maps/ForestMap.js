import { COLORS } from '../colors.js';
import { BaseMap } from './BaseMap.js';
import { MonsterNPC } from '../npcs/MonsterNPC.js';

export class ForestMap extends BaseMap {
    constructor() {
        super('Dark Forest');
        
        this.mapColors = {
            primary: COLORS.DARK_GREEN,  // Dark green for forest
            pattern: COLORS.DARKER_GREEN   // Even darker green for pattern
        };
        
        // Define transition points
        this.transitions = {
            hometown: [ 
                {
                    x: [2], // Valid x coordinates for transition
                    y: 1,         // Y coordinate for transition
                    destination: { x: 4, y: 6 }  // Updated: Move to hometown's south exit
                },      
                {
                    x: [4], // Valid x coordinates for transition
                    y: 1,         // Y coordinate for transition
                    destination: { x: 6, y: 6 }  // Updated: Move to hometown's south exit
                }
            ]
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
        // First call the parent class update method to handle NPCs
        super.update(player, deltaTime);
        
        // Then add custom forest map update logic here
    }
}
