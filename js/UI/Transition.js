/**
 * Handles scene transitions with fade-in/fade-out effects.
 */
export class Transition {
    /**
     * Creates a new Transition instance.
     */
    constructor() {
        // Create transition overlay element if it doesn't exist
        let transitionOverlay = document.getElementById('transition-overlay');
        if (!transitionOverlay) {
            transitionOverlay = document.createElement('div');
            transitionOverlay.id = 'transition-overlay';
            transitionOverlay.style.position = 'absolute';
            transitionOverlay.style.top = '0';
            transitionOverlay.style.left = '0';
            transitionOverlay.style.width = '100%';
            transitionOverlay.style.height = '100%';
            transitionOverlay.style.backgroundColor = '#000';
            transitionOverlay.style.opacity = '0';
            transitionOverlay.style.pointerEvents = 'none';
            transitionOverlay.style.transition = 'opacity 1s ease-in-out';
            transitionOverlay.style.zIndex = '1000';
            document.body.appendChild(transitionOverlay);
        }
        
        this.overlay = transitionOverlay;
        this.isTransitioning = false;
        this.duration = 2000; // Default transition duration in ms
        this.callback = null;
    }

    /**
     * Start a fade out transition (from transparent to black).
     * @param {Function} [callback] - Optional callback to execute after fade out completes
     * @param {number} [duration] - Optional duration override in ms
     * @returns {Promise} - Resolves when fade out is complete
     */
    fadeOut(callback = null, duration = null) {
        if (this.isTransitioning) return Promise.reject('Transition already in progress');
        
        this.isTransitioning = true;
        this.callback = callback;
        const transitionDuration = duration || this.duration / 2;
        
        return new Promise((resolve) => {
            // Update transition duration dynamically
            this.overlay.style.transition = `opacity ${transitionDuration/1000}s ease-in-out`;
            
            // Trigger the fade out
            this.overlay.style.opacity = '1';
            
            setTimeout(() => {
                this.isTransitioning = false;
                if (callback) callback();
                resolve();
            }, transitionDuration);
        });
    }

    /**
     * Start a fade in transition (from black to transparent).
     * @param {number} [duration] - Optional duration override in ms
     * @returns {Promise} - Resolves when fade in is complete
     */
    fadeIn(duration = null) {
        if (this.isTransitioning) return Promise.reject('Transition already in progress');
        
        this.isTransitioning = true;
        const transitionDuration = duration || this.duration / 2;
        
        return new Promise((resolve) => {
            // Update transition duration dynamically
            this.overlay.style.transition = `opacity ${transitionDuration/1000}s ease-in-out`;
            
            // Trigger the fade in
            this.overlay.style.opacity = '0';
            
            setTimeout(() => {
                this.isTransitioning = false;
                resolve();
            }, transitionDuration);
        });
    }

    /**
     * Perform a complete transition (fade out -> callback -> fade in).
     * @param {Function} callback - Function to call between fade out and fade in
     * @returns {Promise} - Resolves when the entire transition is complete
     */
    async transition(callback) {
        try {
            await this.fadeOut();
            if (callback) await callback();
            await this.fadeIn();
            return true;
        } catch (error) {
            console.error('Transition error:', error);
            return false;
        }
    }

    /**
     * Checks if a transition is currently active.
     * @returns {boolean} - Whether transition is active
     */
    isActive() {
        return this.isTransitioning;
    }
}
