# UI System

This directory contains the user interface components for the RPG game, providing visual feedback, player information, and interactive elements to enhance the gameplay experience.

## Components

### Dialog System

Located in `Dialog.js`, this handles in-game conversations and text displays:

- **Text Box**: Displays NPC dialogue and game messages
- **Choice System**: Allows for player response options
- **Text Animation**: Typewriter effect for text reveal

### HealthBar

Located in `HealthBar.js`, this provides visual health status:

- **Dynamic Sizing**: Adjusts to entity width
- **Color Coding**: Changes color based on health percentage
- **Customizable Appearance**: Configurable height, width, and position

### Game State UI Components

- **GameOver** (`GameOver.js`): Handles game over screen and restart options
- **IntroScene** (`IntroScene.js`): Provides game introduction and story elements
- **Transition** (`Transition.js`): Creates smooth transitions between game scenes

### Markers and Indicators

Located in `Marker.js`, these provide visual cues for gameplay:

- **Interactive Object Markers**: Indicators for objects player can interact with
- **Quest Markers**: Visual guides for objectives
- **Event Indicators**: Highlight special events or locations

## Key Features

- **Responsive Design**: UI elements adjust to screen size and entity dimensions
- **Consistent Styling**: Cohesive visual language across all UI components
- **Minimal Intrusion**: UI designed to provide information without obscuring gameplay
- **Customizable**: Components can be configured with different options

## Usage Example

```javascript
// Creating and showing a dialog
const dialog = new Dialog();
dialog.show('Welcome adventurer!', 'Guide');

// Creating a health bar for an entity
const healthBar = new HealthBar({
  width: 50,
  height: 6,
  yOffset: -15
});
healthBar.render(ctx, entityX, entityY, currentHealth, maxHealth);

// Creating a scene transition
const transition = new Transition();
transition.fadeOut(() => {
  game.changeMap('darkForest');
  transition.fadeIn();
});
```

## Integration

UI components integrate with:

- The game rendering system for proper displaying
- The player and NPC systems for status display
- The game state management for transitions
- The input system for interactive elements

## Customization

Customize UI appearance and behavior by:

- Modifying component configuration options
- Extending component classes with new functionality
- Creating theme variants for different game areas
- Adding new UI components that follow the established patterns
