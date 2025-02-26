export class Dialog {
    constructor() {
        this.container = document.getElementById('dialog-container');
        this.text = document.getElementById('dialog-text');
        this.isVisible = false;
        this.isTransitioning = false;
        this.messageQueue = [];
        this.onComplete = null;
    }

    startConversation(messages, onComplete = null) {
        this.messageQueue = Array.isArray(messages) ? [...messages] : [messages];
        this.onComplete = onComplete;
        this.isVisible = false;
        this.isTransitioning = false;
        this.showNext();
    }

    showNext() {
        if (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.show(message);
        } else if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
    }

    show(message) {
        if (this.isTransitioning) return;
        
        this.text.textContent = message;
        this.isVisible = true;
        this.isTransitioning = true;
        
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
        
        setTimeout(() => {
            this.isTransitioning = false;
            if (this.messageQueue.length > 0) {
                this.showNext();
            } else if (this.onComplete) {
                this.onComplete();
                this.onComplete = null;
            }
        }, 200); // Match CSS transition duration
    }

    isActive() {
        return this.isVisible || this.isTransitioning || this.messageQueue.length > 0;
    }
}
