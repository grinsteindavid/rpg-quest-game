/**
 * Manages the Diablo 2 style inventory UI with grid-based inventory slots.
 */
export class InventoryUI {
    /** @private @type {HTMLElement} The main container for the inventory UI */
    _container;
    /** @private @type {boolean} Whether the inventory is visible */
    _visible = false;
    /** @private @type {number} Number of inventory slots per row */
    _slotsPerRow = 10;
    /** @private @type {number} Total number of inventory slots */
    _totalSlots = 40; // 4 rows x 10 columns
    /** @private @type {number} Currently selected slot index */
    _selectedSlotIndex = 0;

    /**
     * Creates a new InventoryUI instance.
     */
    constructor() {
        // Create inventory container if it doesn't exist
        let container = document.getElementById('inventory-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'inventory-container';
            container.classList.add('hidden');
            container.innerHTML = `
                <div class="inventory-panel">
                    <div class="inventory-header">
                        <div class="inventory-title">Inventory</div>
                        <button class="inventory-close">X</button>
                    </div>
                    <div class="inventory-content">
                        <div class="inventory-grid">
                            <div class="inventory-slots">${this._generateInventorySlots()}</div>
                        </div>
                    </div>
                    <div class="inventory-nav-hint">Use Arrow Keys or Touch to Navigate</div>
                </div>
            `;
            document.getElementById('game-container').appendChild(container);
        }
        
        this._container = container;
        
        // Setup event listeners
        this._setupEventListeners();
    }

    /**
     * Generates HTML for inventory slots
     * @private
     * @returns {string} HTML string with inventory slots
     */
    _generateInventorySlots() {
        let slotsHTML = '';
        for (let i = 0; i < this._totalSlots; i++) {
            const selectedClass = i === 0 ? 'selected' : '';
            slotsHTML += `<div class="inventory-slot ${selectedClass}" data-slot-index="${i}"></div>`;
        }
        return slotsHTML;
    }

    /**
     * Sets up event listeners for the inventory UI
     * @private
     */
    _setupEventListeners() {
        // Close button
        const closeButton = this._container.querySelector('.inventory-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this._visible) return;
            
            let newIndex = this._selectedSlotIndex;
            
            switch (e.key) {
                case 'ArrowUp':
                    newIndex -= this._slotsPerRow;
                    break;
                case 'ArrowDown':
                    newIndex += this._slotsPerRow;
                    break;
                case 'ArrowLeft':
                    newIndex -= 1;
                    break;
                case 'ArrowRight':
                    newIndex += 1;
                    break;
                case 'Escape':
                    this.hide();
                    return;
            }
            
            // Ensure the new index is within bounds
            if (newIndex >= 0 && newIndex < this._totalSlots) {
                this._selectSlot(newIndex);
            }
            
            // Prevent default actions (scrolling) when using arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Touch/click selection
        const slots = this._container.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const index = parseInt(slot.getAttribute('data-slot-index'));
                this._selectSlot(index);
            });
        });
    }

    /**
     * Selects an inventory slot by index
     * @private
     * @param {number} index - Index of the slot to select
     */
    _selectSlot(index) {
        // Remove selected class from current slot
        const currentSlot = this._container.querySelector(`.inventory-slot[data-slot-index="${this._selectedSlotIndex}"]`);
        if (currentSlot) {
            currentSlot.classList.remove('selected');
        }
        
        // Add selected class to new slot
        const newSlot = this._container.querySelector(`.inventory-slot[data-slot-index="${index}"]`);
        if (newSlot) {
            newSlot.classList.add('selected');
            this._selectedSlotIndex = index;
            
            // Ensure the selected slot is visible (auto-scroll)
            newSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Shows the inventory UI
     */
    show() {
        if (this._visible) return;
        
        this._visible = true;
        this._container.classList.remove('hidden');
        
        // Reset selection to first slot
        this._selectSlot(0);
    }

    /**
     * Hides the inventory UI
     */
    hide() {
        if (!this._visible) return;
        
        this._visible = false;
        this._container.classList.add('hidden');
    }

    /**
     * Toggles the inventory visibility
     */
    toggle() {
        if (this._visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Checks if the inventory is visible
     * @returns {boolean} Whether the inventory is visible
     */
    isVisible() {
        return this._visible;
    }
}
