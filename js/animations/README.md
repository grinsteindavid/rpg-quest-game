# Animation System

This directory contains the animation system for the game. Animations can be attached to entities like players or NPCs and are rendered over them.

## Key Components

### AnimationManager

The central class that manages multiple animations for a game entity. It allows you to:

- Register custom animation types
- Play multiple animations simultaneously 
- Reference animations by name
- Update and render all active animations
- Stop specific animations by type or ID

### Base Animation Classes

- `Animation.js` - Base class for all animations
- `BuffAnimation.js` - Animation for buff/debuff effects
- `HitAnimation.js` - Animation for hit/damage effects
- `LevelUpAnimation.js` - Example custom animation for level up effects

## Usage Examples

### Basic Setup

```javascript
// Create an animation manager for an entity
const animationManager = new AnimationManager(player);

// In your game loop
function gameLoop() {
    // Update all animations
    animationManager.update();
    
    // Render all animations
    animationManager.render(ctx, player.x, player.y);
    
    requestAnimationFrame(gameLoop);
}
```

### Playing Animations

```javascript
// Play a hit animation
animationManager.playHit();

// Play a buff with custom options
animationManager.playBuff({
    name: 'Speed Up',
    color: 'rgba(100, 200, 255, 0.5)',
    duration: 2000
});

// Play a debuff
animationManager.playDebuff({
    name: 'Poisoned',
    color: 'rgba(0, 255, 0, 0.5)'
});
```

### Custom Animations

```javascript
// Register a custom animation type
import { LevelUpAnimation } from './LevelUpAnimation.js';
animationManager.registerAnimationType('levelup', LevelUpAnimation);

// Play the custom animation
animationManager.play('levelup', {
    text: 'LEVEL UP!',
    duration: 3000
});
```

### Stopping Animations

```javascript
// Stop all animations of a specific type
animationManager.stopByType('buff');

// Stop a specific animation by its ID
const animationId = animationManager.playHit();
animationManager.stop(animationId);

// Stop all animations
animationManager.stopAll();
```

### Checking Animation Status

```javascript
// Check if entity has active animations of a type
if (animationManager.hasActiveAnimation('buff')) {
    console.log('Entity has active buff animations');
}

// Get all animations of a specific type
const buffAnimations = animationManager.getAnimationsOfType('buff');
```

## Creating New Animation Types

To create a new animation type, extend the base `Animation` class and implement the `render` method:

```javascript
import { Animation } from './Animation.js';

export class MyCustomAnimation extends Animation {
    constructor(config = {}) {
        super({
            ...config,
            type: 'mycustom',
            duration: config.duration || 1000
        });
        
        // Custom properties
        this.customProperty = config.customProperty || 'default';
    }
    
    render(ctx, screenX, screenY, width, height) {
        // Custom rendering logic
    }
}
```

Then register and use it with the AnimationManager:

```javascript
animationManager.registerAnimationType('mycustom', MyCustomAnimation);
animationManager.play('mycustom', { customProperty: 'value' });
```
