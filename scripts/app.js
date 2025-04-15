// app.js - Main entry point for the application
import { CanvasManager } from './canvas.js';
import { ToolManager } from './tools.js';
import { ColorManager } from './colorPicker.js';
import { LayerManager } from './layers.js';
import { ExportManager } from './export.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('art-canvas');
    const canvasContainer = document.querySelector('.canvas-container');
    
    // Initialize managers
    const canvasManager = new CanvasManager(canvas, canvasContainer);
    const colorManager = new ColorManager();
    const layerManager = new LayerManager(canvasManager);
    const toolManager = new ToolManager(canvasManager, colorManager);
    const exportManager = new ExportManager(canvasManager);
    
    // Set up event listeners
    setupEventListeners(canvasManager, toolManager, colorManager, layerManager, exportManager);
    
    // Initialize the application
    window.addEventListener('resize', () => canvasManager.resizeCanvas());
    canvasManager.resizeCanvas();
});

function setupEventListeners(canvasManager, toolManager, colorManager, layerManager, exportManager) {
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            toolManager.setActiveTool(btn.id);
        });
    });
    
    // Color selection
    document.getElementById('color-selector').addEventListener('input', (e) => {
        colorManager.setColor(e.target.value);
    });
    
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.style.backgroundColor;
            colorManager.setColor(rgbToHex(color));
            document.getElementById('color-selector').value = rgbToHex(color);
        });
    });
    
    // Brush size
    document.getElementById('brush-size').addEventListener('input', (e) => {
        const size = e.target.value;
        document.getElementById('brush-size-display').textContent = `${size}px`;
        toolManager.setBrushSize(parseInt(size));
    });
    
    // Opacity
    document.getElementById('opacity').addEventListener('input', (e) => {
        const opacity = e.target.value;
        document.getElementById('opacity-display').textContent = `${opacity}%`;
        toolManager.setOpacity(parseInt(opacity) / 100);
    });
    
    // Layers
    document.getElementById('add-layer').addEventListener('click', () => {
        layerManager.addLayer();
    });
    
    // Undo/Redo
    document.getElementById('undo').addEventListener('click', () => {
        canvasManager.undo();
    });
    
    document.getElementById('redo').addEventListener('click', () => {
        canvasManager.redo();
    });
    
    // File operations
    document.getElementById('new-canvas').addEventListener('click', () => {
        if (confirm('Create a new canvas? Current work will be lost if not saved.')) {
            canvasManager.clearCanvas();
            layerManager.resetLayers();
        }
    });
    
    document.getElementById('save-canvas').addEventListener('click', () => {
        const name = prompt('Enter a name for your artwork:', 'my-artwork');
        if (name) {
            canvasManager.saveCanvas(name);
        }
    });
    
    document.getElementById('export-canvas').addEventListener('click', () => {
        exportManager.showExportOptions();
    });
}

// Utility function to convert RGB to HEX
function rgbToHex(rgb) {
    // Extract RGB values from the string like 'rgb(255, 0, 0)'
    const [r, g, b] = rgb.match(/\d+/g);
    return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
}
