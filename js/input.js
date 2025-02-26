/**
 * Handles keyboard input for the game.
 * Maintains a set of currently pressed keys and provides methods to query key states.
 * Prevents default browser behavior for game-related keys (arrows and space).
 * 
 * @example
 * const input = new InputHandler();
 * 
 * // Check if a key is currently pressed
 * if (input.isPressed('ArrowLeft')) {
 *     // Move player left
 * }
 */
export class InputHandler {
    /**
     * Creates a new InputHandler instance.
     * Sets up event listeners for keydown and keyup events.
     * Prevents default browser scrolling behavior for arrow keys and space.
     */
    constructor() {
        /** @type {Set<string>} Set of currently pressed keys */
        this.keys = new Set();
        
        window.addEventListener('keydown', (e) => {
            // Prevent scrolling with arrow keys and space
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys.add(e.key);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    /**
     * Checks if a specific key is currently pressed.
     * 
     * @param {string} key - The key to check. Use standard KeyboardEvent.key values
     *                       (e.g., 'ArrowLeft', 'ArrowRight', 'a', 's', ' ')
     * @returns {boolean} True if the key is currently pressed, false otherwise
     * 
     * @example
     * // Check for arrow key input
     * if (input.isPressed('ArrowLeft')) {
     *     console.log('Left arrow is pressed');
     * }
     * 
     * // Check for WASD input
     * if (input.isPressed('w')) {
     *     console.log('W key is pressed');
     * }
     */
    isPressed(key) {
        return this.keys.has(key);
    }
}
