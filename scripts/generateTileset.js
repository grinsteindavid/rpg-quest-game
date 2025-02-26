const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Canvas setup
const tileSize = 32;
const width = tileSize;
const height = tileSize * 5;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Color palette
const colors = {
    grass: {
        light: '#98D827',
        dark: '#67A314'
    },
    tree: {
        leaves: '#1A4004',
        trunk: '#3E2731'
    },
    house: {
        walls: '#A87B41',
        roof: '#803C14',
        windows: '#2E2B28'
    },
    lab: {
        walls: '#FFFFFF',
        details: '#C0C0C0'
    },
    path: {
        light: '#E6C88B',
        dark: '#BFA46F'
    }
};

// Drawing functions
function drawGrassTile(x, y) {
    ctx.fillStyle = colors.grass.light;
    ctx.fillRect(x, y, tileSize, tileSize);
    
    // Add random grass details
    ctx.fillStyle = colors.grass.dark;
    for (let i = 0; i < 20; i++) {
        const dotX = x + Math.random() * tileSize;
        const dotY = y + Math.random() * tileSize;
        ctx.fillRect(dotX, dotY, 2, 2);
    }
}

function drawTreeTile(x, y) {
    // Draw trunk
    ctx.fillStyle = colors.tree.trunk;
    ctx.fillRect(x + 12, y + 20, 8, 12);
    
    // Draw leaves
    ctx.fillStyle = colors.tree.leaves;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 2);
    ctx.lineTo(x + 28, y + 18);
    ctx.lineTo(x + 4, y + 18);
    ctx.fill();
}

function drawHouseTile(x, y) {
    // Walls
    ctx.fillStyle = colors.house.walls;
    ctx.fillRect(x + 4, y + 14, 24, 18);
    
    // Roof
    ctx.fillStyle = colors.house.roof;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 14);
    ctx.lineTo(x + 16, y + 2);
    ctx.lineTo(x + 30, y + 14);
    ctx.fill();
    
    // Windows
    ctx.fillStyle = colors.house.windows;
    ctx.fillRect(x + 8, y + 18, 6, 6);
    ctx.fillRect(x + 18, y + 18, 6, 6);
}

function drawLabTile(x, y) {
    // Main building
    ctx.fillStyle = colors.lab.walls;
    ctx.fillRect(x + 2, y + 4, 28, 28);
    
    // Windows and details
    ctx.fillStyle = colors.lab.details;
    ctx.fillRect(x + 4, y + 8, 8, 8);
    ctx.fillRect(x + 20, y + 8, 8, 8);
    ctx.fillRect(x + 12, y + 20, 8, 12);
}

function drawPathTile(x, y) {
    ctx.fillStyle = colors.path.light;
    ctx.fillRect(x, y, tileSize, tileSize);
    
    // Add texture
    ctx.fillStyle = colors.path.dark;
    for (let i = 0; i < 30; i++) {
        const dotX = x + Math.random() * tileSize;
        const dotY = y + Math.random() * tileSize;
        ctx.fillRect(dotX, dotY, 1, 1);
    }
}

// Draw all tiles
drawGrassTile(0, 0);
drawTreeTile(0, tileSize);
drawHouseTile(0, tileSize * 2);
drawLabTile(0, tileSize * 3);
drawPathTile(0, tileSize * 4);

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Save the tileset
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(assetsDir, 'tileset.png');
fs.writeFileSync(outputPath, buffer);
console.log('Tileset generated successfully at:', outputPath);
