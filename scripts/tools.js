// tools.js - Manage drawing tools and their interactions
export class ToolManager {
    constructor(canvasManager, colorManager) {
        this.canvasManager = canvasManager;
        this.colorManager = colorManager;
        this.canvas = canvasManager.canvas;
        
        // Tool state
        this.activeTool = 'brush';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 5;
        this.opacity = 1;
        this.fill = false;
        
        // For shape tools
        this.startX = 0;
        this.startY = 0;
        
        // Initialize event listeners
        this.initEvents();
    }
    
    initEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    // Get coordinates relative to canvas
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        if (e.touches) {
            // Touch event
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        } else {
            // Mouse event
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }
    }
    
    // Event handlers
    handleMouseDown(e) {
        const { x, y } = this.getCoordinates(e);
        this.startDrawing(x, y);
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const { x, y } = this.getCoordinates(e);
        this.draw(x, y);
    }
    
    handleMouseUp() {
        this.endDrawing();
    }
    
    handleMouseOut() {
        this.endDrawing();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const { x, y } = this.getCoordinates(e);
        this.startDrawing(x, y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        
        const { x, y } = this.getCoordinates(e);
        this.draw(x, y);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.endDrawing();
    }
    
    // Drawing methods
    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        this.startX = x;
        this.startY = y;
        
        // For point-based tools, draw immediately
        if (this.activeTool === 'brush' || this.activeTool === 'pencil' || this.activeTool === 'eraser') {
            this.draw(x, y);
        } else if (this.activeTool === 'eyedropper') {
            // For eyedropper, pick color and switch back to previous tool
            const color = this.canvasManager.getPixelColor(x, y);
            this.colorManager.setColor(color);
            document.getElementById('color-selector').value = color;
            this.isDrawing = false;
        } else if (this.activeTool === 'fill') {
            // For fill tool, fill area and end drawing
            this.canvasManager.fillArea(x, y, this.colorManager.getColor());
            this.canvasManager.saveState();
            this.isDrawing = false;
        }
    }
    
    draw(x, y) {
        const options = {
            color: this.activeTool ===
