import { SPRITES } from '../colors.js';

export class BaseNPC {
    constructor(x, y, name) {
        this.x = x * 32; // Convert tile position to pixels
        this.y = y * 32;
        this.width = 32;
        this.height = 32;
        this.name = name;
        this.direction = 'down';
        this.debug = false;

        // Marker properties
        this.showMarker = true;
        this.markerOffset = 0;
        this.markerSpeed = 0.1;
        this.markerTime = 0;

        // Conversation properties
        this.conversationIndex = 0;
        this.isInConversation = false;
        this.conversations = [["Hello!"]]; // Default conversation
    }

    setDebug(debug) {
        this.debug = debug;
    }

    interact(player) {
        if (!this.isInConversation) {
            this.isInConversation = true;
            const currentConversation = this.conversations[this.conversationIndex];
            player.game.showDialog(currentConversation, () => {
                this.isInConversation = false;
                if (this.conversationIndex === 0) {
                    this.showMarker = false;
                }
                this.conversationIndex = (this.conversationIndex + 1) % this.conversations.length;
                this.onConversationComplete?.();
            });
        }
    }

    // Optional callback for subclasses
    onConversationComplete() {}

    isNearby(player) {
        const distance = Math.sqrt(
            Math.pow((player.x - this.x), 2) + 
            Math.pow((player.y - this.y), 2)
        );
        return distance <= 48; // Within 1.5 tiles
    }

    _renderNPC(ctx, screenX, screenY) {
        // Basic NPC appearance
        ctx.fillStyle = SPRITES.PLAYER.body;
        ctx.fillRect(screenX + 8, screenY + 8, 16, 20);

        ctx.fillStyle = SPRITES.PLAYER.skin;
        ctx.fillRect(screenX + 8, screenY + 4, 16, 16);

        // Draw name above NPC
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, screenY - 5);
    }

    _renderMarker(ctx, screenX, screenY) {
        if (this.showMarker) {
            this.markerTime += this.markerSpeed;
            this.markerOffset = Math.sin(this.markerTime) * 4;
            
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(screenX + 16, screenY - 8 + this.markerOffset);
            ctx.lineTo(screenX + 21, screenY - 18 + this.markerOffset);
            ctx.lineTo(screenX + 11, screenY - 18 + this.markerOffset);
            ctx.closePath();
            ctx.fill();
        }
    }

    _renderDebug(ctx, screenX, screenY) {
        if (!this.debug) return;

        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, this.height);

        // Interaction radius
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + 16, 48, 0, Math.PI * 2);
        ctx.stroke();
    }

    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
    }
}
