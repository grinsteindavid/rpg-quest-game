import { COLORS } from '../colors.js';
import { BaseMap } from './BaseMap.js';

export class ForestMap extends BaseMap {
    constructor() {
        super('Dark Forest');
        
        this.mapColors = {
            primary: COLORS.LIGHT,
            pattern: COLORS.WHITE
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
    }
}
