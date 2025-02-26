const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Canvas setup
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Color palette
const colors = {
    skin: '#FFC8A8',
    hair: '#3C2C2C',
    hat: '#FF0000',
    clothes: '#2848B8',
    shoes: '#383838'
};

// Clear canvas with transparent background
ctx.clearRect(0, 0, size, size);

// Draw character
function drawPlayer() {
    // Hat
    ctx.fillStyle = colors.hat;
    ctx.fillRect(8, 4, 16, 6);
    ctx.fillRect(6, 8, 20, 4);

    // Head/Face
    ctx.fillStyle = colors.skin;
    ctx.fillRect(10, 10, 12, 8);

    // Hair
    ctx.fillStyle = colors.hair;
    ctx.fillRect(8, 10, 2, 4);
    ctx.fillRect(22, 10, 2, 4);

    // Body
    ctx.fillStyle = colors.clothes;
    ctx.fillRect(10, 18, 12, 8);

    // Arms
    ctx.fillRect(6, 18, 4, 6);
    ctx.fillRect(22, 18, 4, 6);

    // Legs
    ctx.fillStyle = colors.clothes;
    ctx.fillRect(10, 26, 4, 4);
    ctx.fillRect(18, 26, 4, 4);

    // Shoes
    ctx.fillStyle = colors.shoes;
    ctx.fillRect(10, 30, 4, 2);
    ctx.fillRect(18, 30, 4, 2);
}

drawPlayer();

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Save the sprite
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(assetsDir, 'player.png');
fs.writeFileSync(outputPath, buffer);
console.log('Player sprite generated successfully at:', outputPath);
