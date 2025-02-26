import { BaseMap } from './BaseMap.js';

export class ForestMap extends BaseMap {
    constructor() {
        super('Dark Forest');
        
        this.mapColors = {
            primary: '#1a472a',    // Dark forest green
            pattern: '#2d5a27'     // Lighter forest green
        };
        
        // Define transition points
        this.transitions = {
            hometown: {
                x: [2, 4], // Valid x coordinates for transition
                y: 1,         // Y coordinate for transition
                type: 'exit',
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
    }

    getInitialPlayerPosition() {
        return {
            x: 2 * this.tileSize,
            y: 8 * this.tileSize
        };
    }

    getColors() {
        return this.mapColors;
    }
}
