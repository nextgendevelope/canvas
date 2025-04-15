// layers.js - Manage canvas layers
export class LayerManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.layers = [];
        this.activeLayerIndex = 0;
        
        // DOM elements
        this.layersContainer = document.querySelector('.layers-container');
        
        // Initialize with a default layer
        this.initLayers();
    }
    
    initLayers() {
        // Start with a single layer
        this.addLayer('Background');
    }
    
    addLayer(name = null) {
        // Create a new canvas to store the layer
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.canvasManager.canvas.width;
        layerCanvas.height = this.canvasManager.canvas.height;
        
        // Get the context for the new layer
        const ctx = layerCanvas.getContext('2d');
        
        // For the first layer, copy the current canvas content if it exists
        if (this.layers.length === 0 && this.canvasManager.ctx) {
            ctx.drawImage(this.canvasManager.canvas, 0, 0);
        } else {
            // Make it transparent
            ctx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
        }
        
        // Create layer object
        const layerNumber = this.layers.length + 1;
        const layerName = name || `Layer ${layerNumber}`;
        
        const layer = {
            id: `layer-${Date.now()}`,
            name: layerName,
            canvas: layerCanvas,
            visible: true,
            opacity: 1
        };
        
        // Add to layers array
        this.layers.push(layer);
        
        // Create UI for the layer
        this.createLayerUI(layer, this.layers.length - 1);
        
        // Set as active layer
        this.setActiveLayer(this.layers.length - 1);
        
        // Update canvas
        this.renderLayers();
    }
    
    createLayerUI(layer, index) {
        // Create layer DOM element
        const layerElement = document.createElement('div');
        layerElement.className = 'layer';
        layerElement.dataset.id = layer.id;
        layerElement.innerHTML = `
            <span class="layer-name">${layer.name}</span>
            <div class="layer-controls">
                <button class="layer-visibility" title="Toggle Visibility">👁️</button>
                <button class="layer-delete" title="Delete Layer">🗑️</button>
            </div>
        `;
        
        // Add click handler to select layer
        layerElement.addEventListener('click', (e) => {
            // Don't select if clicking on controls
            if (e.target.closest('.layer-controls')) return;
            
            this.setActiveLayer(index);
        });
        
        // Add visibility toggle
        const visibilityBtn = layerElement.querySelector('.layer-visibility');
        visibilityBtn.addEventListener('click', () => {
            this.toggleLayerVisibility(index);
        });
        
        // Add delete handler
        const deleteBtn = layerElement.querySelector('.layer-delete');
        deleteBtn.addEventListener('click', () => {
            // Don't allow deleting the only layer
            if (this.layers.length > 1) {
                this.deleteLayer(index);
            } else {
                alert('Cannot delete the only layer. Add another layer first.');
            }
        });
        
        // Insert before the "Add Layer" button
        const addButton = this.layersContainer.querySelector('#add-layer');
        this.layersContainer.insertBefore(layerElement, addButton);
    }
    
    setActiveLayer(index) {
        // Update active layer index
        this.activeLayerIndex = index;
        
        // Update UI
        const layerElements = this.layersContainer.querySelectorAll('.layer');
        layerElements.forEach((el, i) => {
            if (i === index) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        // Update canvas context to point to active layer
        this.updateCanvasContext();
    }
    
    updateCanvasContext() {
        // This is a crucial part - we point the main canvas context to the active layer
        const activeLayer = this.layers[this.activeLayerIndex];
        
        // Store original settings
        const settings = {
            strokeStyle: this.canvasManager.ctx.strokeStyle,
            fillStyle: this.canvasManager.ctx.fillStyle,
            lineWidth: this.canvasManager.ctx.lineWidth,
            lineCap: this.canvasManager.ctx.lineCap,
            lineJoin: this.canvasManager.ctx.lineJoin
        };
        
        // Replace the canvas with active layer
        this.canvasManager.ctx = activeLayer.canvas.getContext('2d');
        
        // Restore settings
        Object.assign(this.canvasManager.ctx, settings);
        
        // Render all layers to display
        this.renderLayers();
    }
    
    renderLayers() {
        // Clear the main canvas
        const mainCtx = this.canvasManager.canvas.getContext('2d');
        mainCtx.clearRect(0, 0, this.canvasManager.canvas.width, this.canvasManager.canvas.height);
        
        // Draw each visible layer
        for (const layer of this.layers) {
            if (layer.visible) {
                mainCtx.globalAlpha = layer.opacity;
                mainCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        
        // Reset alpha
        mainCtx.globalAlpha = 1;
    }
    
    toggleLayerVisibility(index) {
        const layer = this.layers[index];
        layer.visible = !layer.visible;
        
        // Update UI
        const layerElements = this.layersContainer.querySelectorAll('.layer');
        const visibilityBtn = layerElements[index].querySelector('.layer-visibility');
        
        if (layer.visible) {
            visibilityBtn.textContent = '👁️';
        } else {
            visibilityBtn.textContent = '👁️‍🗨️';
        }
        
        // Re-render layers
        this.renderLayers();
    }
    
    deleteLayer(index) {
        // Remove layer
        this.layers.splice(index, 1);
        
        // Remove UI element
        const layerElements = this.layersContainer.querySelectorAll('.layer');
        layerElements[index].remove();
        
        // If active layer is deleted, select another layer
        if (index === this.activeLayerIndex) {
            this.setActiveLayer(Math.max(0, index - 1));
        } else if (index < this.activeLayerIndex) {
            // Adjust active layer index if a layer before it was deleted
            this.activeLayerIndex--;
        }
        
        // Re-render layers
        this.renderLayers();
    }
    
    resetLayers() {
        // Clear all layers
        this.layers = [];
        
        // Clear UI
        const layerElements = this.layersContainer.querySelectorAll('.layer');
        layerElements.forEach(el => el.remove());
        
        // Re-initialize
        this.initLayers();
    }
    
    // Method to resize all layers when canvas size changes
    resizeLayers(width, height) {
        for (const layer of this.layers) {
            // Create a new canvas with new dimensions
            const newCanvas = document.createElement('canvas');
            newCanvas.width = width;
            newCanvas.height = height;
            
            // Copy content from old canvas
            const ctx = newCanvas.getContext('2d');
            ctx.drawImage(layer.canvas, 0, 0);
            
            // Replace old canvas
            layer.canvas = newCanvas;
        }
        
        // Update the main canvas context
        this.updateCanvasContext();
    }
}
