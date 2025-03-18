# arena-game

https://grinsteindavid.github.io/arena-game/

<img width="769" alt="image" src="https://github.com/user-attachments/assets/7b20c550-f3f0-4aea-affd-e58aa9f3dec4" />

<img width="820" alt="image" src="https://github.com/user-attachments/assets/daa6745c-a525-4d12-8dac-0eaef78e739a" />


<img width="700" alt="image" src="https://github.com/user-attachments/assets/5d7372a2-8cbe-49bb-921e-b0b2968637a2" />

<img width="698" alt="image" src="https://github.com/user-attachments/assets/c19ce297-3a2b-4bf7-b52d-bfa88c5ccc20" />

<img width="360" alt="image" src="https://github.com/user-attachments/assets/10fce40c-cc6a-4f1b-9b68-15409a2d4638" />




A simple 2D game built with JavaScript where you can move a character around a tile-based arena. Features include:

- Grid-based movement system
- Collision detection
- Map transitions
- Debug visualization mode

### Controls
- **WASD** or **Arrow Keys**: Move character
- **E** or **Space**: Interact with NPCs / Continue dialogue
- **Debug Toggle**: Top-right button shows collision boxes and tile info

### Characters
- **Player Character**: Customizable sprite with directional movement
- **Guide NPC**: Helpful character that explains game controls
- **Merchant NPC**: Shopkeeper with future trading possibilities

### Dialogue System
- Multi-message conversations
- Smooth transitions between messages
- Visual indicator for continuation
- Different conversation sets per NPC

### Maps
- **Home Town**: Starting area with NPCs
- **Forest**: Connected area through north path

### Visual Style
- Game Boy-inspired color palette
- Pixel art aesthetics
- Smooth animations
- Character markers and indicators

## Technical Features
- Modular JavaScript architecture
- Class-based component system
- Extensible NPC framework
- Clean separation of concerns

## Development

### Prerequisites
- Modern web browser
- Local web server (for development)

### Running the Game
1. Start a local web server in the project directory
2. Open `index.html` in your browser
3. Use WASD/Arrows to move, E to interact

### Debug Mode
Click the "Debug Mode" button to see:
- Collision boundaries
- NPC interaction zones
- Map tile types
- Player direction indicator


## Health System Features

### Health Properties
- Added `maxHealth` (100) and `currentHealth` properties to track player health
- Health bar appears above the player, color-coded based on health level:
  - Green: > 50%
  - Yellow/orange: 25-50%
  - Red: < 25% (critical)

### Damage & Invulnerability System
- Implemented `takeDamage(amount)` method to reduce player health
- Player becomes temporarily invulnerable after taking damage (visual flashing effect)
- Health bar automatically displays when damaged, hides after 3 seconds at full health

### Health Management
- Added `heal(amount)` method for health recovery
- Implemented `resetHealth()` method to restore full health
- Game over handling triggered when health reaches zero

### Visual Feedback
- Color-coded health bar displays current and max health
- Player sprite flashes during invulnerability period
- Debug mode reveals exact health values

To test: Use `player.takeDamage(20)` or `player.heal(10)` in appropriate game code sections.



1. Monster Behavior Fixes:
Made monsters aggressive by default so they'll immediately chase the player when in range
Added proper toggling of aggression when interacting with a monster
Created a smooth transition between aggressive and conversational states
2. Movement Speed Improvements:
Reduced the movement interval from 60 to 20 frames, making NPCs move 3× more frequently
Added a speed multiplier to increase movement distance per step
Applied the speed boost to all movement calculations for consistency
These changes should make your monsters:

Move randomly when no player is in range
Aggressively follow the player when they get close
Return to their spawn area if they wander too far
Toggle between aggressive and conversational states when interacted with
