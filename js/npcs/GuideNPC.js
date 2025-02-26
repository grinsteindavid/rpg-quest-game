import { BaseNPC } from './BaseNPC.js';

export class GuideNPC extends BaseNPC {
    constructor(x, y) {
        super(x, y, "Guide");
        this.dialogIndex = 0;
        this.dialogues = [
            "Welcome to our little town!",
            "Use WASD or arrow keys to move around.",
            "Press E near NPCs to talk to them.",
            "Press E or SPACE to continue dialog.",
            "You can exit to the forest through the north path.",
            "Come talk to me again if you need more help!"
        ];
    }

    interact(player) {
        const message = this.dialogues[this.dialogIndex];
        player.game.showDialog(message);
        this.dialogIndex = (this.dialogIndex + 1) % this.dialogues.length;
    }

    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        // Custom appearance for guide
        this._renderNPC(ctx, screenX, screenY);
        
        // Add special marker for guide
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY - 8);
        ctx.lineTo(screenX + 21, screenY - 18);
        ctx.lineTo(screenX + 11, screenY - 18);
        ctx.closePath();
        ctx.fill();

        this._renderDebug(ctx, screenX, screenY);
    }
}
