import { MonsterNPC } from './MonsterNPC.js';

/**
 * Dragon NPC class that extends the monster NPC with dragon-specific
 * properties and rendering
 */
export class DragonNPC extends MonsterNPC {
    constructor({ x, y, name = "Mini Dragon", color = "#8B0000", size = 1 }) {
        // Initialize with monster capabilities
        super({ x, y, name });
        
        // Dragon-specific properties
        this.color = color;
        this.size = size; // Size multiplier (1 for mini dragon, 2 for boss)
        
        // Override monster properties for dragons
        this.attackDamage = 15 * this.size;
        this.attackRange = 50 * this.size;
        this.attackCooldown = 2000 - (this.size * 300); // Bigger dragons attack faster
        
        // Update combat system for dragon
        this.combatSystem.attackDamage = this.attackDamage;
        this.combatSystem.attackRange = this.attackRange;
        this.combatSystem.attackCooldown = this.attackCooldown;
        
        // Set higher health for dragons
        this.maxHealth = 50 * this.size;
        this.health = this.maxHealth;
        
        // Dragon conversation options
        this.conversations = [
            [
                "*The dragon breathes a small burst of flame*",
                "Human... you dare enter our lair?",
                "You'll make a fine addition to our treasure hoard.",
                "Prepare to meet your doom!"
            ],
            [
                "*The dragon's eyes narrow*",
                "Your courage is admirable...",
                "But foolish. None escape the dragon's wrath!",
                "*The dragon roars and prepares to attack!*"
            ]
        ];
    }
    
    update(player, deltaTime, map) {
        // Call the MonsterNPC update method first
        super.update(player, deltaTime, map);
        
        // Add dragon-specific behaviors here
        // For example, dragons might occasionally breathe fire
        // or have special movement patterns
    }
    
    // Override the render method to draw a dragon
    _renderNPC(ctx, screenX, screenY) {
        const s = this.size; // Size multiplier
        
        // Dragon body
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX + 6/s, screenY + 8/s, 20*s, 22*s);
        
        // Dragon wings
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + 12);
        ctx.lineTo(screenX - 4*s, screenY + 12 - 4*s);
        ctx.lineTo(screenX - 2*s, screenY + 20);
        ctx.lineTo(screenX + 6, screenY + 18);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(screenX + 26, screenY + 12);
        ctx.lineTo(screenX + 36*s, screenY + 12 - 4*s);
        ctx.lineTo(screenX + 34*s, screenY + 20);
        ctx.lineTo(screenX + 26, screenY + 18);
        ctx.fill();
        
        // Dragon eyes
        const eyeGlow = `rgba(255, ${Math.floor(50 + this.glowIntensity * 100)}, 0, ${0.7 + this.glowIntensity * 0.3})`;
        ctx.fillStyle = eyeGlow;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(screenX + 11, screenY + 15, 3*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(screenX + 21, screenY + 15, 3*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Dragon horns
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(screenX + 9, screenY + 8);
        ctx.lineTo(screenX + 5, screenY - 4*s);
        ctx.lineTo(screenX + 12, screenY + 8);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(screenX + 23, screenY + 8);
        ctx.lineTo(screenX + 27, screenY - 4*s);
        ctx.lineTo(screenX + 20, screenY + 8);
        ctx.fill();
        
        // Dragon tail
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY + 30);
        ctx.lineTo(screenX + 16 + 5*s, screenY + 30 + 8*s);
        ctx.lineTo(screenX + 16 - 5*s, screenY + 30 + 8*s);
        ctx.closePath();
        ctx.fill();
        
        // Draw name above NPC
        ctx.fillStyle = this.isAggressive ? 'rgba(255, 100, 100, 0.9)' : 'rgba(200, 200, 200, 0.9)';
        ctx.font = `${12 + 2*s}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, screenY - 5 - 5*s);
        
        // Draw glow effect when aggressive
        if (this.isAggressive) {
            const radius = (20 + this.glowIntensity * 10) * s;
            const gradient = ctx.createRadialGradient(
                screenX + 16, screenY + 16, 5*s,
                screenX + 16, screenY + 16, radius
            );
            gradient.addColorStop(0, `rgba(255, 100, 0, ${0.3 * this.glowIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 16, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Override takeDamage to add dragon-specific effects
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} - Whether the dragon was defeated
     */
    takeDamage(amount) {
        // Dragons take less damage than regular monsters
        const reducedDamage = Math.max(1, Math.floor(amount * 0.8));
        return super.takeDamage(reducedDamage);
    }
    
    /**
     * Called when the dragon is defeated (health <= 0)
     */
    onDefeat() {
        super.onDefeat();
        // Add dragon-specific death effects here
        console.log(`The ${this.name} has been slain!`);
    }
}
