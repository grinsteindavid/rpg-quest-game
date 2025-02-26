import { COLORS, SPRITES } from './colors.js';

export class Map {
    constructor() {
        this.tileSize = 32;
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        // 0: path (walkable)
        // 1: solid (wall/obstacle)
        this.borderWidth = 4;
        this.debug = false;
    }

    isSolidTile(type) {
        return type === 1;  // Only wall tiles are solid
    }

    isWalkableTile(type) {
        return type === 0;  // Only path tiles are walkable
    }

    getMapOffset() {
        return {
            x: (800 - this.mapData[0].length * this.tileSize) / 2,
            y: (600 - this.mapData.length * this.tileSize) / 2
        };
    }

    getInitialPlayerPosition() {
        // Start in a known empty spot, aligned to grid
        const tileX = 4;  // Pick a known empty tile
        const tileY = 4;
        return {
            x: tileX * this.tileSize,
            y: tileY * this.tileSize
        };
    }

    getTileAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.mapData[0].length ||
            tileY < 0 || tileY >= this.mapData.length) {
            return 1; // Return solid tile for out of bounds
        }
        
        return this.mapData[tileY][tileX];
    }

    checkCollision(x, y, width, height) {
        // Convert screen coordinates to map coordinates
        const offset = this.getMapOffset();
        const mapX = x - offset.x;
        const mapY = y - offset.y;

        // Get tile coordinates
        const tileX = Math.floor(mapX / this.tileSize);
        const tileY = Math.floor(mapY / this.tileSize);

        // Check if we're within map bounds
        if (tileX < 0 || tileY < 0 || 
            tileX >= this.mapData[0].length || 
            tileY >= this.mapData.length) {
            return true;
        }

        // Return true only for solid tiles (type 1)
        return this.isSolidTile(this.mapData[tileY][tileX]);
    }

    setDebug(debug) {
        this.debug = debug;
    }

    render(ctx) {
        // Clear background
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const offset = this.getMapOffset();

        // Draw map tiles
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const posX = x * this.tileSize + offset.x;
                const posY = y * this.tileSize + offset.y;
                const type = this.mapData[y][x];

                // Base tile
                ctx.fillStyle = type === 1 ? SPRITES.BUILDING : SPRITES.PATH;
                ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                // Debug overlay
                if (this.debug) {
                    // Fill with semi-transparent color
                    ctx.fillStyle = this.isSolidTile(type) ? 
                        'rgba(255, 0, 0, 0.3)' : 
                        'rgba(0, 255, 0, 0.3)';
                    ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

                    // Add grid lines
                    ctx.strokeStyle = this.isSolidTile(type) ? 'red' : 'green';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

                    // Add tile type text
                    ctx.fillStyle = 'white';
                    ctx.font = '10px monospace';
                    ctx.fillText(type.toString(), posX + 4, posY + 12);
                }
            }
        }
    }

    drawTile(ctx, type, posX, posY) {
        // Base tile (path)
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        // Draw solid objects
        if (type === 1) {
            ctx.fillStyle = SPRITES.BUILDING;
            ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        }
    }
}
