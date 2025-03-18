import { Player } from './player.js';
import { HomeTownMap } from './maps/HomeTownMap.js';
import { ForestMap } from './maps/darkForest/base.js';
import { InputHandler } from './input.js';
import { Dialog } from './UI/Dialog.js';
import { Transition } from './UI/Transition.js';
import { GameOver } from './UI/GameOver.js';
import { DepthsDarkForestMap } from './maps/darkForest/depths.js';

/**
 * Main game controller class that manages the game loop, maps, and player interactions.
 */
export class Game {
    /** @private @type {HTMLCanvasElement} Canvas element for rendering */
    _canvas;
    /** @private @type {CanvasRenderingContext2D} 2D rendering context */
    _ctx;
    /** @private @type {Object.<string, BaseMap>} Collection of game maps */
    _maps;
    /** @private @type {BaseMap} Currently active map */
    _currentMap;
    /** @private @type {Player} Player instance */
    _player;
    /** @private @type {InputHandler} Input handler instance */
    _input;
    /** @private @type {boolean} Debug mode state */
    _debug = false;
    /** @private @type {Dialog} Dialog instance */
    _dialog;
    /** @private @type {Transition} Transition system for scene changes */
    _transition;
    /** @private @type {GameOver} Game over screen manager */
    _gameOver;

    /**
     * Creates a new Game instance.
     * @param {HTMLCanvasElement} canvas - The canvas element for rendering the game
     */
    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._initializeCanvas();
        this._initializeMaps();
        this._initializeGameComponents();
        this._setupDebugMode();
        this._dialog = new Dialog();
        this._transition = new Transition();
        this._gameOver = new GameOver();
        requestAnimationFrame(this._gameLoop.bind(this));
    }

    /**
     * Initializes canvas properties and focus.
     * @private
     */
    _initializeCanvas() {
        this._canvas.width = 800;
        this._canvas.height = 600;
        this._canvas.focus();
    }

    /**
     * Initializes and connects game maps.
     * @private
     */
    _initializeMaps() {
        this._maps = {
            hometown: new HomeTownMap({ game: this }),
            darkForest: new ForestMap({ game: this }),
            darkForestDepths: new DepthsDarkForestMap({ game: this })
        };

        this._currentMap = this._maps.hometown;
    }

    /**
     * Initializes player, input handler and other game components.
     * @private
     */
    _initializeGameComponents() {
        const startPos = this._currentMap.getInitialPlayerPosition();
        this._input = new InputHandler();
        this._player = new Player(startPos.x, startPos.y);
        
        this._player.setGame(this);
        this._player.setMap(this._currentMap);
        this._player.setInput(this._input);
    }

    /**
     * Changes the current map and updates player position with a transition effect.
     * @param {string} mapName - Name of the destination map
     * @param {Object} [destination] - Optional destination coordinates
     * @param {number} destination.x - X coordinate in tiles
     * @param {number} destination.y - Y coordinate in tiles
     */
    changeMap(mapName, destination) {
        // Don't allow changing map during transition
        if (this._transition.isActive() || this._player.isTransitioning) {
            return;
        }
        
        // Lock player movement during transition
        this._player.isTransitioning = true;
        
        // Start the transition sequence
        this._transition.transition(async () => {
            // This callback runs between fade out and fade in
            this._currentMap = this._maps[mapName];
            const pos = destination ? {
                x: destination.x * this._currentMap.tileSize,
                y: destination.y * this._currentMap.tileSize
            } : this._currentMap.getInitialPlayerPosition();

            this._player.x = pos.x;
            this._player.y = pos.y;
            this._player.targetX = pos.x;
            this._player.targetY = pos.y;
            this._player.setMap(this._currentMap);
            
            // Small delay to ensure map is fully loaded
            return new Promise(resolve => setTimeout(resolve, 100));
        }).then(() => {
            // Release player movement lock after fade-in plus a delay
            setTimeout(() => {
                this._player.isTransitioning = false;
            }, 100); // Keep player locked for 2 seconds after fade-in completes
        });
    }

    /**
     * Sets up debug mode toggle functionality.
     * @private
     */
    _setupDebugMode() {
        const debugButton = document.getElementById('debug-toggle');
        debugButton.addEventListener('click', () => {
            this._debug = !this._debug;
            debugButton.classList.toggle('active');
            this._updateDebugState();
        });
    }

    /**
     * Updates debug state for game components.
     * @private
     */
    _updateDebugState() {
        this._player.setDebug(this._debug);
        this._currentMap.setDebug(this._debug);
    }

    /**
     * Updates game state.
     * @private
     */
    _update() {
        // Don't update the game if dialog is active, transition is in progress, or game over is shown
        if (this._dialog.isActive()) {
            if (this._input.isPressed('e') || this._input.isPressed(' ')) {
                this._dialog.hide();
            }
            return; // Pause game updates while dialog is showing
        }
        
        // Pausing during transitions is handled at the individual component level
        if (this._transition.isActive() || this._gameOver.isVisible()) {
            return;
        }
        
        // Get current timestamp for delta time calculation
        const now = performance.now();
        const deltaTime = now - (this._lastUpdateTime || now);
        this._lastUpdateTime = now;
        
        // Update map first (including NPCs)
        if (this._currentMap && typeof this._currentMap.update === 'function') {
            this._currentMap.update(this._player, deltaTime);
        }
        
        // Then update player
        this._player.update();
        this._updateDebugState();
    }

    /**
     * Renders the current game state.
     * @private
     */
    _render() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.save();
        this._currentMap.render(this._ctx);
        this._player.render(this._ctx);
        this._ctx.restore();
    }
    
    /**
     * Handles game over event when player dies
     */
    handleGameOver() {
        console.log('Game Over triggered!');
        
        // Show the game over screen with a callback for restart
        this._gameOver.show(() => {
            // Reset the player's health
            this._player.resetHealth();
            this._initializeMaps();
            
            // Reset player to starting position
            const startPos = this._maps.hometown.getInitialPlayerPosition();
            this._player.x = startPos.x;
            this._player.y = startPos.y;
            this._player.targetX = startPos.x;
            this._player.targetY = startPos.y;
            this._player.setMap(this._currentMap);
            
            console.log('Game restarted!');
        });
    }

    /**
     * Main game loop that handles updates and rendering.
     * @private
     */
    _gameLoop = () => {
        this._update();
        this._render();
        requestAnimationFrame(this._gameLoop);
    }

    /**
     * Shows a dialog with the given message or conversation.
     * @param {string|string[]} messages - The message(s) to display
     * @param {Function} [onComplete] - Optional callback when conversation ends
     */
    showDialog(messages, onComplete = null) {
        this._dialog.startConversation(messages, onComplete);
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.tabIndex = 0;
    new Game(canvas);
});
