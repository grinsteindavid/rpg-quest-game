import { BaseMap } from './BaseMap.js';

export class HomeTownMap extends BaseMap {
    constructor() {
        super('Home Town');
        
        // Define transition points
        this.transitions = {
            forest: {
                x: [5, 6], // Valid x coordinates for transition
                y: 8,      // Y coordinate for transition
                type: 'exit',
                destination: { x: 2, y: 1 }  // Updated: Move to forest's north exit
            }
        };
        
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1]  // Added exit at the bottom
        ];
    }

    getInitialPlayerPosition() {
        return {
            x: 4 * this.tileSize,
            y: 4 * this.tileSize
        };
    }
}
