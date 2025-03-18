# RPG QUEST GAME

https://grinsteindavid.github.io/rpg-quest-game/

<img width="769" alt="image" src="https://github.com/user-attachments/assets/7b20c550-f3f0-4aea-affd-e58aa9f3dec4" />

<img width="820" alt="image" src="https://github.com/user-attachments/assets/daa6745c-a525-4d12-8dac-0eaef78e739a" />

<img width="700" alt="image" src="https://github.com/user-attachments/assets/5d7372a2-8cbe-49bb-921e-b0b2968637a2" />

<img width="698" alt="image" src="https://github.com/user-attachments/assets/c19ce297-3a2b-4bf7-b52d-bfa88c5ccc20" />

<img width="360" alt="image" src="https://github.com/user-attachments/assets/10fce40c-cc6a-4f1b-9b68-15409a2d4638" />

A 2D game built with vanilla JavaScript featuring a tile-based movement system, combat mechanics, and exploration. This project demonstrates modern web game development principles through a Game Boy-inspired RPG experience.

## Game Features

- Grid-based movement system with smooth animations
- Comprehensive collision detection
- Map transitions between different areas
- Dialog system with NPC interactions
- Combat system with health management
- Monster AI with pathfinding and state management
- Debug visualization tools

### Controls
- **WASD** or **Arrow Keys**: Move character
- **E** or **Space**: Interact with NPCs / Continue dialogue
- **F** or **Left Mouse Button**: Attack (when in combat)
- **Debug Toggle**: Top-right button shows collision boxes and tile info

## Game Mechanics In-Depth

### Movement System
The movement system uses a hybrid approach:
- Grid-based positioning: Characters are aligned to a tile grid (32×32 pixels)
- Smooth transitions: When moving between tiles, characters animate smoothly rather than teleporting
- Collision detection: Checks for solid tiles, NPCs, and map boundaries
- Direction tracking: Character sprites change based on movement direction

```javascript
// Player movement logic flow
// 1. Input detection (WASD/Arrow keys)
// 2. Direction calculation
// 3. Collision detection with map tiles and NPCs
// 4. Position update if no collision
// 5. Animation update based on direction
```

### Combat System

The combat system consists of several interconnected components:

#### Player Combat
- **Health Management**: Players have `maxHealth` (100) and `currentHealth` properties
- **Attack Mechanics**: Players can attack in their facing direction
- **Damage System**: `takeDamage(amount)` method with invulnerability frames
- **Recovery System**: `heal(amount)` and `resetHealth()` methods
- **Visual Feedback**: Health bar (color-coded) and hit animations

#### NPC/Monster Combat
- **AI Behavior**: Monsters actively chase players when in range
- **Aggression States**: Toggle between passive and aggressive states
- **Attack Patterns**: Different monsters have varied attack timings and damage
- **Health System**: Similar to player, with visual indicators
- **Spawn Management**: Return to spawn area if wandered too far

### Map System

Maps are defined as classes that extend a BaseMap class:
- **Tile Types**: Different tile types (solid, walkable, transition)
- **Map Transitions**: Doorways or paths that connect different maps
- **NPC Placement**: NPCs are defined per map with specific positions
- **Visual Theming**: Each map has its own color palette and style

```javascript
// Map transition mechanism
// 1. Player position checked against transition points
// 2. If match found, current map is switched to destination map
// 3. Player is repositioned at the destination coordinates
// 4. New map loaded with its corresponding NPCs
```

### Dialog System

Interactive dialog system for engaging with NPCs:
- **Multi-message Support**: Conversations flow through multiple messages
- **NPC-specific Dialogues**: Each NPC has custom conversation sets
- **User Interaction**: Progress dialog with E/Space key
- **Visual Indicators**: Shows when more dialog is available
- **State Management**: NPCs remember conversation state

## Technical Architecture

The game is built using a modular, class-based architecture:

### Core Components
- **Game Class**: Main controller managing maps, player, and game loop
- **Player Class**: Handles player movement, rendering, and state
- **BaseMap Class**: Template for all map implementations
- **BaseNPC Class**: Foundation for all NPC types
- **InputHandler Class**: Processes keyboard and mouse input
- **Dialog Class**: Manages conversation UI and flow
- **CombatSystem Class**: Handles combat mechanics for NPCs

### Rendering Pipeline
1. Clear canvas
2. Render current map (tiles, patterns)
3. Render NPCs
4. Render player
5. Render UI elements (dialog, health bars)
6. Debug visualization (if enabled)

