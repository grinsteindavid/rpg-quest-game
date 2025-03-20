# Visual Effects System

This directory contains the visual effects implementation for the RPG game, allowing for dynamic environmental effects like fog, rain, and other visual enhancements.

## Components

### BaseEffect Class

Located in `BaseEffect.js`, this is the foundation class for all visual effects:

- **Configuration Options**: Customizable name, opacity, and enabled state
- **Lifecycle Methods**: Standard update and render methods
- **State Management**: Methods to control effect visibility and appearance

### Effect Implementations

#### FogEffect

Located in `FogEffect.js`, this implements fog and mist effects in the game world:

- Dynamic fog density and movement
- Adjustable opacity and coverage
- Animated fog particles for realistic appearance

#### RainEffect

Located in `RainEffect.js`, this creates rain weather effects:

- Variable rain intensity and direction
- Splash animations when raindrops hit surfaces
- Sound integration options

## Key Features

- **Persistent Effects**: Effects can persist across map changes
- **Layered Rendering**: Effects are rendered on top of maps with proper z-ordering
- **Performance Optimized**: Designed for minimal performance impact
- **Runtime Control**: Effects can be enabled/disabled during gameplay

## Usage Example

```javascript
// Creating a new fog effect
const fogEffect = new FogEffect({
  opacity: 0.7,
  enabled: true,
  density: 0.5
});

// Adding effect to a map
map.addEffect(fogEffect);

// Adjusting effect properties during gameplay
fogEffect.setOpacity(0.3);
fogEffect.setEnabled(false);
```

## Integration

Effects are integrated with:

- The `BaseMap` class which manages all visual effects on a map
- The rendering system that properly composites effects on the game canvas
- The game's environmental conditions that can trigger specific effects

## Customization

Create custom effects by extending the `BaseEffect` class and implementing:

- Custom `update()` method for your effect's logic
- Custom `render()` method for your effect's visual appearance
- Any additional properties needed for your specific effect
