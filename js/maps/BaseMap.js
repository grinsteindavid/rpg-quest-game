import { COLORS, SPRITES } from '../colors.js';

export class BaseMap {
    constructor(name) {
        this.name = name;
        this.tileSize = 32;
        this.borderWidth = 4;
        this.debug = false;
    }

    getMapOffset() {
        return {
            x: (800 - this.mapData[0].length * this.tileSize) / 2,
            y: (600 - this.mapData.length * this.tileSize) / 2
        };
    }

    isSolidTile(type) {
        return type === 1;
    }

    isWalkableTile(type) {
        return type === 0;
    }

    getTileAt(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.mapData[0].length ||
            tileY < 0 || tileY >= this.mapData.length) {
            return 1;
        }
        
        return this.mapData[tileY][tileX];
    }

    checkCollision(x, y, width, height) {
        const offset = this.getMapOffset();
        const mapX = x - offset.x;
        const mapY = y - offset.y;
        const tileX = Math.floor(mapX / this.tileSize);
        const tileY = Math.floor(mapY / this.tileSize);

        if (tileX < 0 || tileY < 0 || 
            tileX >= this.mapData[0].length || 
            tileY >= this.mapData.length) {
            return true;
        }

        return this.isSolidTile(this.mapData[tileY][tileX]);
    }

    setDebug(debug) {
        this.debug = debug;
    }

    drawMapName(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, ctx.canvas.width / 2, 30);
        ctx.restore();
    }

    render(ctx) {
        // Draw base map
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const offset = this.getMapOffset();

        // Draw regular tiles and debug info together
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const posX = x * this.tileSize + offset.x;
                const posY = y * this.tileSize + offset.y;
                const type = this.mapData[y][x];
                
                // Draw base tile
                this.drawTile(ctx, type, posX, posY);
                
                // Draw debug info if enabled
                if (this.debug) {
                    this.drawDebugTile(ctx, type, posX, posY);
                }
            }
        }

        // Draw exits with special styling
        if (this.transitions) {
            for (const [mapName, transition] of Object.entries(this.transitions)) {
                // Different colors for different destinations
                const colors = {
                    forest: {
                        primary: '#1a472a',    // Dark forest green
                        pattern: '#2d5a27'     // Lighter forest green
                    },
                    hometown: {
                        primary: '#8b4513',    // Saddle brown
                        pattern: '#a0522d'      // Sienna
                    }
                };

                const exitColor = colors[mapName] || { primary: '#666', pattern: '#999' };
                
                for (const x of transition.x) {
                    const screenX = x * this.tileSize + offset.x;
                    const screenY = transition.y * this.tileSize + offset.y;
                    
                    // Draw base exit tile
                    ctx.fillStyle = exitColor.primary;
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    
                    // Draw arrow pattern
                    ctx.fillStyle = exitColor.pattern;
                    ctx.beginPath();
                    const mid = this.tileSize / 2;
                    const arrowSize = this.tileSize / 3;
                    
                    // Draw directional arrow based on exit position
                    if (transition.y === 0) { // Top exit
                        ctx.moveTo(screenX + mid, screenY + arrowSize);
                        ctx.lineTo(screenX + mid + arrowSize, screenY + this.tileSize - arrowSize);
                        ctx.lineTo(screenX + mid - arrowSize, screenY + this.tileSize - arrowSize);
                    } else if (transition.y === this.mapData.length - 1) { // Bottom exit
                        ctx.moveTo(screenX + mid, screenY + this.tileSize - arrowSize);
                        ctx.lineTo(screenX + mid + arrowSize, screenY + arrowSize);
                        ctx.lineTo(screenX + mid - arrowSize, screenY + arrowSize);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        this.drawMapName(ctx);
    }

    drawTile(ctx, type, posX, posY) {
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        if (type === 1) {
            ctx.fillStyle = SPRITES.BUILDING;
            ctx.fillRect(posX, posY, this.tileSize, this.tileSize);
        }
    }

    drawDebugTile(ctx, type, posX, posY) {
        ctx.fillStyle = this.isSolidTile(type) ? 
            'rgba(255, 0, 0, 0.3)' : 
            'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(posX, posY, this.tileSize, this.tileSize);

        ctx.strokeStyle = this.isSolidTile(type) ? 'red' : 'green';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(type.toString(), posX + 4, posY + 12);
    }
}
