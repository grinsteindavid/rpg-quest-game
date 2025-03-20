# NPC System

This directory contains the non-player character (NPC) implementation for the RPG game, providing a variety of interactive characters including merchants, quest givers, monsters, and bosses.

## Components

### BaseNPC Class

Located in `BaseNPC.js`, this is the foundation for all NPCs:

- **Movement System**: Controls NPC movement patterns and behavior
- **Interaction**: Handles player interactions with dialog and actions
- **Rendering**: Manages the visual representation of NPCs
- **State Management**: Controls NPC state and behavior patterns

### NPC Types

#### Non-Combatant NPCs

- **GuideNPC** (`GuideNPC.js`): Tutorial characters that provide guidance
- **MerchantNPC** (`MerchantNPC.js`): Shop owners for buying/selling items

#### Interactive Objects

- **ChestNPC** (`ChestNPC.js`): Treasure chests that contain loot and rewards

#### Enemy NPCs

- **MonsterNPC** (`MonsterNPC.js`): Common enemy encounters
- **GhostNPC** (`GhostNPC.js`): Special enemy with unique behaviors
- **DragonNPC** (`DragonNPC.js`): Powerful standard dragon enemies
- **DragonBossNPC** (`DragonBossNPC.js`): End-game boss with special abilities

## Key Features

- **AI Behavior**: Different movement and targeting patterns
- **Combat Integration**: Enemies connect with the combat system
- **Dialog System**: Conversation support for non-combat NPCs
- **Loot System**: Rewards and item drops from defeated enemies

## Usage Example

```javascript
// Creating a merchant NPC
const shopkeeper = new MerchantNPC({
  x: 5, 
  y: 3,
  name: 'Village Shopkeeper',
});
shopkeeper.movementSystem.speed = 1;

// Creating a monster NPC
const troll = new MonsterNPC({
  x: 15, 
  y: 12,
  name: 'Forest Troll',
});
troll.combatSystem.attackDamage = 25;
troll.combatSystem.attackRange = 2;
troll.aggressive = true;
```

## Integration

NPCs are integrated with:

- The map system for placement and movement
- The combat system for enemy encounters
- The dialog system for character interactions
- The quest and progression systems

## Customization

Create custom NPCs by extending the appropriate base class and implementing:

- Specialized behavior patterns and AI
- Unique dialog and interaction options
- Custom combat abilities for enemies
- Special loot and rewards
