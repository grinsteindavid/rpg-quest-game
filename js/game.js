import { Player } from './player.js';
import { HomeTownMap } from './maps/HomeTownMap.js';
import { ForestMap } from './maps/ForestMap.js';
import { InputHandler } from './input.js';

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
        requestAnimationFrame(this._gameLoop);
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
            hometown: new HomeTownMap(),
            forest: new ForestMap()
        };

        // Connect maps to each other
        Object.values(this._maps).forEach(map => {
            map.maps = this._maps;
        });

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
     * Changes the current map and updates player position.
     * @param {string} mapName - Name of the destination map
     * @param {Object} [destination] - Optional destination coordinates
     * @param {number} destination.x - X coordinate in tiles
     * @param {number} destination.y - Y coordinate in tiles
     */
    changeMap(mapName, destination) {
        this._currentMap = this._maps[mapName];
        const pos = destination ? {
            x: destination.x * this._currentMap.tileSize,
            y: destination.y * this._currentMap.tileSize
        } : this._currentMap.getInitialPlayerPosition();

        this._player.x = pos.x;
        this._player.y = pos.y;
        this._player.setMap(this._currentMap);
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
     * Main game loop that handles updates and rendering.
     * @private
     */
    _gameLoop = () => {
        this._update();
        this._render();
        requestAnimationFrame(this._gameLoop);
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.tabIndex = 0;
    new Game(canvas);
});
