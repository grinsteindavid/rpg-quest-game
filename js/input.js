/**
 * Handles keyboard and touch input for the game.
 * Maintains a set of currently pressed keys and provides methods to query key/touch states.
 * Prevents default browser behavior for game-related keys (arrows and space).
 * Provides a touch D-pad interface and joystick control for mobile devices.
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
            interact: null,
            attack: null
        };
        
        /** @type {HTMLElement|null} Joystick container element */
        this.joystick = null;
        
        /** @type {HTMLElement|null} Joystick knob element */
        this.joystickKnob = null;
        
        /** @type {Object} Joystick state */
        this.joystickState = {
            active: false,
            centerX: 0,
            centerY: 0,
            knobX: 0,
            knobY: 0,
            angle: 0,
            distance: 0
        };
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', (e) => {
            // Prevent scrolling with arrow keys and space
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'q'].includes(e.key)) {
                e.preventDefault();
            }
            this.keys.add(e.key);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
        
        // Only initialize touch controls on mobile devices
        console.log('User agent:', navigator.userAgent);
        
        // More comprehensive mobile detection
        // Check for mobile/tablet user agents regardless of screen size
        const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|CriOS/i.test(navigator.userAgent);
        
        if (isMobileOrTablet) {
            console.log('Mobile/tablet device detected, initializing touch controls');
            this._initializeTouchControls();
        } else {
            console.log('Desktop browser detected, skipping touch controls');
        }
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
        
            // Create interact button
            this.dpadButtons.interact = this._createDpadButton('interact');
            this.dpad.appendChild(this.dpadButtons.interact);
            
            // Create attack button
            this.dpadButtons.attack = this._createDpadButton('attack');
            this.dpad.appendChild(this.dpadButtons.attack);
            
            // Add D-pad to document
            document.body.appendChild(this.dpad);
            
            // Create and add joystick
            this._createJoystick();
            
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
            case 'interact': symbol.textContent = 'E'; break;
            case 'attack': symbol.textContent = 'Q'; break;
        }
        
        button.appendChild(symbol);
        
        // Map direction to keyboard key
        const keyMap = {
            interact: 'e',
            attack: 'q'
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
    /**
     * Creates and initializes the virtual joystick for touch controls.
     * @private
     */
    _createJoystick() {
        // Create joystick container
        this.joystick = document.createElement('div');
        this.joystick.className = 'joystick-container';
        
        // Create joystick knob (the movable part)
        this.joystickKnob = document.createElement('div');
        this.joystickKnob.className = 'joystick-knob';
        
        // Add knob to joystick container
        this.joystick.appendChild(this.joystickKnob);
        
        // Add joystick to document
        document.body.appendChild(this.joystick);
        
        // Initialize joystick center position
        const joystickRect = this.joystick.getBoundingClientRect();
        this.joystickState.centerX = joystickRect.left + joystickRect.width / 2;
        this.joystickState.centerY = joystickRect.top + joystickRect.height / 2;
        
        // Add touch event listeners
        this.joystick.addEventListener('touchstart', this._handleJoystickStart.bind(this), { passive: false });
        this.joystick.addEventListener('touchmove', this._handleJoystickMove.bind(this), { passive: false });
        this.joystick.addEventListener('touchend', this._handleJoystickEnd.bind(this), { passive: false });
        this.joystick.addEventListener('touchcancel', this._handleJoystickEnd.bind(this), { passive: false });
    }
    
    /**
     * Handles the touchstart event for the joystick.
     * @param {TouchEvent} e - The touch event
     * @private
     */
    _handleJoystickStart(e) {
        e.preventDefault();
        
        // Get joystick container position
        const joystickRect = this.joystick.getBoundingClientRect();
        this.joystickState.centerX = joystickRect.left + joystickRect.width / 2;
        this.joystickState.centerY = joystickRect.top + joystickRect.height / 2;
        
        // Mark joystick as active
        this.joystickState.active = true;
        
        // Update joystick position
        this._updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    /**
     * Handles the touchmove event for the joystick.
     * @param {TouchEvent} e - The touch event
     * @private
     */
    _handleJoystickMove(e) {
        e.preventDefault();
        
        if (this.joystickState.active) {
            this._updateJoystickPosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    }
    
    /**
     * Handles the touchend and touchcancel events for the joystick.
     * @param {TouchEvent} e - The touch event
     * @private
     */
    _handleJoystickEnd(e) {
        e.preventDefault();
        
        // Reset joystick state
        this.joystickState.active = false;
        this.joystickState.distance = 0;
        this.joystickState.angle = 0;
        
        // Reset joystick position
        this.joystickKnob.style.transform = `translate(-50%, -50%)`;
        
        // Clear any direction keys that were set by the joystick
        this.keys.delete('ArrowUp');
        this.keys.delete('ArrowDown');
        this.keys.delete('ArrowLeft');
        this.keys.delete('ArrowRight');
    }
    
    /**
     * Updates the joystick position and state based on touch position.
     * @param {number} touchX - The x-coordinate of the touch
     * @param {number} touchY - The y-coordinate of the touch
     * @private
     */
    _updateJoystickPosition(touchX, touchY) {
        // Calculate the distance from center
        const deltaX = touchX - this.joystickState.centerX;
        const deltaY = touchY - this.joystickState.centerY;
        
        // Calculate the distance and angle
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        // Get the joystick container radius
        const joystickRect = this.joystick.getBoundingClientRect();
        const maxRadius = joystickRect.width / 2;
        
        // Limit the knob position to stay within the joystick container
        let knobDistance = distance;
        if (knobDistance > maxRadius) {
            knobDistance = maxRadius;
        }
        
        // Calculate the normalized distance (0 to 1)
        const normalizedDistance = Math.min(1, distance / maxRadius);
        
        // Update joystick state
        this.joystickState.distance = normalizedDistance;
        this.joystickState.angle = angle;
        
        // Calculate new knob position
        const knobX = Math.cos(angle) * knobDistance;
        const knobY = Math.sin(angle) * knobDistance;
        
        // Update knob position
        this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
        
        // Update input keys based on joystick position
        this._updateJoystickInput();
    }
    
    /**
     * Updates the input keys based on the joystick position.
     * @private
     */
    _updateJoystickInput() {
        // Clear any direction keys that were set by the joystick
        this.keys.delete('ArrowUp');
        this.keys.delete('ArrowDown');
        this.keys.delete('ArrowLeft');
        this.keys.delete('ArrowRight');
        
        // Only update keys if the joystick is active and has moved enough
        if (this.joystickState.active && this.joystickState.distance > 0.2) {
            const angle = this.joystickState.angle;
            
            // Convert angle to direction inputs
            // Right: -π/4 to π/4
            // Down: π/4 to 3π/4
            // Left: 3π/4 to 5π/4 (or -3π/4 to -π/4)
            // Up: 5π/4 to 7π/4 (or -3π/4 to -π)
            
            // Horizontal direction
            if (Math.cos(angle) > 0.4) {
                this.keys.add('ArrowRight');
            } else if (Math.cos(angle) < -0.4) {
                this.keys.add('ArrowLeft');
            }
            
            // Vertical direction
            if (Math.sin(angle) > 0.4) {
                this.keys.add('ArrowDown');
            } else if (Math.sin(angle) < -0.4) {
                this.keys.add('ArrowUp');
            }
        }
    }
    
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
                display: block; /* Visible by default on mobile */
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
            
            .dpad-interact {
                bottom: 20px;
                left: 20px;
                background-color: rgba(0, 200, 100, 0.4);
            }
            
            .dpad-attack {
                bottom: 20px;
                right: 20px;
                background-color: rgba(200, 0, 0, 0.4);
            }
            
            /* Hide D-pad on non-touch devices using hover capability detection */
            @media (hover: hover) and (pointer: fine) {
                .dpad-container,
                .joystick-container {
                    display: none !important;
                }
            }
            
            /* Joystick styles */
            .joystick-container {
                position: fixed;
                bottom: 30px;
                left: 30px;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                z-index: 9999;
                user-select: none;
                touch-action: none;
                display: block;
                pointer-events: auto !important;
                opacity: 0.9;
            }
            
            .joystick-knob {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}
