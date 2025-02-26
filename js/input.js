export class InputHandler {
    constructor() {
        this.keys = new Set();
        
        window.addEventListener('keydown', (e) => {
            // Prevent scrolling with arrow keys and space
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys.add(e.key);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    isPressed(key) {
        return this.keys.has(key);
    }
}
