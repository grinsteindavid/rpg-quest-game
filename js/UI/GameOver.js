/**
 * Handles the game over screen with skull, blood effects, and restart button.
 */
export class GameOver {
    /**
     * Creates a new GameOver instance.
     */
    constructor() {
        // Create game over container if it doesn't exist
        let container = document.getElementById('game-over-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'game-over-container';
            container.classList.add('hidden');
            container.innerHTML = `
                <div class="game-over-content">
                    <div class="skull-icon">☠</div>
                    <div class="blood-splatter"></div>
                    <h1 class="game-over-text">GAME OVER</h1>
                    <button id="restart-button">START OVER</button>
                </div>
            `;
            document.getElementById('game-container').appendChild(container);
        }
        
        this.container = container;
        this.visible = false;
        
        // Add event listener to the restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.hide();
                // The game will call the provided callback when restart is clicked
                if (this.onRestartCallback) {
                    this.onRestartCallback();
                }
            });
        }
    }

    /**
     * Shows the game over screen
     * @param {Function} onRestart - Callback function to execute when restart button is clicked
     */
    show(onRestart = null) {
        if (this.visible) return;
        
        this.onRestartCallback = onRestart;
        this.visible = true;
        this.container.classList.remove('hidden');
        
        // Add animation class to trigger the blood effect
        setTimeout(() => {
            this.container.querySelector('.blood-splatter').classList.add('animate');
        }, 300);
    }

    /**
     * Hides the game over screen
     */
    hide() {
        if (!this.visible) return;
        
        this.visible = false;
        this.container.classList.add('hidden');
        
        // Reset animation
        this.container.querySelector('.blood-splatter').classList.remove('animate');
    }

    /**
     * Checks if the game over screen is visible
     * @returns {boolean} Whether the game over screen is visible
     */
    isVisible() {
        return this.visible;
    }
}
