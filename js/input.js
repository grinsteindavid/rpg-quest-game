/**
 * Handles keyboard and touch input for the game.
 * Maintains a set of currently pressed keys and provides methods to query key/touch states.
 * Prevents default browser behavior for game-related keys (arrows and space).
 * Provides a touch D-pad interface for mobile devices.
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
     * Sets up event listeners for keyboard and touch input.
     * Prevents default browser scrolling behavior for arrow keys and space.
     * Creates a D-pad interface for touch devices.
     */
    constructor() {
        /** @type {Set<string>} Set of currently pressed keys/inputs */
        this.keys = new Set();
        
        /** @type {boolean} Whether touch controls are currently being used */
        this.touchEnabled = false;
        
        /** @type {HTMLElement|null} D-pad container element */
        this.dpad = null;
        
        /** @type {Object} D-pad button elements */
        this.dpadButtons = {
            up: null,
            down: null,
            left: null,
            right: null,
            interact: null
        };
        
        // Set up keyboard event listeners
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
        
        // Always initialize touch controls for testing
        // We'll force it to be visible on all devices including iPad
        console.log('User agent:', navigator.userAgent);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            console.log('Mobile device detected');
        }
        
        // Force enable for all devices during testing
        this._initializeTouchControls();
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
    
    /**
     * Initializes the touch controls by creating and placing the D-pad on screen.
     * Sets up touch event listeners for the D-pad buttons.
     * @private
     */
    _initializeTouchControls() {
        this.touchEnabled = true;
        
        console.log('iPad/Touch detected - initializing controls');
        
        // Create D-pad container
        this.dpad = document.createElement('div');
        this.dpad.className = 'dpad-container';
        
        // Add a delay to ensure the DOM is ready
        setTimeout(() => {
            console.log('Touch controls initialized after delay');
        
        // Create D-pad buttons
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(direction => {
            this.dpadButtons[direction] = this._createDpadButton(direction);
            this.dpad.appendChild(this.dpadButtons[direction]);
        });
        
        // Create interact button
        this.dpadButtons.interact = this._createDpadButton('interact');
        this.dpad.appendChild(this.dpadButtons.interact);
        
            // Add D-pad to document
            document.body.appendChild(this.dpad);
            
            // Add touch styles
            this._addTouchStyles();
        }, 500); // 500ms delay
    }
    
    /**
     * Creates a D-pad button element and sets up its event listeners.
     * @param {string} direction - The direction of the button ('up', 'down', 'left', 'right', 'interact')
     * @returns {HTMLElement} The created button element
     * @private
     */
    _createDpadButton(direction) {
        const button = document.createElement('div');
        button.className = `dpad-button dpad-${direction}`;
        
        // Add direction arrow or symbol
        const symbol = document.createElement('span');
        symbol.className = 'dpad-symbol';
        
        // Set the symbol content based on direction
        switch(direction) {
            case 'up': symbol.textContent = '▲'; break;
            case 'down': symbol.textContent = '▼'; break;
            case 'left': symbol.textContent = '◀'; break;
            case 'right': symbol.textContent = '▶'; break;
            case 'interact': symbol.textContent = 'E'; break;
        }
        
        button.appendChild(symbol);
        
        // Map direction to keyboard key
        const keyMap = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            interact: 'e'
        };
        
        // Touch start event - simulate key press
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.add(keyMap[direction]);
            button.classList.add('active');
        }, { passive: false });
        
        // Touch end event - simulate key up
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.delete(keyMap[direction]);
            button.classList.remove('active');
        }, { passive: false });
        
        // Handle touch move (to allow sliding between buttons)
        button.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        return button;
    }
    
    /**
     * Adds CSS styles for the D-pad to the document.
     * @private
     */
    _addTouchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .dpad-container {
                position: fixed;
                bottom: 30px;
                right: 30px; /* Changed from left to right */
                width: 180px;
                height: 180px;
                z-index: 9999; /* Highest possible z-index */
                user-select: none;
                touch-action: none;
                display: block !important; /* Force visibility */
                pointer-events: auto !important;
                opacity: 0.9; /* Make slightly transparent */
            }
            
            .dpad-button {
                position: absolute;
                width: 60px;
                height: 60px;
                background-color: rgba(100, 100, 255, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                border: 3px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
            }
            
            .dpad-button.active {
                background-color: rgba(255, 255, 255, 0.5);
                transform: scale(0.95);
            }
            
            .dpad-up {
                top: 0;
                left: 50px;
            }
            
            .dpad-down {
                bottom: 0;
                left: 50px;
            }
            
            .dpad-left {
                left: 0;
                top: 50px;
            }
            
            .dpad-right {
                right: 0;
                top: 50px;
            }
            
            .dpad-interact {
                bottom: 20px;
                left: -80px; /* Changed from right to left since D-pad is now on the right */
                background-color: rgba(0, 200, 100, 0.4);
            }
            
            /* Only hide on non-touch devices */
            @media (min-width: 1024px) and (hover: hover) {
                .dpad-container {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
