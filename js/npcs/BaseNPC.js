import { SPRITES } from '../colors.js';
import { CombatSystem } from '../combat/npc.js';
import { Marker } from '../UI/Marker.js';
import { MovementSystem } from '../MovementSystem.js';

export class BaseNPC {
    constructor({ x, y, name, canMove = false, canMoveThruWalls = false, loot = [] }) {
        // Store original tile coordinates for spawn position
        this.spawnTileX = x;
        this.spawnTileY = y;

        // Tile size
        this.tileSize = 32;
        // Convert tile position to pixels for current position
        this.x = x * this.tileSize;
        this.y = y * this.tileSize;
        this.width = this.tileSize;
        this.height = this.tileSize;
        this.name = name;
        this.direction = 'down';
        this.debug = false;

        // Movement properties
        this.canMove = canMove;
        this.canMoveThruWalls = canMoveThruWalls;
        this.speed = 0.5;
        this.moveTimer = 0;
        this.moveInterval = 60; // Time between movement decisions in frames
        this.moveRange = 4; // How many tiles it can move from spawn
        this.initialX = this.x; // Store initial pixel position
        this.initialY = this.y;

        // Loot properties ( under development )
        this.loot = loot;

        this.nameTag = {
            color: 'white',
            aggressiveColor: '#ff3333',
            font: '12px Arial',
            shadow: true,
            offsetY: -10,
            respectAggressive: true
        };
        
        // Initialize the movement system
        this.movementSystem = new MovementSystem(this, {
            speed: this.speed,
            tileSize: this.tileSize,
            direction: this.direction,
            canMoveThruWalls: this.canMoveThruWalls,
            moveRange: this.moveRange,
            spawnTileX: this.spawnTileX,
            spawnTileY: this.spawnTileY
        });
        
        // Tile-by-tile movement properties
        this.isMoving = false; // Flag for when NPC is moving between tiles
        this.directionX = 0;
        this.directionY = 0;
        this.targetX = this.x; // Target position for movement
        this.targetY = this.y;
        
        // Aggro and targeting properties
        this.isAggressive = false; // Whether the NPC is currently aggressive (can change dynamically)
        this.canBeAggressive = false; // Whether the NPC can become aggressive when player is in range
        this.followPlayer = false; // Whether the NPC should always follow the player when in range (friendly or not)
        this.enforceSpawnArea = false; // Whether NPC should still respect spawn area limits when following player
        this.aggroRange = this.tileSize * 3; // 3 tiles detection range (can be overridden by subclasses)
        this.followDistance = this.tileSize; // How close the NPC tries to get to target (1 tile)
        
        // Path tracking properties
        this.lastTargetX = null;
        this.lastTargetY = null;
        this.pathChangeTimer = 0;
        this.pathChangeInterval = 60; // How often to update path when following target

        // Initialize marker UI component
        this.marker = new Marker({
            visible: true,
            color: 'yellow',
            speed: 0.1
        });

        // Interaction properties
        this.interactionRadius = 48; // 1.5 tiles (previously hardcoded)

        // Conversation properties
        this.conversationIndex = 0;
        this.isInConversation = false;
        this.conversations = [["Hello!"]]; // Default conversation
        
        // Combat properties
        this.isDefeated = false;
        // Create and initialize combat system
        this.combatSystem = new CombatSystem(this);
        this.combatSystem.maxHealth = 100; // Default maximum health
    }

    setDebug(debug) {
        this.debug = debug;
    }

    interact(player) {
        if (!this.isInConversation) {
            this.isInConversation = true;
            const currentConversation = this.conversations[this.conversationIndex];
            player.game.showDialog(currentConversation, () => {
                this.isInConversation = false;
                if (this.conversationIndex === 0) {
                    this.showMarker = false;
                }
                this.conversationIndex = (this.conversationIndex + 1) % this.conversations.length;
                this.onConversationComplete?.();
            });
        }
    }

    // Optional callback for subclasses
    onConversationComplete() {}
    
    // Take damage from player or other sources
    takeDamage(amount) {
        return this.combatSystem.takeDamage(amount);
    }
    
    // Heal the NPC
    heal(amount) {
        this.combatSystem.heal(amount);
    }
    
    // Reset health to max
    resetHealth() {
        this.combatSystem.resetHealth();
    }
    
    // Optional callback for when NPC is defeated
    onDefeat() {
        this.isDefeated = true;
    }
    
