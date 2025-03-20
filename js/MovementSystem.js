/**
 * A reusable MovementSystem class for handling movement-related functionality in game entities.
 * Can be used by both Player and NPCs to ensure consistent movement behavior.
 */
export class MovementSystem {
    /**
     * Creates a new MovementSystem instance
     * @param {Object} entity - The entity (player or NPC) using this movement system
     * @param {Object} options - MovementSystem configuration options
     */
    constructor(entity, options = {}) {
        // Store reference to the entity using this movement system
        this.entity = entity;

        // Movement properties with defaults that can be overridden by options
        this.speed = options.speed ?? 2; // Default: 2 pixels per frame
        this.tileSize = options.tileSize ?? 32; // Default: 32 pixels
        this.canMoveThruWalls = options.canMoveThruWalls ?? false; // Default: can't move through walls
        this.isMoving = false; // Whether the entity is currently moving between tiles
        this.moveRange = options.moveRange ?? 0; // How many tiles it can move from spawn (0 = unlimited)

        // Directional properties
        this.direction = options.direction ?? 'down'; // 'up', 'down', 'left', 'right'
        this.directionX = 0; // Horizontal movement direction (-1, 0, or 1)
        this.directionY = 0; // Vertical movement direction (-1, 0, or 1)

        // Target position properties
        this.targetX = entity.x; // Target X position in pixels
        this.targetY = entity.y; // Target Y position in pixels

        // Store original spawn position (only used for NPCs)
        if (options.spawnTileX !== undefined && options.spawnTileY !== undefined) {
            this.spawnTileX = options.spawnTileX;
            this.spawnTileY = options.spawnTileY;
        }
    }

    /**
     * Updates the entity's facing direction based on movement input.
     * @param {number} dx - Horizontal movement direction (-1, 0, or 1)
     * @param {number} dy - Vertical movement direction (-1, 0, or 1)
     */
    updateDirection(dx, dy) {
        if (dx < 0) this.direction = 'left';
        else if (dx > 0) this.direction = 'right';
        else if (dy < 0) this.direction = 'up';
        else if (dy > 0) this.direction = 'down';

        // Update the entity's direction property if it exists
        if (this.entity) {
            this.entity.direction = this.direction;
        }

        // Store direction values for animation
        this.directionX = dx;
        this.directionY = dy;
    }

