export class Dialog {
    constructor() {
        this.container = document.getElementById('dialog-container');
        this.text = document.getElementById('dialog-text');
        this.isVisible = false;
        this.isTransitioning = false;
    }

    show(message) {
        if (this.isTransitioning) return;
        
        this.text.textContent = message;
        this.isVisible = true;
        this.isTransitioning = true;
        
        // Remove hidden class after a brief delay to ensure proper transition
        requestAnimationFrame(() => {
            this.container.classList.remove('hidden');
            setTimeout(() => {
                this.isTransitioning = false;
            }, 200); // Match CSS transition duration
        });
    }

    hide() {
        if (this.isTransitioning) return;
        
        this.isVisible = false;
        this.isTransitioning = true;
        this.container.classList.add('hidden');
        
        // Reset transitioning state after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 200); // Match CSS transition duration
    }

    isActive() {
        return this.isVisible || this.isTransitioning;
    }
}
