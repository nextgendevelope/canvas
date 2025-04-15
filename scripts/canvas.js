// canvas.js - Handle canvas operations and states
export class CanvasManager {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        this.ctx = canvas.getContext('2d');
        
        // Canvas state
        this.history = [];
        this.historyIndex = -1;
        this.MAX_HISTORY = 20;
        
        // Initialize canvas
        this.initCanvas();
    }
    
    initCanvas() {
        // Set initial canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Set default styles
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Initialize with a white background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save initial state
        this.saveState();
    }
    
    resizeCanvas() {
        // Keep the current image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Get container dimensions
        const padding = 40; // padding around the canvas
        const containerWidth = this.container.clientWidth - padding;
        const containerHeight = this.container.clientHeight - padding;
        
        // Maintain aspect ratio
        const aspectRatio = this.canvas.width / this.canvas.height;
        
        // Calculate new dimensions
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        }
        
        // Apply new dimensions to the canvas display size (CSS)
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
        
        // Restore image data
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    saveState() {
        // Remove any states that were undone
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add current state to history
        this.history.push(this.canvas.toDataURL());
        
        // Limit history size
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
        }
    }
    
    loadState(dataURL) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }
    
    saveCanvas(name) {
        const link = document.createElement('a');
        link.download = `${name || 'artwork'}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    // Drawing methods will be called by the tool manager
    drawLine(x0, y0, x1, y1, options = {}) {
        const { color = '#000000', size = 5, opacity = 1 } = options;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = size;
        this.ctx.globalAlpha = opacity;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }
    
    drawPoint(x, y, options = {}) {
        const { color = '#000000', size = 5, opacity = 1 } = options;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = opacity;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawRect(x0, y0, x1, y1, options = {}) {
        const { color = '#000000', size = 1, fill = false, opacity = 1 } = options;
        
        const width = x1 - x0;
        const height = y1 - y0;
        
        this.ctx.globalAlpha = opacity;
        
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x0, y0, width, height);
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = size;
            this.ctx.strokeRect(x0, y0, width, height);
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawCircle(x0, y0, x1, y1, options = {}) {
        const { color = '#000000', size = 1, fill = false, opacity = 1 } = options;
        
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        
        this.ctx.beginPath();
        this.ctx.arc(x0, y0, radius, 0, Math.PI * 2);
        this.ctx.globalAlpha = opacity;
        
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = size;
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    fillArea(x, y, color, targetColor) {
        // Get the clicked pixel's color
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        const getIndex = (x, y) => (y * this.canvas.width + x) * 4;
        
        // Get the target color if not provided
        if (!targetColor) {
            const index = getIndex(x, y);
            targetColor = [
                data[index],
                data[index + 1],
                data[index + 2],
                data[index + 3]
            ];
        }
        
        // Convert hex color to RGBA
        const fillColor = hexToRgba(color);
        
        // Check if colors are the same
        const sameColor = (
            targetColor[0] === fillColor[0] &&
            targetColor[1] === fillColor[1] &&
            targetColor[2] === fillColor[2] &&
            targetColor[3] === fillColor[3]
        );
        
        if (sameColor) return;
        
        // Flood fill algorithm
        const stack = [[x, y]];
        const visited = new Set();
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        while (stack.length > 0) {
            const [curX, curY] = stack.pop();
            const index = getIndex(curX, curY);
            
            // Check if this pixel has the target color
            const isSameColor = (
                data[index] === targetColor[0] &&
                data[index + 1] === targetColor[1] &&
                data[index + 2] === targetColor[2] &&
                data[index + 3] === targetColor[3]
            );
            
            const key = `${curX},${curY}`;
            if (curX < 0 || curY < 0 || curX >= width || curY >= height || !isSameColor || visited.has(key)) {
                continue;
            }
            
            // Set the new color
            data[index] = fillColor[0];
            data[index + 1] = fillColor[1];
            data[index + 2] = fillColor[2];
            data[index + 3] = fillColor[3];
            
            visited.add(key);
            
            // Add neighboring pixels
            stack.push([curX + 1, curY]);
            stack.push([curX - 1, curY]);
            stack.push([curX, curY + 1]);
            stack.push([curX, curY - 1]);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    getPixelColor(x, y) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
    }
}

// Utility function to convert hex color to RGBA array
function hexToRgba(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b, 255]; // Full opacity
}
