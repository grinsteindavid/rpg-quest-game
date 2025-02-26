import { Player } from './player.js';
import { HomeTownMap } from './maps/HomeTownMap.js';
import { ForestMap } from './maps/ForestMap.js';
import { InputHandler } from './input.js';

export class Game {
    #canvas;
    #ctx;
    #maps;
    #currentMap;
    #player;
    #input;
    #debug = false;

    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.#initializeCanvas();
        this.#initializeMaps();
        this.#initializeGameComponents();
        this.#setupDebugMode();
        requestAnimationFrame(this.#gameLoop);
    }

    #initializeCanvas() {
        this.#canvas.width = 800;
        this.#canvas.height = 600;
        this.#canvas.focus();
    }

    #initializeMaps() {
        this.#maps = {
            hometown: new HomeTownMap(),
            forest: new ForestMap()
        };

        // Connect maps to each other
        Object.values(this.#maps).forEach(map => {
            map.maps = this.#maps;
        });

        this.#currentMap = this.#maps.hometown;
    }

    #initializeGameComponents() {
        const startPos = this.#currentMap.getInitialPlayerPosition();
        this.#input = new InputHandler();
        this.#player = new Player(startPos.x, startPos.y);
        
        this.#player.setGame(this);
        this.#player.setMap(this.#currentMap);
        this.#player.setInput(this.#input);
    }

    changeMap(mapName, destination) {
        this.#currentMap = this.#maps[mapName];
        const pos = destination ? {
            x: destination.x * this.#currentMap.tileSize,
            y: destination.y * this.#currentMap.tileSize
        } : this.#currentMap.getInitialPlayerPosition();

        this.#player.x = pos.x;
        this.#player.y = pos.y;
        this.#player.setMap(this.#currentMap);
    }

    #setupDebugMode() {
        const debugButton = document.getElementById('debug-toggle');
        debugButton.addEventListener('click', () => {
            this.#debug = !this.#debug;
            debugButton.classList.toggle('active');
            this.#updateDebugState();
        });
    }

    #updateDebugState() {
        this.#player.setDebug(this.#debug);
        this.#currentMap.setDebug(this.#debug);
    }

    #update() {
        this.#player.update();
        this.#updateDebugState();
    }

    #render() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.save();
        this.#currentMap.render(this.#ctx);
        this.#player.render(this.#ctx);
        this.#ctx.restore();
    }

    #gameLoop = () => {
        this.#update();
        this.#render();
        requestAnimationFrame(this.#gameLoop);
    }
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.tabIndex = 0;
    new Game(canvas);
});
