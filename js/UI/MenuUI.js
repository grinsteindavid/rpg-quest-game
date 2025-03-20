/**
 * Handles the game menu UI with options and inventory access.
 */
export class MenuUI {
    /** @private @type {HTMLElement} The main container for the menu UI */
    _container;
    /** @private @type {HTMLElement} The menu button element */
    _menuButton;
    /** @private @type {boolean} Whether the menu is visible */
    _visible = false;
    /** @private @type {Function|null} Callback for debug toggle */
    _onDebugToggle = null;
    /** @private @type {Function|null} Callback for inventory open */
    _onInventoryOpen = null;
    /** @private @type {boolean} Current debug state */
    _debugEnabled = false;

    /**
     * Creates a new MenuUI instance.
     */
    constructor() {
        // Initialize menu UI
        
        // Create menu button
        const menuButton = document.createElement('button');
        menuButton.id = 'menu-toggle';
        menuButton.className = 'menu-button';
        menuButton.textContent = 'Menu';
        menuButton.addEventListener('click', () => this.toggle());
        console.log('Menu button created');

        // Store reference to menu button
        this._menuButton = menuButton;

        // Replace debug button if it exists
        const debugButton = document.getElementById('debug-toggle');
        if (debugButton && debugButton.parentNode) {
            debugButton.parentNode.replaceChild(menuButton, debugButton);
        } else {
            document.getElementById('game-container').appendChild(menuButton);
        }

        // Create menu container if it doesn't exist
        let container = document.getElementById('menu-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'menu-container';
            container.classList.add('hidden');
            container.innerHTML = `
                <div class="menu-content">
                    <div class="menu-title">GAME MENU</div>
                    <div class="menu-buttons">
                        <button id="inventory-button" class="menu-action-button">INVENTORY</button>
                        <button id="menu-options-button" class="menu-action-button">OPTIONS</button>
                        <button id="menu-close-button" class="menu-action-button">CLOSE</button>
                    </div>
                </div>
                <div id="menu-options-panel" class="intro-panel hidden">
                    <h2>OPTIONS</h2>
                    <div class="menu-option">
                        <label for="debug-toggle-option">Debug Mode:</label>
                        <label class="menu-toggle">
                            <input type="checkbox" id="debug-toggle-option">
                            <span class="menu-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="menu-option">
                        <label for="sound-volume">Sound Volume:</label>
                        <input type="range" id="sound-volume" min="0" max="100" value="80">
                    </div>
                    <div class="menu-option">
                        <label for="music-volume">Music Volume:</label>
                        <input type="range" id="music-volume" min="0" max="100" value="60">
                    </div>
                    <div class="menu-option">
                        <label for="difficulty">Difficulty:</label>
                        <select id="difficulty">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div class="menu-button-row">
                        <button id="menu-options-back-button" class="menu-action-button">BACK</button>
                    </div>
                </div>
            `;
            document.getElementById('game-container').appendChild(container);
            
            // DOM structure created
        }
        
        this._container = container;
        
        // Need to wait for DOM to be fully updated
        setTimeout(() => {
            // Setup event listeners after DOM has been updated
            
            // Setup event listeners after DOM has been updated
            this._setupEventListeners();
        }, 100);
    }

    /**
     * Sets up event listeners for the menu buttons
     * @private
     */
    _showOptionsPanel() {
        // Get elements
        const optionsPanel = document.getElementById('menu-options-panel');
        const menuContent = document.querySelector('.menu-content');
            
        // Show options panel
        if (optionsPanel) {
            // Remove hidden class
            optionsPanel.classList.remove('hidden');
            
            // Force display with important properties
            optionsPanel.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 5000 !important');
        } else {
            console.error('Options panel not found');
        }
        
        // Hide main menu content
        if (menuContent) {
            menuContent.style.display = 'none';
            menuContent.classList.add('hidden');
        } else {
            console.error('Menu content not found');
        }
    }
    
    /**
     * Hides the options panel and shows the main menu
     * @private
     */
    _hideOptionsPanel() {
        // Get elements
        const optionsPanel = document.getElementById('menu-options-panel');
        const menuContent = document.querySelector('.menu-content');
        
        // Hide options panel
        if (optionsPanel) {
            optionsPanel.classList.add('hidden');
            optionsPanel.style.display = 'none';
        } else {
            console.error('Options panel not found');
        }
        
        // Show main menu content
        if (menuContent) {
            menuContent.classList.remove('hidden');
            menuContent.style.display = 'flex';
        } else {
            console.error('Menu content not found');
        }
    }
    
