import { BaseNPC } from './BaseNPC.js';
import { SPRITES } from '../colors.js';

export class MerchantNPC extends BaseNPC {
    constructor({ x, y, name = "Merchant" }) {
        super({ x, y, name });
        

        this.conversations = [
            [
                "Welcome to my shop, traveler!",
                "I'm afraid we're not quite open yet...",
                "But soon I'll have many wonderful items for sale!",
                "Come back later when we're fully set up."
            ],
            [
                "Still setting up the shop...",
                "Running a business isn't easy, you know!",
                "But it'll be worth the wait, I promise!"
            ],
            [
                "Ah, you again! Still working on inventory...",
                "A good merchant never rushes quality!",
                "Check back in another time!"
            ]
        ];
    }

    _renderNPC(ctx, screenX, screenY) {
        // Custom merchant appearance
        // Body with robe
        ctx.fillStyle = '#4a90e2';  // Blue robe
        ctx.fillRect(screenX + 6, screenY + 8, 20, 20);

        // Face
        ctx.fillStyle = SPRITES.PLAYER.skin;
        ctx.fillRect(screenX + 8, screenY + 4, 16, 16);

        // Hat
        ctx.fillStyle = '#c0392b';  // Red hat
        ctx.fillRect(screenX + 6, screenY + 2, 20, 4);
        
        // Beard
        ctx.fillStyle = '#7f8c8d';  // Grey beard
        ctx.fillRect(screenX + 8, screenY + 14, 16, 6);

        // Use centralized name rendering method
        this._renderName(ctx, screenX, screenY);
    }
}
