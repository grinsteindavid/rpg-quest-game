import { BaseMap } from './BaseMap.js';
import { GuideNPC } from '../npcs/GuideNPC.js';
import { MerchantNPC } from '../npcs/MerchantNPC.js';
import { COLORS } from '../colors.js';

export class HomeTownMap extends BaseMap {
    constructor() {
        super('Home Town');
        
        this.mapColors = {
            primary: COLORS.LIGHT,
            pattern: COLORS.WHITE
        };
        
        // Define transition points
        this.transitions = {
            forest: {
                x: [4, 5], // Valid x coordinates for transition
                y: 0,      // Y coordinate for transition
                destination: { x: 2, y: 2 }  // Updated: Move to forest's north exit
            }
        };
        
        this.mapData = [
            [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.npcs = [
            new GuideNPC({ x: 2, y: 4, name: "Town Guide" }),
            new MerchantNPC({ x: 8, y: 5, name: "Town Merchant" }),
            new GuideNPC({ x: 3, y: 2, name: "North Guide" }),
        ];
    }
}
