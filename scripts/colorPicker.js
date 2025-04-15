// colorPicker.js - Manage color selection and color history
export class ColorManager {
    constructor() {
        this.currentColor = '#000000';
        this.recentColors = [];
        this.maxRecentColors = 10;
        
        // Initialize with some default colors
        this.initializeColorPalette();
    }
    
    initializeColorPalette() {
        // Default colors are already in the HTML
        // We could dynamically generate these if needed
    }
    
    setColor(color) {
        this.currentColor = color;
        this.addToRecentColors(color);
        
        // Dispatch a custom event so other components can react
        document.dispatchEvent(new CustomEvent('colorchange', { detail: { color } }));
    }
    
    getColor() {
        return this.currentColor;
    }
    
    addToRecentColors(color) {
        // Remove if already exists
        const index = this.recentColors.indexOf(color);
        if (index !== -1) {
            this.recentColors.splice(index, 1);
        }
        
        // Add to front
        this.recentColors.unshift(color);
        
        // Keep at max length
        if (this.recentColors.length > this.maxRecentColors) {
            this.recentColors.pop();
        }
        
        // Update UI if we have a dynamic recent colors UI
        this.updateRecentColorsUI();
    }
    
    updateRecentColorsUI() {
        // This would update a UI component showing recent colors
        // For now, this is a placeholder as the current HTML doesn't include this
        // We could add this feature later
    }
    
    // Add color to palette (could be used for a "save to palette" feature)
    addToPalette(color) {
        const paletteContainer = document.querySelector('.color-palette');
        if (!paletteContainer) return;
        
        // Check if color already exists
        const swatches = paletteContainer.querySelectorAll('.color-swatch');
        for (const swatch of swatches) {
            if (swatch.style.backgroundColor === color) {
                return; // Color already in palette
            }
        }
        
        // Create new swatch
        const swatch = document.createElement('span');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        
        // Add click handler
        swatch.addEventListener('click', () => {
            this.setColor(color);
            document.getElementById('color-selector').value = color;
        });
        
        // Add to palette
        paletteContainer.appendChild(swatch);
    }
}
