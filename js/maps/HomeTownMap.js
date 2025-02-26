import { BaseMap } from './BaseMap.js';
import { GuideNPC } from '../npcs/GuideNPC.js';
import { MerchantNPC } from '../npcs/MerchantNPC.js';
import { COLORS } from '../colors.js';

export class HomeTownMap extends BaseMap {
    constructor() {
        super('Home Town');
        
        this.mapColors = {
            primary: '#8b4513',    // Saddle brown
            pattern: '#a0522d'     // Sienna
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
            new GuideNPC(2, 4),
            new MerchantNPC(8, 5)  // Add Merchant NPC here (adjust position as needed)
        ];
    }

    getInitialPlayerPosition() {
        return {
            x: 4 * this.tileSize,
            y: 4 * this.tileSize
        };
    }

    getColors() {
        return {
            primary: COLORS.LIGHT,
            pattern: COLORS.WHITE
        };
    }

    // Add NPC rendering to the map's render method
    render(ctx) {
        super.render(ctx);
        const mapOffset = this.getMapOffset();
        
        // Render all NPCs
        this.npcs.forEach(npc => {
            npc.setDebug(this.debug);
            npc.render(ctx, mapOffset);
        });
    }

    // Helper method to find nearby NPCs
    getNearbyNPC(player) {
        return this.npcs.find(npc => npc.isNearby(player));
    }
}