### Game Loop
The main game loop runs at 60fps and handles:
- Input processing
- Entity updates (player, NPCs)
- Collision detection
- Rendering
- State management

## Extending the Game

### Adding New Maps

1. Create a new JS file for your map (e.g., `NewDungeonMap.js`)
2. Extend the `BaseMap` class:

```javascript
import { BaseMap } from './BaseMap.js';
import { COLORS } from '../colors.js';

export class NewDungeonMap extends BaseMap {
    constructor() {
        super('Dungeon Name');
        
        this.mapColors = {
            primary: COLORS.DARK_GRAY,
            pattern: COLORS.BLACK
        };
        
        // Define transition points
        this.transitions = {
            hometown: [
                {
                    x: [4], // Valid x coordinates for transition
                    y: 7,   // Y coordinate for transition
                    destination: { x: 5, y: 5 }  // Player's position in destination map
                }
            ]
        };
        
        // Define map layout (0=empty, 1=solid)
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    
    // Optional: Override init method to add map-specific NPCs
    init(game) {
        super.init(game);
        // Add NPCs specific to this map
        this.npcs.push(new MonsterNPC({ x: 3, y: 3, name: "Dungeon Monster" }));
    }
}
```

3. Register your map in the `Game` class (in `game.js`):

```javascript
import { NewDungeonMap } from './maps/NewDungeonMap.js';

// Inside Game constructor:
this._maps = {
    hometown: new HomeTownMap(),
    darkForest: new ForestMap(),
    darkForestDepths: new DepthsDarkForestMap(),
    newDungeon: new NewDungeonMap()  // Add your new map
};
```

4. Add transition points in existing maps to connect to your new map.

### Creating New NPCs

1. Create a new JS file for your NPC (e.g., `DragonNPC.js`)
2. Extend the appropriate base class:

```javascript
import { BaseNPC } from './BaseNPC.js';

export class DragonNPC extends BaseNPC {
    constructor({ x, y, name = "Dragon" }) {
        // Initialize with movement capabilities
        super({ x, y, name, canMove: true, canMoveThruWalls: false });
        
        // Dragon-specific properties
        this.canBeAggressive = true;
        this.moveInterval = 40; // Slower movement than other monsters
        this.combatSystem.attackDamage = 25; // Higher damage
        this.combatSystem.attackRange = 50; // Longer attack range
        this.combatSystem.attackCooldown = 2000; // Slower attacks
        this.combatSystem.maxHealth = 200; // More health
        this.combatSystem.health = 200;
        
        // Dragon conversation options
        this.conversations = [
            [
                "*The dragon roars ferociously*",
                "You are not welcome here, human!",
                "Leave now or face my wrath!"
            ],
            [
                "*The dragon eyes you suspiciously*",
                "Few have survived an encounter with me...",
                "You are either brave or foolish."
            ]
        ];
    }
    
    // Override draw method for custom appearance
    draw(ctx, debug = false) {
        // Custom drawing code here...
        super.draw(ctx, debug);
    }
    
    // Add unique dragon behaviors
    update(game) {
        super.update(game);
        // Add dragon-specific behaviors here...
    }
}
```

3. Add your NPC to a map's init method:

```javascript
// Inside a map's init method:
this.npcs.push(new DragonNPC({ x: 5, y: 5 }));
```

### Adding New Game Mechanics

1. **Items and Inventory System**:
   - Create an `Inventory` class to manage player items
   - Implement `Item` base class with various subtypes
   - Add UI elements for inventory display
   - Modify NPCs to drop items

2. **Quest System**:
   - Create a `QuestManager` class to track active quests
   - Implement `Quest` objects with objectives and rewards
   - Modify NPCs to offer and track quest progress
   - Add UI for quest tracking

3. **Save/Load System**:
   - Implement serialization of game state to JSON
   - Use localStorage or IndexedDB for persistent storage
   - Create UI for save/load functionality

## Development

### Prerequisites
- Modern web browser
- Local web server (for development)

### Running the Game
1. Start a local web server in the project directory
2. Open `index.html` in your browser
3. Use WASD/Arrows to move, E to interact, F to attack

### Debug Mode
Click the "Debug Mode" button to see:
- Collision boundaries
- NPC interaction zones
- Map tile types
- Player direction indicator
- Health and damage values

## Contributing

Contributions are welcome! Here are some ways to enhance the game:

- Add new maps and areas to explore
- Create new monster types with unique behaviors
- Implement additional game mechanics (inventory, quests, etc.)
- Improve combat mechanics and balancing
- Enhance visual effects and animations
- Optimize performance for mobile devices
