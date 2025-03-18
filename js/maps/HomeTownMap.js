import { BaseMap } from './BaseMap.js';
import { GuideNPC } from '../npcs/GuideNPC.js';
import { MerchantNPC } from '../npcs/MerchantNPC.js';
import { COLORS } from '../colors.js';

export class HomeTownMap extends BaseMap {
    constructor() {
        super('Home Town');
        
        this.mapColors = {
            primary: COLORS.DARK_GREEN,
            pattern: COLORS.DARKER_GREEN
        };
        
        // Define transition points
        this.transitions = {
            darkForest: [
                {
                    x: [4], // Valid x coordinates for transition
                    y: 7,      // Y coordinate for transition
                    destination: { x: 2, y: 2 }  // Updated: Move to forest's north exit
                },
                {
                    x: [6], // Valid x coordinates for transition
                    y: 7,      // Y coordinate for transition
                    destination: { x: 4, y: 2 }  // Updated: Move to forest's north exit
                }
            ]
        };
        
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1]
        ];

        this.npcs = [
            new GuideNPC({ x: 2, y: 4, name: "Town Guide" }),
            new MerchantNPC({ x: 8, y: 5, name: "Town Merchant" }),
        ];
    }
    
  
    update(player, deltaTime) {
        // First call the parent class update method to handle NPCs
        super.update(player, deltaTime);
        
        // Then add custom hometown map update logic here
    }
}
