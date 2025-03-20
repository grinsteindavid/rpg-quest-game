# RPG QUEST GAME

https://grinsteindavid.github.io/rpg-quest-game/

<img width="826" alt="image" src="https://github.com/user-attachments/assets/406c43fd-9790-449e-8949-ad4b7fa71afd" />


<img width="811" alt="image" src="https://github.com/user-attachments/assets/70239c9b-93ef-4975-ad8f-5502370e55db" />

<img width="779" alt="image" src="https://github.com/user-attachments/assets/30cb7db1-9357-4cc2-a1cc-a42d2da786d7" />

<img width="753" alt="image" src="https://github.com/user-attachments/assets/6eef37c4-5a7a-4687-b546-82e0f8f19619" />


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
- Visual effects system with fog, rain, and other environmental effects
- Animation system for entities with customizable effects
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
- **Visual Feedback**: Health bars (color-coded) and hit animations

#### NPC/Monster Combat
- **AI Behavior**: Monsters actively chase players when in range
- **Aggression States**: Toggle between passive and aggressive states
- **Attack Patterns**: Different monsters have varied attack timings and damage
- **Health System**: Similar to player, with visual indicators
- **Spawn Management**: Return to spawn area if wandered too far

### Map System

Maps are defined as classes that extend a BaseMap class:
- **Tile System**: Manages the grid-based map with customizable tile size
- **Collision Detection**: Handles player and NPC collision with map elements 
- **Map Transitions**: Doorways or paths that connect different maps
- **NPC Placement**: NPCs are defined per map with specific positions
- **Visual Theming**: Each map has its own color palette and style
- **Environmental Effects**: Integration with visual effects system

```javascript
// Map transition mechanism
// 1. Player position checked against transition points
// 2. If match found, current map is switched to destination map
// 3. Player is repositioned at the destination coordinates
// 4. New map loaded with its corresponding NPCs
```

### Dialog System

Interactive dialog system for engaging with NPCs:
- **Text Box**: Displays NPC dialogue and game messages
- **Multi-message Support**: Conversations flow through multiple messages
- **Choice System**: Allows for player response options
- **Text Animation**: Typewriter effect for text reveal
- **User Interaction**: Progress dialog with E/Space key
- **Visual Indicators**: Shows when more dialog is available
- **State Management**: NPCs remember conversation state

### Animation System

A flexible animation system for visual effects:
- **AnimationManager**: Central class managing multiple animations for entities
- **Custom Animation Types**: Support for hit effects, buffs/debuffs, and custom animations
- **Animation Configuration**: Customizable duration, color, and appearance
- **Multiple Concurrent Animations**: Ability to play various animations simultaneously

### Visual Effects System

Environmental effects to enhance the game atmosphere:
- **Fog Effect**: Dynamic fog density and movement in dark areas
- **Rain Effect**: Variable rain intensity and direction with splash animations
- **Persistent Effects**: Effects can persist across map changes
- **Performance Optimized**: Designed for minimal performance impact

## NPC System

A variety of interactive characters including:
- **GuideNPC**: Tutorial characters that provide guidance
- **MerchantNPC**: Shop owners for buying/selling items
- **ChestNPC**: Treasure chests that contain loot and rewards
- **MonsterNPC**: Common enemy encounters
- **GhostNPC**: Special enemy with unique behaviors
- **DragonNPC**: Powerful standard dragon enemies
- **DragonBossNPC**: End-game boss with special abilities

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
- **AnimationManager**: Manages visual effects and animations
- **UI Components**: HealthBar, GameOver, IntroScene, Transition, etc.

### Map Implementations
- **HomeTownMap**: Starting town environment with buildings and NPCs
- **DarkForest Maps**: Multiple connected forest areas with increasing difficulty
- **DragonLair Maps**: End-game dungeon area with challenging enemies

### Rendering Pipeline
1. Clear canvas
2. Render current map (tiles, patterns)
3. Render NPCs
4. Render player
5. Render UI elements (dialog, health bars)
6. Render visual effects (fog, rain, etc.)
7. Debug visualization (if enabled)

