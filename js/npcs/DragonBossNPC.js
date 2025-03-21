import { DragonNPC } from './DragonNPC.js';

/**
 * Dragon boss class, extending the basic dragon with enhanced abilities
 * and more challenging combat mechanics
 */
export class DragonBossNPC extends DragonNPC {
    constructor({ x, y, name = "Ancient Dragon" }) {
        // Initialize with larger size and different color
        super({ x, y, name, color: "#800000", size: 2 });
        
        // Boss-specific properties
        this.isMoving = false;
        this.moveCooldown = 5000; // Time between movements
        this.nextMoveTime = 0;

        
        // Update combat system for boss
        this.combatSystem.stats.setStat('strength', 25);  // Bosses are stronger than regular monsters
        this.combatSystem.stats.setStat('vitality', 40);  // But have more health

        
        // Special boss conversations
        this.conversations = [
            [
                "*The massive dragon's roar shakes the entire cavern*",
                "MORTAL! You have slain my children!",
                "I am the Ancient One, ruler of these mountains!",
                "Your journey ends here in flame and ash!"
            ],
            [
                "*The Ancient Dragon's eyes burn with hatred*",
                "For centuries I have guarded this realm...",
                "Your kind has always sought my treasures...",
                "AND YOUR KIND HAS ALWAYS FAILED!"
            ]
        ];
    }
    
    update(player, deltaTime, map) {
        super.update(player, deltaTime, map);
        
        // Boss-specific behaviors
        // Every few seconds, the boss may charge at the player
        const currentTime = Date.now();
        if (currentTime > this.nextMoveTime && this.isAggressive) {
            // Set the next move time
            this.nextMoveTime = currentTime + this.moveCooldown;
            
            // Special attack logic could go here
            // For example, a charge attack or fire breath
        }
    }
    
    /**
     * Called when the boss is defeated
     */
    onDefeat() {
        super.onDefeat();
        // Special victory effects could happen here
        console.log("The Ancient Dragon has been vanquished! The dragon's lair is now safe to explore.");
    }
}