    /**
     * Sets up event listeners for the menu UI
     * @private
     */
    _setupEventListeners() {
        // Debug toggle
        const debugToggle = document.getElementById('debug-toggle-option');
        if (debugToggle) {
            debugToggle.addEventListener('change', () => {
                this._debugEnabled = debugToggle.checked;
                if (this._onDebugToggle) {
                    this._onDebugToggle(this._debugEnabled);
                }
            });
        }

        // Options button
        const optionsButton = document.getElementById('menu-options-button');
        
        if (optionsButton) {
            optionsButton.addEventListener('click', () => {
                // Get elements directly here for immediate action
                const optionsPanel = document.getElementById('menu-options-panel');
                const menuContent = document.querySelector('.menu-content');
                
                if (optionsPanel) {
                    // Show the panel
                    optionsPanel.classList.remove('hidden');
                    optionsPanel.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 5000 !important;');
                    
                    // Also try the method
                    this._showOptionsPanel();
                } else {
                    console.error('Options panel not found during click');
                }
                
                if (menuContent) {
                    menuContent.style.display = 'none';
                    menuContent.classList.add('hidden');
                }
            });
        } else {
            console.error('Menu options button not found in DOM');
        }

        // Options back button
        const optionsBackButton = document.getElementById('menu-options-back-button');
        if (optionsBackButton) {
            optionsBackButton.addEventListener('click', () => {
                console.log('Options back button clicked');
                this._hideOptionsPanel();
            });
        }

        // Inventory button
        const inventoryButton = document.getElementById('inventory-button');
        if (inventoryButton) {
            inventoryButton.addEventListener('click', () => {
                console.log('Inventory button clicked');
                this.hide();
                if (this._onInventoryOpen) {
                    this._onInventoryOpen();
                }
            });
        }

        // Close button
        const closeButton = document.getElementById('menu-close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                console.log('Close button clicked');
                this.hide();
            });
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._visible) {
                this.hide();
            }
        });
    }

    /**
     * Sets the debug toggle callback function
     * @param {Function} callback - Function to call when debug toggle changes
     */
    setDebugToggleCallback(callback) {
        this._onDebugToggle = callback;
    }

    /**
     * Sets the inventory open callback function
     * @param {Function} callback - Function to call when inventory button is clicked
     */
    setInventoryOpenCallback(callback) {
        this._onInventoryOpen = callback;
    }

    /**
     * Updates the debug toggle state without triggering the callback
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    updateDebugState(enabled) {
        this._debugEnabled = enabled;
        const debugToggle = document.getElementById('debug-toggle-option');
        if (debugToggle) {
            debugToggle.checked = enabled;
        }

        // Update menu button active class for debug info panel
        if (this._menuButton) {
            if (enabled) {
                this._menuButton.classList.add('active');
            } else {
                this._menuButton.classList.remove('active');
            }
        }
    }

    /**
     * Shows the menu UI
     */
    show() {
        if (this._visible) return;
        
        this._visible = true;
        this._container.classList.remove('hidden');
        
        // Make sure main menu content is visible and panels are hidden when showing menu
        const menuContent = document.querySelector('.menu-content');
        const optionsPanel = document.getElementById('menu-options-panel');
        
        console.log('MenuUI.show() - menuContent:', menuContent);
        console.log('MenuUI.show() - optionsPanel:', optionsPanel);
        
        if (menuContent) {
            menuContent.classList.remove('hidden');
            menuContent.style.display = 'flex';
        } else {
            console.error('Menu content element not found');
        }
        
        if (optionsPanel) {
            // Hide options panel and ensure it gets the correct styling
            optionsPanel.classList.add('hidden');
            // Force display:none via inline style to override any other styles
            optionsPanel.setAttribute('style', 'display: none !important');
        } else {
            console.error('Options panel element not found');
        }
    }

    /**
     * Hides the menu UI
     */
    hide() {
        if (!this._visible) return;
        
        this._visible = false;
        this._container.classList.add('hidden');
    }

    /**
     * Toggles the menu visibility
     */
    toggle() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Checks if the menu is visible
     * @returns {boolean} Whether the menu is visible
     */
    isVisible() {
        return this._visible;
    }
}
