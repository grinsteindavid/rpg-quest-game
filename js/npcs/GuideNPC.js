import { BaseNPC } from './BaseNPC.js';

export class GuideNPC extends BaseNPC {
    constructor({ x, y, name = "Guide" }) {
        super({ x, y, name, canMove: true, canMoveThruWalls: false });
        this.followPlayer = true;
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
}
