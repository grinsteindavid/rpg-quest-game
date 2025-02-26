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
        this.drawBackground(ctx);
        this.drawAllTiles(ctx);
        this.drawAllExits(ctx);
        this.drawMapName(ctx);
    }

    drawBackground(ctx) {
        ctx.fillStyle = SPRITES.PATH;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    drawAllTiles(ctx) {
        const offset = this.getMapOffset();
        
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                const posX = x * this.tileSize + offset.x;
                const posY = y * this.tileSize + offset.y;
                const type = this.mapData[y][x];
                
                this.drawTile(ctx, type, posX, posY);
                
                if (this.debug) {
                    this.drawDebugTile(ctx, type, posX, posY);
                }
            }
        }
    }

    drawAllExits(ctx) {
        if (!this.transitions) return;

        const offset = this.getMapOffset();
        for (const [mapName, transition] of Object.entries(this.transitions)) {
            this.drawExit(ctx, mapName, transition, offset);
        }
    }

    drawExit(ctx, mapName, transition, offset) {
        const colors = this.getExitColors(mapName);
        
        for (const x of transition.x) {
            const screenX = x * this.tileSize + offset.x;
            const screenY = transition.y * this.tileSize + offset.y;
            
            this.drawExitBase(ctx, screenX, screenY, colors.primary);
            this.drawExitArrow(ctx, screenX, screenY, transition.y, colors.pattern);
        }
    }

    getExitColors(mapName) {
        const colorSchemes = {
            forest: {
                primary: '#1a472a',
                pattern: '#2d5a27'
            },
            hometown: {
                primary: '#8b4513',
                pattern: '#a0522d'
            }
        };
        
        return colorSchemes[mapName] || { primary: '#666', pattern: '#999' };
    }

    drawExitBase(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    drawExitArrow(ctx, x, y, transitionY, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        const mid = this.tileSize / 2;
        const arrowSize = this.tileSize / 3;
        
        if (transitionY === 0) { // Top exit
            this.drawUpArrow(ctx, x, y, mid, arrowSize);
        } else if (transitionY === this.mapData.length - 1) { // Bottom exit
            this.drawDownArrow(ctx, x, y, mid, arrowSize);
        }
        
        ctx.closePath();
        ctx.fill();
    }

    drawUpArrow(ctx, x, y, mid, arrowSize) {
        ctx.moveTo(x + mid, y + arrowSize);
        ctx.lineTo(x + mid + arrowSize, y + this.tileSize - arrowSize);
        ctx.lineTo(x + mid - arrowSize, y + this.tileSize - arrowSize);
    }

    drawDownArrow(ctx, x, y, mid, arrowSize) {
        ctx.moveTo(x + mid, y + this.tileSize - arrowSize);
        ctx.lineTo(x + mid + arrowSize, y + arrowSize);
        ctx.lineTo(x + mid - arrowSize, y + arrowSize);
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
