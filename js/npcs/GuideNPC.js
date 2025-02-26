import { BaseNPC } from './BaseNPC.js';

export class GuideNPC extends BaseNPC {
    constructor(x, y) {
        super(x, y, "Guide");
        this.conversationIndex = 0;
        this.conversations = [
            [
                "Hello there! Welcome to our little town!",
                "I'll be your guide here.",
                "First, let me explain the controls...",
                "Use WASD or arrow keys to move around.",
                "Press E near NPCs like me to talk.",
                "You're doing great! Keep pressing E or Space to continue..."
            ],
            [
                "Ah, you're back!",
                "Looking for directions?",
                "You can exit to the forest through the north path.",
                "But be careful, it can be dangerous out there!"
            ],
            [
                "Need a refresher on the controls?",
                "WASD or Arrows to move",
                "E to interact with NPCs and objects",
                "Space or E to continue dialogues",
                "Come back if you need more help!"
            ]
        ];
    }

    interact(player) {
        const currentConversation = this.conversations[this.conversationIndex];
        player.game.showDialog(currentConversation, () => {
            // Move to next conversation set when current one completes
            this.conversationIndex = (this.conversationIndex + 1) % this.conversations.length;
        });
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
