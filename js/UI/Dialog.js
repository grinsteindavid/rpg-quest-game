export class Dialog {
    constructor() {
        this.container = document.getElementById('dialog-container');
        this.text = document.getElementById('dialog-text');
        this.isVisible = false;
    }

    show(message) {
        this.text.textContent = message;
        this.container.classList.remove('hidden');
        this.isVisible = true;
    }

    hide() {
        this.container.classList.add('hidden');
        this.isVisible = false;
    }

    isActive() {
        return this.isVisible;
    }
}