    update(player, deltaTime, map) {
        // Update combat system
        this.combatSystem.update(player);
        
        // Don't update if NPC can't move or is in conversation
        if (!this.canMove || this.isInConversation) return;
        
        if (this.isMoving) {
            // Continue ongoing movement
            this._handleMovementAnimation();
            return; // Exit early to avoid starting new movements while already moving
        }

        // Calculate distance to player for all NPCs
        const distanceToPlayer = this._getDistanceToPlayer(player);
        const distanceFromSpawn = this._getDistanceFromSpawn();
        
        // Dynamically update aggressive state based on player proximity - only for aggressive NPCs
        if (this.canBeAggressive) {
            // Check if player is in aggro range
            if (distanceToPlayer <= this.aggroRange) {
                // Set NPC to aggressive when player is in range
                this.isAggressive = true;
            } else {
                // Set NPC back to non-aggressive when player is out of range
                this.isAggressive = false;
            }
        }
        
        // Handle NPC movement based on current state
        if (this.followPlayer) {
            // Always follow player when followPlayer is true, regardless of range
            this._followTarget(player, map);
            return; // Skip random movement when following player
        } else if (this.isAggressive && distanceToPlayer <= this.aggroRange) {
            // Aggressive NPC follows player only when in aggro range
            this._followTarget(player, map);
            return; // Skip random movement when following player
        } else if (this.canBeAggressive && distanceFromSpawn > 10) { // If aggressive NPC is out of spawn area, return home
            // Return to spawn position (only for aggressive NPCs)
            this._returnToSpawn(map);
            return; // Skip random movement when returning to spawn
        }
        
        // Increment move timer for random movement
        this.moveTimer += 1;
        
        // Random movement if no aggro behavior is triggered
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // 50% chance to move randomly
            if (Math.random() > 0.5) {
                this._moveRandomly(player, map);
            }
        }
    }
    
    // Set a target position for the NPC to move toward
    setMoveTarget(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        // Store the target for pathfinding
        this.lastTargetX = tileX;
        this.lastTargetY = tileY;
    }
    
    // Clear the target position so NPC will roam randomly again
    clearMoveTarget() {
        this.lastTargetX = null;
        this.lastTargetY = null;
    }
    
    // Handles the movement animation between tiles
    _handleMovementAnimation() {
        // Update internal isMoving status based on movement system result
        const reachedTarget = this.movementSystem.handleMovementAnimation();
        if (reachedTarget) {
            this.isMoving = false;
        }
    }
    
    // Internal method to check if a tile move is valid
    _isValidTileMove(tileX, tileY, player, map) {
        return this.movementSystem.isValidTileMove(tileX, tileY, map, player);
    }
    
    // Check if the new position is valid (no collisions)
    // This is used during movement animation
    isValidMove(x, y, player, map) {
        return this.movementSystem.isValidMove(x, y, map, player);
    }

    /**
     * Checks if a target entity is within this NPC's interaction radius
     * @param {Object} target - The target entity with x,y properties
     * @returns {boolean} True if the target is within interaction radius
     */
    isNearby(target) {
        // Calculate distance to target
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Consider nearby if within interaction radius
        return distance < this.interactionRadius;
    }

    // Calculate distance to player for aggro detection
    _getDistanceToPlayer(player) {
        return this.movementSystem.getDistanceTo(player.x, player.y);
    }

    // Calculate distance from spawn point
    _getDistanceFromSpawn() {
        return this.movementSystem.getDistanceFromSpawn();
    }
    
    // Make NPC follow a target (player)
    _followTarget(player, map) {
        // Update path change timer to avoid constant recalculation
        this.pathChangeTimer += 1;
        if (this.pathChangeTimer < this.pathChangeInterval / 4) {
            return;
        }
        this.pathChangeTimer = 0;
        
        // Attempt to follow the player using the movement system
        const startedMoving = this.movementSystem.followTarget(player, map, this.followDistance);
        
        // Update NPC state if movement started
        if (startedMoving) {
            this.isMoving = true;
            // Direction is automatically updated by the movement system
            this.direction = this.movementSystem.direction;
        }
    }
    
    // Make NPC return to spawn position
    _returnToSpawn(map) {
        // Attempt to return to spawn using the movement system
        const startedMoving = this.movementSystem.returnToSpawn(map);
        
        // Update NPC state if movement started
        if (startedMoving) {
            this.isMoving = true;
            // Direction is automatically updated by the movement system
            this.direction = this.movementSystem.direction;
        }
    }

    _renderNPC(ctx, screenX, screenY) {
        // Basic NPC appearance with damage effect if damaged
        if (this.combatSystem.isDamaged) {
            // Flash red when damaged
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(screenX, screenY, this.width, this.height);
        } else {
            // Normal appearance
            ctx.fillStyle = SPRITES[this.name] || SPRITES.PLAYER.body;
            ctx.fillRect(screenX + 8, screenY + 8, 16, 20);
    
            ctx.fillStyle = SPRITES.PLAYER.skin;
            ctx.fillRect(screenX + 8, screenY + 4, 16, 16);
        }
        
        // Draw name above NPC using dedicated method
        this._renderName(ctx, screenX, screenY);
    }

    _renderMarker(ctx, screenX, screenY) {
        this.marker.render(ctx, screenX, screenY, this.width);
    }

    /**
     * Renders the NPC's name tag
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     */
    _renderName(ctx, screenX, screenY) {
        // Only render if showNameTag is true 
        if (this.showNameTag !== false) {
            // Allow each NPC to customize their name tag appearance
            // by setting nameTag properties in their constructor
            const nameTag = this.nameTag || {};
            
            // Use customizable properties with defaults
            // Allow NPCs to override aggressive state with their nameTag.color
            // or set nameTag.respectAggressive to false
            let textColor;
            if (nameTag.color && !nameTag.respectAggressive) {
                // Use the exact color specified without considering aggressive state
                textColor = nameTag.color;
            } else if (this.isAggressive && (nameTag.respectAggressive !== false)) {
                // Use aggressive color (red) when NPC is in aggressive state
                textColor = nameTag.aggressiveColor || 'rgba(255, 100, 100, 0.9)';
            } else {
                // Use normal color when not aggressive
                textColor = nameTag.color || 'white';
            }
            const font = nameTag.font || '12px Arial';
            const offsetY = nameTag.offsetY || -5;
            const offsetX = nameTag.offsetX || 16;
            const shadow = nameTag.shadow || false;
            
            // Apply text settings
            ctx.fillStyle = textColor;
            ctx.font = font;
            ctx.textAlign = 'center';
            
            // Apply shadow effect if specified
            if (shadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            }
            
            // Draw the name text
            ctx.fillText(this.name, screenX + offsetX, screenY + offsetY);
            
            // Reset shadow effect
            if (shadow) {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        }
    }

    _renderDebug(ctx, screenX, screenY) {
        if (!this.debug) return;

        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.width, this.height);

        // Interaction radius
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + 16, this.interactionRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Show current tile position
        const tileX = Math.floor(this.x / this.tileSize);
        const tileY = Math.floor(this.y / this.tileSize);
        ctx.fillStyle = 'yellow';
        ctx.fillText(`Tile: (${tileX},${tileY})`, screenX + this.width / 2, screenY - 18);
        
        // Show health info in debug mode
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`HP: ${this.combatSystem.currentHealth}/${this.combatSystem.maxHealth}`, screenX + this.width / 2, screenY - 30);
        
        // Show aggro state if aggressive
        if (this.isAggressive) {
            // Aggro range circle
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.aggroRange, 0, Math.PI * 2);
            ctx.stroke();
            
            // AGGRO text
            ctx.fillStyle = 'red';
            ctx.font = '12px Arial';
            ctx.fillText('AGGRO', screenX + this.width / 2, screenY - 40);
        }
        
        // Show target with a line if there is one
        if (this.targetX !== null && this.targetY !== null) {
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(screenX + this.width / 2, screenY + this.height / 2);
            
            // Calculate target position on screen, pointing to center of the tile
            const targetScreenX = screenX + (this.targetX - this.x) + 16; // +16 to point to center
            const targetScreenY = screenY + (this.targetY - this.y) + 16; // +16 to point to center
            
            ctx.lineTo(targetScreenX, targetScreenY);
            ctx.stroke();
            
            // Draw target point
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(targetScreenX, targetScreenY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Show movement range from spawn
        if (this.moveRange > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.beginPath();
            
            // Convert spawn coordinates to screen coordinates
            const spawnScreenX = screenX + ((this.spawnTileX * this.tileSize) - this.x);
            const spawnScreenY = screenY + ((this.spawnTileY * this.tileSize) - this.y);
            
            // Draw rectangle showing movement range
            const rangeSize = this.moveRange * this.tileSize * 2;
            ctx.strokeRect(
                spawnScreenX - (this.moveRange * this.tileSize), 
                spawnScreenY - (this.moveRange * this.tileSize),
                rangeSize,
                rangeSize
            );
        }
    }

        // Attempt a random movement in cardinal directions (up, down, left, right)
    _moveRandomly(player, map) {
        // Already moving or can't move
        if (this.isMoving || !this.canMove) return;
        
        // Use movement system to move randomly
        const startedMoving = this.movementSystem.moveRandomly(map, player);
        
        // Update NPC state if movement started
        if (startedMoving) {
            this.isMoving = true;
            // Direction is automatically updated by the movement system
            this.direction = this.movementSystem.direction;
        }
    }
    
    // Helper method to attempt movement to a specific tile
    _attemptMove(tileX, tileY, player, map) {
        // Calculate direction for movement
        const currentTileX = Math.floor(this.x / this.tileSize);
        const currentTileY = Math.floor(this.y / this.tileSize);
        const dirX = tileX - currentTileX;
        const dirY = tileY - currentTileY;
        
        // Use movement system to attempt the move
        const startedMoving = this.movementSystem.attemptMove(tileX, tileY, dirX, dirY, map, player);
        
        // Update NPC state if movement started
        if (startedMoving) {
            this.isMoving = true;
            // Direction is automatically updated by the movement system
            this.direction = this.movementSystem.direction;
        }
    }
    
    render(ctx, mapOffset) {
        const screenX = this.x + mapOffset.x;
        const screenY = this.y + mapOffset.y;

        this._renderNPC(ctx, screenX, screenY);
        this._renderMarker(ctx, screenX, screenY);
        this._renderDebug(ctx, screenX, screenY);
        
        this.combatSystem.render(ctx, screenX, screenY);
    }
}