### Game Loop
The main game loop runs at 60fps and handles:
- Input processing
- Entity updates (player, NPCs)
- Collision detection
- Animation updates
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
    constructor(config) {
        super({
            ...config,
            width: 48,
            height: 48,
            type: 'dragon'
        });
        
        // Combat properties
        this.combatSystem.attackDamage = 30;
        this.combatSystem.attackRange = 3;
        this.combatSystem.maxHealth = 150;
        this.combatSystem.currentHealth = 150;
        
        // Movement behavior
        this.movementSystem.speed = 1.5;
        this.aggressive = true;
        
        // Custom dragon properties
        this.fireBreathCooldown = 5000; // 5 seconds between fire breath
        this.lastFireBreath = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Custom fire breath attack logic
        if (this.aggressive && 
            Date.now() - this.lastFireBreath > this.fireBreathCooldown) {
            // Perform fire breath attack
            this.lastFireBreath = Date.now();
        }
    }
}
```

### Adding Visual Effects

1. Create a new JS file for your effect (e.g., `SnowEffect.js`)
2. Extend the `BaseEffect` class:

```javascript
import { BaseEffect } from './BaseEffect.js';

export class SnowEffect extends BaseEffect {
    constructor(config = {}) {
        super({
            name: 'Snow',
            opacity: config.opacity || 0.6,
            enabled: config.enabled !== undefined ? config.enabled : true
        });
        
        this.snowflakes = [];
        this.density = config.density || 100;
        this.speed = config.speed || 1;
        
        // Initialize snowflakes
        this._initializeSnowflakes();
    }
    
    _initializeSnowflakes() {
        // Create initial snowflakes with random positions
        for (let i = 0; i < this.density; i++) {
            this.snowflakes.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: Math.random() * 3 + 1,
                speedMultiplier: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    update(deltaTime) {
        // Update snowflake positions
        for (const snowflake of this.snowflakes) {
            snowflake.y += this.speed * snowflake.speedMultiplier * deltaTime / 16;
            snowflake.x += Math.sin(Date.now() / 1000 + snowflake.y) * 0.5;
            
            // Wrap snowflakes that go off-screen
            if (snowflake.y > 600) {
                snowflake.y = -5;
                snowflake.x = Math.random() * 800;
            }
        }
    }
    
    render(ctx) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffffff';
        
        // Draw each snowflake
        for (const snowflake of this.snowflakes) {
            ctx.beginPath();
            ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
```

### Creating Custom Animations

1. Create a new animation class (e.g., `LevelUpAnimation.js`)
2. Extend the base `Animation` class:

```javascript
import { Animation } from './Animation.js';

export class LevelUpAnimation extends Animation {
    constructor(config = {}) {
        super({
            ...config,
            type: 'levelup',
            duration: config.duration || 3000
        });
        
        this.text = config.text || 'LEVEL UP!';
        this.color = config.color || '#ffcc00';
        this.maxScale = config.maxScale || 2;
        this.currentScale = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Animation scaling logic
        const progress = this.getProgress();
        
        if (progress < 0.5) {
            // Scale up during first half
            this.currentScale = this.maxScale * (progress * 2);
        } else {
            // Scale down during second half
            this.currentScale = this.maxScale * (1 - (progress - 0.5) * 2);
        }
    }
    
    render(ctx, screenX, screenY) {
        ctx.save();
        
        // Set text styling
        ctx.font = `${Math.floor(16 * this.currentScale)}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Position text above entity
        const textY = screenY - 30;
        
        // Apply transparency near the end of animation
        if (this.getProgress() > 0.8) {
            ctx.globalAlpha = 1 - (this.getProgress() - 0.8) * 5;
        }
        
        // Draw text with outline
        ctx.strokeText(this.text, screenX, textY);
        ctx.fillText(this.text, screenX, textY);
        
        ctx.restore();
    }
}
```

## Future Development

- Implement additional game mechanics (inventory, quests, etc.)
- Improve combat mechanics and balancing
- Enhance visual effects and animations
- Optimize performance for mobile devices
- Add sound effects and background music
- Implement save/load game functionality
- Create more maps, enemies, and NPCs

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
    
    // Override render method for custom appearance
    render(ctx, debug = false) {
        // Custom render code here...
        super.render(ctx, debug);
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
