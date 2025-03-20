# Map System

This directory contains the map implementation for the RPG game, handling everything related to game world environments, terrain, and map-specific features.

## Components

### BaseMap Class

Located in `BaseMap.js`, this is the foundation for all game maps:

- **Tile System**: Manages the grid-based map with customizable tile size
- **Collision Detection**: Handles player and NPC collision with map elements
- **Rendering**: Draws the map, entities, and visual effects
- **NPC Management**: Tracks and updates NPCs on the map

### Map Implementations

#### HomeTownMap

Located in `HomeTownMap.js`, this implements the player's starting area:

- Starting town environment with buildings and NPCs
- Safe zone free from combat
- Quest givers and merchants

#### DarkForest Maps

Located in `darkForest/` directory:

- Multiple connected forest areas with increasing difficulty
- Environmental effects like fog and rain
- Aggressive monsters and hidden treasures

#### DragonLair Maps

Located in `dragonLair/` directory:

- End-game dungeon area with challenging enemies
- Boss encounter environment
- Special treasure rewards

## Key Features

- **Map Transitions**: Seamless movement between different map areas
- **Dynamic Objects**: Interactive objects like chests, doors, and switches
- **Environmental Effects**: Integration with visual effects system
- **NPC Placement**: Strategic positioning of NPCs and monsters

## Usage Example

```javascript
// Creating a new map instance
const forestMap = new ForestMap({
  name: 'Dark Forest',
  game: gameInstance
});

// Adding an NPC to the map
forestMap.addNPC(new MonsterNPC({
  x: 10, 
  y: 15,
  name: 'Forest Troll'
}));

// Activating a map effect
forestMap.addEffect(new FogEffect());
```

## Integration

Maps are integrated with:

- The main `Game` class which manages the active map
- The player movement and collision system
- The NPC AI and pathfinding systems
- The visual effects rendering system

## Customization

Create custom maps by extending the `BaseMap` class and implementing:

- Custom map data arrays representing terrain
- Specialized NPC placement
- Map-specific events and interactions
- Unique visual effects and environmental features
