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
        
        // Customize dragon name tag with dramatic appearance
        this.nameTag.font = `${11 + this.size}px Arial`;
        this.nameTag.offsetY = -10 * this.size;
        
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
    
    // Override the render method to draw a drake (four-legged dragon)
    _renderNPC(ctx, screenX, screenY) {
        const s = this.size; // Size multiplier
        const cx = screenX + 16; // Center x position
        const cy = screenY + 18; // Center y position
        
        // Save context for transformations
        ctx.save();
        
        // Draw shadow beneath drake
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 20*s, 14*s, 6*s, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Drake body - more oval shaped
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12*s, 9*s, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Drake head
        ctx.beginPath();
        ctx.ellipse(cx + 10*s, cy - 4*s, 8*s, 5*s, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Drake snout
        ctx.beginPath();
        ctx.moveTo(cx + 16*s, cy - 5*s);
        ctx.lineTo(cx + 22*s, cy - 3*s);
        ctx.lineTo(cx + 16*s, cy);
        ctx.closePath();
        ctx.fill();
        
        // Drake neck scales - slightly darker than body
        const darkerColor = this._darkenColor(this.color, 30);
        ctx.fillStyle = darkerColor;
        
        // Neck scales
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(cx + (5-i*2)*s, cy - (i*1.5)*s, 3*s, 2*s, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Spikes along back - even darker than neck scales
        const spikesColor = this._darkenColor(this.color, 60);
        ctx.fillStyle = spikesColor;
        
        // Back spikes
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - (6 + i*3)*s, cy - 4*s);
            ctx.lineTo(cx - (4 + i*3)*s, cy - 8*s);
            ctx.lineTo(cx - (2 + i*3)*s, cy - 4*s);
            ctx.fill();
        }
        
        // Drake wings - more detailed bat-like wings
        ctx.fillStyle = this._lightenColor(this.color, 30);
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(cx - 5*s, cy - 2*s); // Wing base
        ctx.bezierCurveTo(
            cx - 14*s, cy - 10*s, // Control point 1
            cx - 18*s, cy - 8*s,  // Control point 2
            cx - 16*s, cy        // End point
        );
        
        // Wing membrane details
        ctx.lineTo(cx - 10*s, cy - 2*s);
        ctx.lineTo(cx - 12*s, cy - 5*s);
        ctx.lineTo(cx - 8*s, cy - 3*s);
        ctx.lineTo(cx - 5*s, cy - 2*s);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(cx + 2*s, cy - 2*s); // Wing base
        ctx.bezierCurveTo(
            cx + 12*s, cy - 12*s, // Control point 1
            cx + 16*s, cy - 10*s, // Control point 2
            cx + 14*s, cy - 2*s  // End point
        );
        
        // Wing membrane details
        ctx.lineTo(cx + 8*s, cy - 4*s);
        ctx.lineTo(cx + 10*s, cy - 8*s);
        ctx.lineTo(cx + 6*s, cy - 5*s);
        ctx.lineTo(cx + 2*s, cy - 2*s);
        ctx.fill();
        
        // Drake legs
        ctx.fillStyle = darkerColor;
        
        // Front legs
        this._drawLeg(ctx, cx - 6*s, cy + 6*s, -0.3, s);
        this._drawLeg(ctx, cx + 6*s, cy + 6*s, 0.3, s);
        
        // Back legs
        this._drawLeg(ctx, cx - 8*s, cy + 8*s, -0.4, s * 1.2);
        this._drawLeg(ctx, cx + 8*s, cy + 8*s, 0.4, s * 1.2);
        
        // Drake tail
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(cx - 10*s, cy); // Tail start at body
        
        // Curved tail
        ctx.bezierCurveTo(
            cx - 18*s, cy + 2*s,  // Control point 1
            cx - 22*s, cy + 10*s, // Control point 2
            cx - 24*s, cy + 6*s   // Tail tip
        );
        
        ctx.bezierCurveTo(
            cx - 22*s, cy + 8*s,  // Control point 1 
            cx - 16*s, cy + 2*s,  // Control point 2
            cx - 10*s, cy + 3*s   // Back to body
        );
        
        ctx.fill();
        
        // Tail spike
        ctx.fillStyle = spikesColor;
        ctx.beginPath();
        ctx.moveTo(cx - 24*s, cy + 6*s);     // Tail tip
        ctx.lineTo(cx - 28*s, cy + 2*s);     // Spike point
        ctx.lineTo(cx - 24*s, cy + 4*s);     // Back to tail
        ctx.fill();
        
        // Drake eyes - glowing
        const eyeGlow = `rgba(255, ${Math.floor(50 + this.glowIntensity * 100)}, 0, ${0.7 + this.glowIntensity * 0.3})`;
        ctx.fillStyle = eyeGlow;
        
        // Left eye
        ctx.beginPath();
        ctx.ellipse(cx + 12*s, cy - 6*s, 2*s, 1.5*s, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils (black centers)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(cx + 12.5*s, cy - 6*s, 0.8*s, 1*s, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Drake horns
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(cx + 14*s, cy - 8*s); // Horn base
        ctx.bezierCurveTo(
            cx + 16*s, cy - 12*s, // Control point 1
            cx + 18*s, cy - 14*s, // Control point 2
            cx + 18*s, cy - 15*s  // Horn tip
        );
        ctx.lineTo(cx + 16*s, cy - 13*s); // Back edge of horn
        ctx.lineTo(cx + 14*s, cy - 8*s);  // Back to base
        ctx.fill();
        
        // Second smaller horn
        ctx.beginPath();
        ctx.moveTo(cx + 12*s, cy - 8*s); // Horn base
        ctx.bezierCurveTo(
            cx + 13*s, cy - 11*s, // Control point 1
            cx + 14*s, cy - 12*s, // Control point 2
            cx + 14*s, cy - 13*s  // Horn tip
        );
        ctx.lineTo(cx + 12*s, cy - 11*s); // Back edge of horn
        ctx.lineTo(cx + 12*s, cy - 8*s);  // Back to base
        ctx.fill();
        
        // Draw fire breath effect when aggressive
        if (this.isAggressive && Math.random() < 0.1) { // Occasional fire breath
            this._drawFireBreath(ctx, cx + 22*s, cy - 3*s, s);
        }
        
        // Name is rendered by the centralized method with proper scaling
        // Pass the centered x coordinate with different offset for proper scaling
        this._renderName(ctx, cx - 16, screenY - 10*s);
        
        // Draw glow effect when aggressive
        if (this.isAggressive) {
            const radius = (20 + this.glowIntensity * 10) * s;
            const gradient = ctx.createRadialGradient(
                cx, cy, 5*s,
                cx, cy, radius
            );
            gradient.addColorStop(0, `rgba(255, 100, 0, ${0.3 * this.glowIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Restore context
        ctx.restore();
    }
    
    /**
     * Draws a dragon leg with claws
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} angle - Angle of the leg
     * @param {number} size - Size multiplier
     */
    _drawLeg(ctx, x, y, angle, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Leg
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5*size, 5*size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Foot with three claws
        ctx.fillStyle = '#222';
        
        // Left claw
        ctx.beginPath();
        ctx.moveTo(-2*size, 4*size);
        ctx.lineTo(-4*size, 7*size);
        ctx.lineTo(-1*size, 5*size);
        ctx.fill();
        
        // Middle claw
        ctx.beginPath();
        ctx.moveTo(0, 5*size);
        ctx.lineTo(0, 8*size);
        ctx.lineTo(1.5*size, 5*size);
        ctx.fill();
        
        // Right claw
        ctx.beginPath();
        ctx.moveTo(2*size, 4*size);
        ctx.lineTo(4*size, 7*size);
        ctx.lineTo(1*size, 5*size);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Draws fire breath effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size multiplier
     */
    _drawFireBreath(ctx, x, y, size) {
        // Create gradient for fire
        const fireLength = 20 * size * (0.7 + Math.random() * 0.6);
        const gradient = ctx.createLinearGradient(x, y, x + fireLength, y);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');   // Yellow core
        gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.8)');  // Orange middle
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');      // Transparent red edge
        
        // Draw cone of fire
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + fireLength, y - fireLength/3);
        ctx.lineTo(x + fireLength, y + fireLength/3);
        ctx.closePath();
        ctx.fill();
        
        // Add some flame particles
        const particleCount = Math.floor(5 * size);
        for (let i = 0; i < particleCount; i++) {
            const particleX = x + (fireLength * 0.4) + (Math.random() * fireLength * 0.6);
            const particleY = y + (Math.random() * fireLength/2) - (fireLength/4);
            const particleSize = (1 + Math.random() * 2) * size;
            
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Lightens a color by the specified amount
     * @param {string} color - CSS color string (hex)
     * @param {number} amount - Amount to lighten (0-255)
     * @returns {string} - Lightened color
     */
    _lightenColor(color, amount) {
        return this._adjustColor(color, amount);
    }
    
    /**
     * Darkens a color by the specified amount
     * @param {string} color - CSS color string (hex)
     * @param {number} amount - Amount to darken (0-255)
     * @returns {string} - Darkened color
     */
    _darkenColor(color, amount) {
        return this._adjustColor(color, -amount);
    }
    
    /**
     * Adjusts a color by the specified amount (positive to lighten, negative to darken)
     * @param {string} color - CSS color string (hex)
     * @param {number} amount - Amount to adjust (-255 to 255)
     * @returns {string} - Adjusted color
     */
    _adjustColor(color, amount) {
        // Handle named colors by using a default
        let hex = color;
        if (color.charAt(0) !== '#') {
            // If not a hex color, default to a dark red
            hex = '#8B0000';
        }
        
        // Convert to RGB
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        // Adjust each channel
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
