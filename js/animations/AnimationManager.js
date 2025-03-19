/**
 * AnimationManager.js
 * Manages multiple animations for game entities.
 */

import { Animation } from './Animation.js';
import { BuffAnimation } from './BuffAnimation.js';
import { HitAnimation } from './HitAnimation.js';

export class AnimationManager {
    /**
     * @param {Object} entity - The entity this animation manager belongs to
     */
    constructor(entity) {
        this.entity = entity;
        this.animations = {}; // Stores animations by ID
        this.animationsByType = {}; // Stores animations by type for easier lookup
        this.registeredAnimationTypes = this._registerDefaultAnimationTypes();
    }

    /**
     * Register default animation types
     * @private
     * @returns {Object} - Object mapping animation names to their classes
     */
    _registerDefaultAnimationTypes() {
        return {
            'hit': HitAnimation,
            'buff': BuffAnimation,
            'debuff': (config) => new BuffAnimation({...config, isDebuff: true})
        };
    }

    /**
     * Register a custom animation type
     * @param {string} name - Name to reference this animation type
     * @param {class|function} AnimationClass - Animation class or factory function
     */
    registerAnimationType(name, AnimationClass) {
        this.registeredAnimationTypes[name] = AnimationClass;
    }

    /**
     * Play an animation by its type name
     * @param {string} type - The type of animation to play
     * @param {Object} config - Configuration options for the animation
     * @returns {string|null} - ID of the created animation, or null if animation type not found
     */
    play(type, config = {}) {
        // Check if this animation type exists
        if (!this.registeredAnimationTypes[type]) {
            console.warn(`Animation type '${type}' not registered`);
            return null;
        }

        // Create the animation
        const AnimationClass = this.registeredAnimationTypes[type];
        let animation;
        
        if (typeof AnimationClass === 'function' && !(AnimationClass.prototype instanceof Animation)) {
            // It's a factory function
            animation = AnimationClass({
                ...config,
                entity: this.entity
            });
        } else {
            // It's a class
            animation = new AnimationClass({
                ...config,
                entity: this.entity
            });
        }

        // Start the animation
        animation.start();

        // Store the animation
        this.animations[animation.id] = animation;

        // Store by type for easier lookup
        if (!this.animationsByType[type]) {
            this.animationsByType[type] = [];
        }
        this.animationsByType[type].push(animation.id);

        return animation.id;
    }

    /**
     * Stop a specific animation by ID
     * @param {string} id - ID of the animation to stop
     */
    stop(id) {
        if (this.animations[id]) {
            this.animations[id].cancel();
            this._removeAnimation(id);
        }
    }

    /**
     * Stop all animations of a specific type
     * @param {string} type - Type of animations to stop
     */
    stopByType(type) {
        if (this.animationsByType[type]) {
            // Create copy of the array since we'll be modifying it during iteration
            const animationIds = [...this.animationsByType[type]];
            animationIds.forEach(id => this.stop(id));
        }
    }

    /**
     * Stop all animations
     */
    stopAll() {
        Object.keys(this.animations).forEach(id => {
            this.animations[id].cancel();
        });
        this.animations = {};
        this.animationsByType = {};
    }

    /**
     * Update all animations
     * @returns {Array} - IDs of animations that are still active
     */
    update() {
        const expiredAnimations = [];

        // Update each animation and collect expired ones
        Object.keys(this.animations).forEach(id => {
            const animation = this.animations[id];
            const isActive = animation.update();
            
            if (!isActive) {
                expiredAnimations.push(id);
            }
        });

        // Remove expired animations
        expiredAnimations.forEach(id => this._removeAnimation(id));

        return Object.keys(this.animations);
    }

    /**
     * Remove an animation from all internal collections
     * @param {string} id - ID of the animation to remove
     * @private
     */
    _removeAnimation(id) {
        const animation = this.animations[id];
        if (!animation) return;

        // Remove from type collection
        const type = animation.type;
        if (this.animationsByType[type]) {
            const index = this.animationsByType[type].indexOf(id);
            if (index !== -1) {
                this.animationsByType[type].splice(index, 1);
            }
            
            // Clean up empty arrays
            if (this.animationsByType[type].length === 0) {
                delete this.animationsByType[type];
            }
        }

        // Remove from main collection
        delete this.animations[id];
    }

    /**
     * Renders all active animations
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} screenX - Screen X coordinate of the entity
     * @param {number} screenY - Screen Y coordinate of the entity
     */
    render(ctx, screenX, screenY) {
        const entityWidth = this.entity?.width || 32;
        const entityHeight = this.entity?.height || 32;

        // Render each animation
        Object.values(this.animations).forEach(animation => {
            animation.render(ctx, screenX, screenY, entityWidth, entityHeight);
        });
    }

    /**
     * Check if the entity has any active animations of the specified type
     * @param {string} type - Animation type to check for
     * @returns {boolean} - Whether the entity has active animations of this type
     */
    hasActiveAnimation(type) {
        return this.animationsByType[type] && this.animationsByType[type].length > 0;
    }

    /**
     * Get all active animations of a specific type
     * @param {string} type - Animation type to get
     * @returns {Array} - Array of animation objects of the specified type
     */
    getAnimationsOfType(type) {
        if (!this.animationsByType[type]) return [];
        
        return this.animationsByType[type].map(id => this.animations[id]);
    }
}
