/**
 * Handles the game intro scene with a dark gothic Diablo-like theme.
 * Features a menu with start, options, and credits buttons.
 */
export class IntroScene {
    /**
     * Creates a new IntroScene instance.
     */
    constructor() {
        // Create intro scene container if it doesn't exist
        let container = document.getElementById('intro-scene-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'intro-scene-container';
            container.classList.add('hidden');
            container.innerHTML = `
                <div class="intro-scene-overlay"></div>
                <div class="intro-scene-content">
                    <div class="intro-title">RPG GAME</div>
                    <div class="intro-subtitle">A Dark Adventure</div>
                    <div class="intro-torch left"></div>
                    <div class="intro-torch right"></div>
                    <div class="intro-menu">
                        <button id="start-button" class="intro-button">START GAME</button>
                        <button id="options-button" class="intro-button">OPTIONS</button>
                        <button id="credits-button" class="intro-button">CREDITS</button>
                    </div>
                    <div id="credits-panel" class="intro-panel hidden">
                        <h2>CREDITS</h2>
                        <p>Created By:</p>
                        <p class="credit-name">David G</p>
                        <p class="credit-name">Leonardo</p>
                        <button id="back-button" class="intro-button small">BACK</button>
                    </div>
                    <div id="options-panel" class="intro-panel hidden">
                        <h2>OPTIONS</h2>
                        <div class="option-row">
                            <label for="sound-volume">Sound Volume:</label>
                            <input type="range" id="sound-volume" min="0" max="100" value="80">
                        </div>
                        <div class="option-row">
                            <label for="music-volume">Music Volume:</label>
                            <input type="range" id="music-volume" min="0" max="100" value="60">
                        </div>
                        <div class="option-row">
                            <label for="difficulty">Difficulty:</label>
                            <select id="difficulty">
                                <option value="easy">Easy</option>
                                <option value="normal" selected>Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <button id="options-back-button" class="intro-button small">BACK</button>
                    </div>
                </div>
            `;
            document.getElementById('game-container').appendChild(container);

            // Setup event listeners
            this._setupEventListeners();
        }
        
        this.container = container;
        this.visible = false;
        this.onStartCallback = null;
    }

    /**
     * Sets up event listeners for the intro menu buttons
     * @private
     */
    _setupEventListeners() {
        // Start button
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.hide();
                // Call the start game callback
                if (this.onStartCallback) {
                    this.onStartCallback();
                }
            });
        }

        // Options button - show options panel
        const optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.addEventListener('click', () => {
                document.getElementById('options-panel').classList.remove('hidden');
                document.getElementById('credits-panel').classList.add('hidden');
                document.querySelector('.intro-menu').classList.add('hidden');
            });
        }

        // Credits button - show credits panel
        const creditsButton = document.getElementById('credits-button');
        if (creditsButton) {
            creditsButton.addEventListener('click', () => {
                document.getElementById('credits-panel').classList.remove('hidden');
                document.getElementById('options-panel').classList.add('hidden');
                document.querySelector('.intro-menu').classList.add('hidden');
            });
        }

        // Back button from credits
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                document.getElementById('credits-panel').classList.add('hidden');
                document.querySelector('.intro-menu').classList.remove('hidden');
            });
        }

        // Back button from options
        const optionsBackButton = document.getElementById('options-back-button');
        if (optionsBackButton) {
            optionsBackButton.addEventListener('click', () => {
                document.getElementById('options-panel').classList.add('hidden');
                document.querySelector('.intro-menu').classList.remove('hidden');
            });
        }
    }

    /**
     * Shows the intro scene
     * @param {Function} onStart - Callback function to execute when start button is clicked
     */
    show(onStart = null) {
        if (this.visible) return;
        
        this.onStartCallback = onStart;
        this.visible = true;
        this.container.classList.remove('hidden');

        // Make sure main menu is visible and panels are hidden when showing intro
        document.querySelector('.intro-menu').classList.remove('hidden');
        document.getElementById('credits-panel').classList.add('hidden');
        document.getElementById('options-panel').classList.add('hidden');
        
        // Add animation class for the torch flicker effect
        document.querySelectorAll('.intro-torch').forEach(torch => {
            torch.classList.add('flicker');
        });
    }

    /**
     * Hides the intro scene
     */
    hide() {
        if (!this.visible) return;
        
        this.visible = false;
        this.container.classList.add('hidden');
    }

    /**
     * Checks if the intro scene is visible
     * @returns {boolean} Whether the intro scene is visible
     */
    isVisible() {
        return this.visible;
    }
}