    /**
     * Handles the movement animation between tiles
     * @returns {boolean} Whether the entity has reached its target
     */
    handleMovementAnimation() {
        if (!this.isMoving) return true; // Already at target

        const dx = this.targetX - this.entity.x;
        const dy = this.targetY - this.entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Reached the target - snap to it
            this.entity.x = this.targetX;
            this.entity.y = this.targetY;
            this.isMoving = false;
            return true; // Reached target
        } else {
            // Continue moving towards target
            this.entity.x += (dx / distance) * this.speed;
            this.entity.y += (dy / distance) * this.speed;
            return false; // Still moving
        }
    }

    /**
     * Faces the entity towards a target based on relative position
     * @param {number} dx - X distance to target (target.x - entity.x)
     * @param {number} dy - Y distance to target (target.y - entity.y)
     */
    faceTowardsTarget(dx, dy) {
        // Determine predominant direction (horizontal or vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal direction is predominant
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            // Vertical direction is predominant
            this.direction = dy > 0 ? 'down' : 'up';
        }

        // Update the entity's direction if it exists
        if (this.entity) {
            this.entity.direction = this.direction;
        }
    }

    /**
     * Checks if a move to the specified tile coordinates is valid.
     * @param {number} tileX - Target tile X coordinate
     * @param {number} tileY - Target tile Y coordinate
     * @param {Object} map - The current map instance
     * @param {Object|Array|null} otherEntities - Another entity or array of entities to check collision with (optional)
     * @returns {boolean} Whether the move is valid
     */
    isValidTileMove(tileX, tileY, map, otherEntities = null) {
        // Check map boundaries
        if (tileX < 0 || tileY < 0 || tileX >= map.mapData[0].length || tileY >= map.mapData.length) {
            return false;
        }
        
        // Check if the tile is walkable
        if (!this.canMoveThruWalls && !map.isWalkableTile(map.mapData[tileY][tileX])) {
            return false;
        }
        
        // Check distance from spawn (if moveRange is set)
        if (this.moveRange > 0 && this.spawnTileX !== undefined && this.spawnTileY !== undefined) {
            const dx = Math.abs(tileX - this.spawnTileX);
            const dy = Math.abs(tileY - this.spawnTileY);
            if (dx > this.moveRange || dy > this.moveRange) {
                return false;
            }
        }
        
        // Check for collision with other entities if provided
        if (!this.canMoveThruWalls && otherEntities) {
            // Handle both single entity and array of entities
            const entities = Array.isArray(otherEntities) ? otherEntities : [otherEntities];
            
            for (const otherEntity of entities) {
                // Skip if it's the same entity as the one moving
                if (otherEntity === this.entity) continue;
                
                // If either entity can move through walls (e.g., a ghost NPC), allow movement
                if (this.canMoveThruWalls || (otherEntity.movementSystem && otherEntity.movementSystem.canMoveThruWalls)) {
                    continue;
                }
                
                // Get other entity's current tile position
                const otherTileX = Math.floor(otherEntity.x / this.tileSize);
                const otherTileY = Math.floor(otherEntity.y / this.tileSize);
                
                // Check if entity is at the target tile position
                if (otherTileX === tileX && otherTileY === tileY) {
                    return false;
                }
                
                // Also check other entity's target position if they're moving
                if (otherEntity.isMoving) {
                    const otherTargetTileX = Math.floor(otherEntity.targetX / this.tileSize);
                    const otherTargetTileY = Math.floor(otherEntity.targetY / this.tileSize);
                    
                    if (otherTargetTileX === tileX && otherTargetTileY === tileY) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Check if the new position is valid (no collisions)
     * @param {number} x - Target X position in pixels
     * @param {number} y - Target Y position in pixels
     * @param {Object} map - The current map instance
     * @param {Object|Array|null} otherEntities - Another entity or array of entities to check collision with (optional)
     * @returns {boolean} Whether the move is valid
     */
    isValidMove(x, y, map, otherEntities = null) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.isValidTileMove(tileX, tileY, map, otherEntities);
    }

    /**
     * Calculates the distance between the entity and another point
     * @param {number} x - X coordinate of the target point
     * @param {number} y - Y coordinate of the target point
     * @returns {number} Distance in pixels
     */
    getDistanceTo(x, y) {
        const dx = this.entity.x - x;
        const dy = this.entity.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the distance from the original spawn point
     * @returns {number} Distance in pixels or -1 if no spawn point was set
     */
    getDistanceFromSpawn() {
        if (this.spawnTileX === undefined || this.spawnTileY === undefined) {
            return -1; // No spawn point defined
        }
        
        const dx = this.entity.x - (this.spawnTileX * this.tileSize);
        const dy = this.entity.y - (this.spawnTileY * this.tileSize);
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Makes the entity follow a target
     * @param {Object} target - The target entity to follow
     * @param {Object} map - The current map instance
     * @param {number} followDistance - Distance to maintain from target in pixels
     * @returns {boolean} Whether the entity started moving
     */
    followTarget(target, map, followDistance = this.tileSize) {
        // Don't try to follow if already moving between tiles
        if (this.isMoving) return false;
        
        // Calculate distance to target in pixels
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if target is beyond the follow distance
        if (distanceToTarget <= followDistance) {
            return false;
        }
        
        // Calculate direction to move towards target
        const targetTileX = Math.floor(target.x / this.tileSize);
        const targetTileY = Math.floor(target.y / this.tileSize);
        const entityTileX = Math.floor(this.entity.x / this.tileSize);
        const entityTileY = Math.floor(this.entity.y / this.tileSize);
        
        // Already at same tile as target
        if (targetTileX === entityTileX && targetTileY === entityTileY) {
            return false;
        }
        
        // Determine which direction to move (simple pathfinding)
        let dirX = 0;
        let dirY = 0;
        
        // Move horizontally or vertically based on largest distance
        if (Math.abs(targetTileX - entityTileX) > Math.abs(targetTileY - entityTileY)) {
            // Move horizontally
            dirX = targetTileX > entityTileX ? 1 : -1;
        } else {
            // Move vertically
            dirY = targetTileY > entityTileY ? 1 : -1;
        }
        
        // Try to move in the chosen direction
        const newTileX = entityTileX + dirX;
        const newTileY = entityTileY + dirY;
        
        if (this.isValidTileMove(newTileX, newTileY, map, target)) {
            this.targetX = newTileX * this.tileSize;
            this.targetY = newTileY * this.tileSize;
            this.directionX = dirX;
            this.directionY = dirY;
            this.isMoving = true;
            this.updateDirection(dirX, dirY);
            return true;
        } else {
            // If primary direction is blocked, try the other direction
            if (dirX !== 0) {
                dirX = 0;
                dirY = targetTileY > entityTileY ? 1 : -1;
            } else {
                dirY = 0;
                dirX = targetTileX > entityTileX ? 1 : -1;
            }
            
            const altTileX = entityTileX + dirX;
            const altTileY = entityTileY + dirY;
            
            if (this.isValidTileMove(altTileX, altTileY, map, target)) {
                this.targetX = altTileX * this.tileSize;
                this.targetY = altTileY * this.tileSize;
                this.directionX = dirX;
                this.directionY = dirY;
                this.isMoving = true;
                this.updateDirection(dirX, dirY);
                return true;
            }
        }
        
        return false; // Couldn't move
    }

    /**
     * Makes the entity return to its spawn position
     * @param {Object} map - The current map instance
     * @returns {boolean} Whether the entity started moving
     */
    returnToSpawn(map) {
        if (this.spawnTileX === undefined || this.spawnTileY === undefined) {
            return false; // No spawn point defined
        }
        
        const currentTileX = Math.floor(this.entity.x / this.tileSize);
        const currentTileY = Math.floor(this.entity.y / this.tileSize);
        
        // Already at spawn position
        if (currentTileX === this.spawnTileX && currentTileY === this.spawnTileY) {
            return false;
        }
        
        // Determine direction to move towards spawn
        let dirX = 0;
        let dirY = 0;
        
        // Move horizontally or vertically based on largest distance
        if (Math.abs(this.spawnTileX - currentTileX) > Math.abs(this.spawnTileY - currentTileY)) {
            // Move horizontally
            dirX = this.spawnTileX > currentTileX ? 1 : -1;
        } else {
            // Move vertically
            dirY = this.spawnTileY > currentTileY ? 1 : -1;
        }
        
        // Always update direction even if we can't move
        this.updateDirection(dirX, dirY);
        
        // Try to move in the chosen direction
        const newTileX = currentTileX + dirX;
        const newTileY = currentTileY + dirY;
        
        if (this.isValidTileMove(newTileX, newTileY, map, null)) {
            this.targetX = newTileX * this.tileSize;
            this.targetY = newTileY * this.tileSize;
            this.directionX = dirX;
            this.directionY = dirY;
            this.isMoving = true;
            return true;
        } else {
            // If primary direction is blocked, try the other direction
            if (dirX !== 0) {
                dirX = 0;
                dirY = this.spawnTileY > currentTileY ? 1 : -1;
            } else {
                dirY = 0;
                dirX = this.spawnTileX > currentTileX ? 1 : -1;
            }
            
            // Update direction for the alternate move attempt
            this.updateDirection(dirX, dirY);
            
            const altTileX = currentTileX + dirX;
            const altTileY = currentTileY + dirY;
            
            if (this.isValidTileMove(altTileX, altTileY, map, null)) {
                this.targetX = altTileX * this.tileSize;
                this.targetY = altTileY * this.tileSize;
                this.directionX = dirX;
                this.directionY = dirY;
                this.isMoving = true;
                return true;
            }   
        }
        
        return false; // Couldn't move
    }

    /**
     * Attempt a random movement in cardinal directions (up, down, left, right)
     * @param {Object} map - The current map instance
     * @param {Object|Array|null} otherEntities - Another entity or array of entities to check collision with (optional)
     * @returns {boolean} Whether the entity started moving
     */
    moveRandomly(map, otherEntities = null) {
        // Already moving
        if (this.isMoving) return false;
        
        // Get current tile position
        const currentTileX = Math.floor(this.entity.x / this.tileSize);
        const currentTileY = Math.floor(this.entity.y / this.tileSize);
        
        // Choose a random cardinal direction (up, down, left, right)
        const direction = Math.floor(Math.random() * 4);
        let targetTileX = currentTileX;
        let targetTileY = currentTileY;
        let dirX = 0;
        let dirY = 0;
        
        switch (direction) {
            case 0: // Up
                targetTileY -= 1;
                dirY = -1;
                break;
            case 1: // Right
                targetTileX += 1;
                dirX = 1;
                break;
            case 2: // Down
                targetTileY += 1;
                dirY = 1;
                break;
            case 3: // Left
                targetTileX -= 1;
                dirX = -1;
                break;
        }
        
        return this.attemptMove(targetTileX, targetTileY, dirX, dirY, map, otherEntities);
    }
    
    /**
     * Helper method to attempt movement to a specific tile
     * @param {number} tileX - Target tile X coordinate
     * @param {number} tileY - Target tile Y coordinate
     * @param {number} dirX - X direction of movement (-1, 0, 1)
     * @param {number} dirY - Y direction of movement (-1, 0, 1)
     * @param {Object} map - The current map instance
     * @param {Object|Array|null} otherEntities - Another entity or array of entities to check collision with (optional)
     * @returns {boolean} Whether the entity started moving
     */
    attemptMove(tileX, tileY, dirX, dirY, map, otherEntities = null) {
        // Always update character direction, even if they can't move
        this.updateDirection(dirX, dirY);
        
        if (this.isValidTileMove(tileX, tileY, map, otherEntities)) {
            // Set target position in pixels
            this.targetX = tileX * this.tileSize;
            this.targetY = tileY * this.tileSize;
            
            // Set movement direction for animation
            this.directionX = dirX;
            this.directionY = dirY;
            
            // Start moving
            this.isMoving = true;
            return true;
        }
        
        return false; // Couldn't move
    }
}
