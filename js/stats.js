/**
 * Stats.js
 * Simple stats system for player and NPC entities.
 * Handles core stats (strength, vitality) and provides methods to calculate derived stats (damage, health).
 * Includes systems for global buffs/debuffs with timers.
 */

export class Stats {
    /**
     * Creates a new Stats instance with base values.
     * @param {Object} options - Configuration options
     * @param {Object} options.strength - Strength stat configuration
     * @param {number} options.strength.value - Base strength value (default: 5)
     * @param {number} options.strength.modifier - Permanent modifier (default: 0)
     * @param {Object} options.vitality - Vitality stat configuration
     * @param {number} options.vitality.value - Base vitality value (default: 5)
     * @param {number} options.vitality.modifier - Permanent modifier (default: 0)
     * @param {Object} options.damage - Damage configuration
     * @param {number} options.damage.base - Base damage before stats (default: 10)
     * @param {number} options.damage.strengthMultiplier - How much strength affects damage (default: 2)
     * @param {Object} options.health - Health configuration
     * @param {number} options.health.base - Base health before stats (default: 100)
     * @param {number} options.health.vitalityMultiplier - How much vitality affects health (default: 10)
     */
    constructor(options = {}) {
        // Initialize stat objects with defaults
        this.stats = {
            strength: {
                value: options.strength?.value || 5,
                modifier: options.strength?.modifier || 0
            },
            vitality: {
                value: options.vitality?.value || 5,
                modifier: options.vitality?.modifier || 0
            }
        };
        
        // Configure damage calculation
        this.damage = {
            base: options.damage?.base || 10,
            strengthMultiplier: options.damage?.strengthMultiplier || 2
        };
        
        // Configure health calculation
        this.health = {
            base: options.health?.base || 100,
            vitalityMultiplier: options.health?.vitalityMultiplier || 10
        };
        
        // Global buffs collection - each buff can affect multiple stats
        this.buffs = [];
        
        // Last update timestamp for buff duration tracking
        this.lastUpdateTime = Date.now();
    }
    
    /**
     * Gets the total value of a stat including all applicable buffs.
     * @param {string} statName - Name of the stat ('strength', 'vitality')
     * @returns {number} - Total stat value
     */
    getStat(statName) {
        if (!this.stats[statName]) return 0;
        
        // Start with base value + permanent modifier
        let total = this.stats[statName].value + this.stats[statName].modifier;
        
        // Add all buff effects that apply to this stat
        this.buffs.forEach(buff => {
            if (buff.effects[statName]) {
                total += buff.effects[statName];
            }
        });
        
        return total;
    }
    
    /**
     * Increases or decreases a stat's base value.
     * @param {string} statName - Name of the stat to modify ('strength', 'vitality')
     * @param {number} amount - Amount to change (positive to increase, negative to decrease)
     */
    modifyStat(statName, amount) {
        if (this.stats[statName]) {
            this.stats[statName].value += amount;
        }
    }
    
    /**
     * Sets a stat's base value directly.
     * @param {string} statName - Name of the stat to set ('strength', 'vitality')
     * @param {number} value - New value for the stat
     */
    setStat(statName, value) {
        if (this.stats[statName]) {
            this.stats[statName].value = value;
        }
    }
    
    /**
     * Adds a permanent modifier to a stat (from equipment, etc).
     * @param {string} statName - Name of the stat to modify ('strength', 'vitality')
     * @param {number} modifier - Modifier value (can be positive or negative)
     */
    setModifier(statName, modifier) {
        if (this.stats[statName]) {
            this.stats[statName].modifier = modifier;
        }
    }
    
    /**
     * Applies a buff that can affect multiple stats at once.
     * @param {Object} effects - Object mapping stat names to buff values (e.g., {strength: 5, vitality: 3})
     * @param {number} duration - Duration in milliseconds
     * @param {string} name - Name of the buff/debuff
     * @param {boolean} isDebuff - Whether this effect is negative (debuff)
     * @returns {string} - ID of the buff/debuff for tracking
     */
    applyBuff(effects, duration, name = 'Effect', isDebuff = false) {
        // Generate unique ID
        const id = `buff_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const buff = {
            id,
            name,
            effects,           // Object mapping stat names to values
            duration,          // Duration in milliseconds
            isDebuff,          // Whether this is a positive or negative effect
            startTime: Date.now(),
            expiryTime: Date.now() + duration
        };
        
        // Add to global buffs array
        this.buffs.push(buff);
        
        return id;
    }
    
    /**
     * Shorthand to apply a buff to a single stat.
     * @param {string} statName - Name of the stat to buff/debuff
     * @param {number} value - Buff/debuff amount (positive or negative)
     * @param {number} duration - Duration in milliseconds
     * @param {string} name - Name of the effect
     * @returns {string} - ID of the buff/debuff for tracking
     */
    applySingleStatBuff(statName, value, duration, name = 'Effect') {
        const effects = {};
        effects[statName] = value;
        const isDebuff = value < 0;
        
        return this.applyBuff(effects, duration, name, isDebuff);
    }
    
    /**
     * Removes a specific buff/debuff by ID.
     * @param {string} buffId - ID of the buff/debuff to remove
     * @returns {boolean} - Whether the buff was found and removed
     */
    removeBuff(buffId) {
        const index = this.buffs.findIndex(buff => buff.id === buffId);
        
        if (index !== -1) {
            this.buffs.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Updates all buffs, removing expired ones.
     * Should be called in game update loop.
     */
    update() {
        const currentTime = Date.now();
        
        // Remove expired buffs
        this.buffs = this.buffs.filter(buff => currentTime < buff.expiryTime);
        
        this.lastUpdateTime = currentTime;
    }
    
    /**
     * Calculates total damage based on strength.
     * @returns {number} - Total damage with strength factored in
     */
    calculateDamage() {
        const strengthValue = this.getStat('strength');
        return this.damage.base + (strengthValue * this.damage.strengthMultiplier);
    }
    
    /**
     * Calculates max health based on vitality.
     * @returns {number} - Total health with vitality factored in
     */
    calculateMaxHealth() {
        const vitalityValue = this.getStat('vitality');
        return this.health.base + (vitalityValue * this.health.vitalityMultiplier);
    }
    
    /**
     * Gets all active buffs.
     * @returns {Array} - Array of all active buffs with details
     */
    getAllBuffs() {
        const currentTime = Date.now();
        
        return this.buffs.map(buff => ({
            id: buff.id,
            name: buff.name,
            effects: { ...buff.effects }, // Copy of effects object
            isDebuff: buff.isDebuff,
            remainingTime: Math.max(0, buff.expiryTime - currentTime)
        }));
    }
    
    /**
     * Gets the current stats as an object.
     * @returns {Object} - Object containing all stats and buffs
     */
    getStats() {
        return {
            strength: this.getStat('strength'),
            vitality: this.getStat('vitality'),
            damage: this.calculateDamage(),
            maxHealth: this.calculateMaxHealth(),
            activeBuffs: this.getAllBuffs()
        };
    }
    
    /**
     * Clears all temporary buffs.
     */
    clearAllBuffs() {
        this.buffs = [];
    }
}
