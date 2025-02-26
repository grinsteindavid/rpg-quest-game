import { Player } from './player.js';
import { HomeTownMap } from './maps/HomeTownMap.js';
import { ForestMap } from './maps/ForestMap.js';
import { InputHandler } from './input.js';

/**
 * Main game controller class that manages the game loop, maps, and player.
 */
export class Game {
    /**
     * Creates a new Game instance.
     * @param {HTMLCanvasElement} canvas - The canvas element where the game will be rendered
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set fixed canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize maps
        this.maps = {
            hometown: new HomeTownMap(),
            forest: new ForestMap()
        };
        
        // Provide map references to each map
        for (const map of Object.values(this.maps)) {
            map.maps = this.maps;
        }
        
        this.currentMap = this.maps.hometown;
        
        // Initialize game components
        this.map = this.currentMap;
        const startPos = this.map.getInitialPlayerPosition();
        this.player = new Player(startPos.x, startPos.y);
        this.input = new InputHandler();
        
        // Setup components
        this.player.setGame(this); // Add this line
        this.player.setMap(this.map);
        this.player.setInput(this.input);
        
        // Make sure canvas has focus to receive input
        canvas.focus();
        
        this.debug = false;
        this.setupDebugMode();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Changes the current map and updates player position.
     * @param {string} mapName - The name of the map to change to ('hometown' or 'forest')
     * @param {Object} destination - The destination coordinates in the new map
     * @param {number} destination.x - The x tile coordinate in the new map
     * @param {number} destination.y - The y tile coordinate in the new map
     */
    changeMap(mapName, destination) {
        this.currentMap = this.maps[mapName];
        this.map = this.currentMap;
        
        if (destination) {
            this.player.x = destination.x * this.map.tileSize;
            this.player.y = destination.y * this.map.tileSize;
        } else {
            const startPos = this.map.getInitialPlayerPosition();
            this.player.x = startPos.x;
            this.player.y = startPos.y;
        }
        
        this.player.setMap(this.map);
    }

    /**
     * Sets up debug mode toggle functionality.
     * Connects to a button with id 'debug-toggle' in the DOM.
     * @private
     */
    setupDebugMode() {
        const debugButton = document.getElementById('debug-toggle');
        debugButton.addEventListener('click', () => {
            this.debug = !this.debug;
            debugButton.classList.toggle('active');
        });
    }

    /**
     * Updates game state including player and map debug states.
     * Called every frame by the game loop.
     */
    update() {
        this.player.update();
        this.player.setDebug(this.debug);
        this.map.setDebug(this.debug);
    }

    /**
     * Renders the current game state to the canvas.
     * Called every frame by the game loop.
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Render game objects
        this.map.render(this.ctx);
        this.player.render(this.ctx);
        
        // Restore context state
        this.ctx.restore();
    }

    /**
     * Main game loop that drives updates and rendering.
     * Uses requestAnimationFrame for smooth animation.
     * @private
     */
    gameLoop = () => {
        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
}

/**
 * Initialize game when window loads.
 * Creates canvas element and starts the game.
 */
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.tabIndex = 0; // Make canvas focusable
    new Game(canvas);
});
