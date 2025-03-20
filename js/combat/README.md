# Combat System

The combat system for this RPG game handles all interactions involving combat between the player and NPCs. This directory contains the core components responsible for managing health, damage, attacks, and combat animations.

## Components

### PlayerCombat Class

Located in `player.js`, this class manages the player's combat capabilities:

- **Health Management**: Tracks player health points, handles damage and healing
- **Attack System**: Allows the player to attack nearby aggressive NPCs
- **Invulnerability**: Provides temporary invulnerability after taking damage
- **Cooldowns**: Manages attack cooldowns to balance gameplay
- **Visual Feedback**: Displays health bars and damage numbers

### CombatSystem Class (for NPCs)

Located in `npc.js`, this class handles combat for non-player characters:

- **Health System**: Manages NPC health and damage states
- **AI Attacks**: Controls when and how NPCs attack the player
- **Attack Range**: Determines the distance at which NPCs can attack
- **Visual Effects**: Shows damage effects and animations

## Key Features

- **Health Bars**: Dynamic health bars appear when entities take damage
- **Animation System**: Visual feedback for hits, damage, and healing
- **Directional Combat**: Entities face their target when attacking
- **Configurable Parameters**: Easy adjustment of health, damage, and cooldowns

## Usage Example

```javascript
// Player attacking an NPC
player.attack(20, 40); // Deal 20 damage with a range of 40 pixels

// NPC taking damage
npc.takeDamage(15); // NPC takes 15 damage

// Healing the player
player.heal(10); // Player heals for 10 health points
```

## Integration

The combat system integrates with other game systems via:

- The main `Game` class which manages game state
- Map systems that contain NPCs and manage their behaviors
- Animation systems for visual feedback
- UI components for health bars and other visual elements

## Customization

Adjust the following parameters to customize combat difficulty:

- `maxHealth`: Maximum health points
- `attackDamage`: Base damage per attack
- `attackCooldown`: Time between attacks (milliseconds)
- `attackRange`: Range of attacks in pixels
- `invulnerabilityDuration`: How long entities remain invulnerable after damage
