// export.js - Handle exporting canvas to different formats
export class ExportManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }
    
    showExportOptions() {
        // Create a modal for export options
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.innerHTML = `
            <div class="export-dialog">
                <h2>Export Artwork</h2>
                
                <div class="export-option">
                    <h3>Format</h3>
                    <select id="export-format">
                        <option value="png">PNG Image</option>
                        <option value="jpeg">JPEG Image</option>
                        <option value="svg">SVG Vector</option>
                    </select>
                </div>
                
                <div class="export-option">
                    <h3>Quality/Size</h3>
                    <div id="quality-option">
                        <label>Quality: <span id="quality-value">90%</span></label>
                        <input type="range" id="export-quality" min="10" max="100" value="90">
                    </div>
                    <div id="size-option">
                        <label>Scale: <span id="scale-value">100%</span></label>
                        <input type="range" id="export-scale" min="10" max="200" value="100">
                    </div>
                </div>
                
                <div class="export-option">
                    <h3>Filename</h3>
                    <input type="text" id="export-filename" value="my-artwork" placeholder="Enter filename">
                </div>
                
                <div class="export-preview">
                    <h3>Preview</h3>
                    <div class="preview-container">
                        <img id="export-preview" src="" alt="Export Preview">
                        <p id="export-info">Size: 0KB</p>
                    </div>
                </div>
                
                <div class="export-actions">
                    <button id="export-cancel">Cancel</button>
                    <button id="export-download">Download</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .export-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .export-dialog {
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                width: 500px;
                max-width: 90%;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .export-dialog h2 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #2c3e50;
                font-size: 1.5rem;
            }
            
            .export-option {
                margin-bottom: 20px;
            }
            
            .export-option h3 {
                margin-bottom: 10px;
                color: #2c3e50;
                font-size: 1rem;
            }
            
            .export-option select,
            .export-option input[type="text"] {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .export-option input[type="range"] {
                width: 100%;
                margin: 10px 0;
            }
            
            .export-preview {
                margin-bottom: 20px;
            }
            
            .preview-container {
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 4px;
                text-align: center;
            }
            
            #export-preview {
                max-width: 100%;
                max-height: 200px;
                margin-bottom: 10px;
            }
            
            #export-info {
                font-size: 0.9rem;
                color: #666;
                margin: 0;
            }
            
            .export-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .export-actions button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-size: 14px;
            }
            
            #export-cancel {
                background-color: #ecf0f1;
                color: #2c3e50;
            }
            
            #export-download {
                background-color: #3498db;
                color: white;
            }
            
            #export-download:hover {
                background-color: #2980b9;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        const formatSelect = document.getElementById('export-format');
        const qualityOption = document.getElementById('quality-option');
        const sizeOption = document.getElementById('size-option');
        const qualitySlider = document.getElementById('export-quality');
        const qualityValue = document.getElementById('quality-value');
        const scaleSlider = document.getElementById('export-scale');
        const scaleValue = document.getElementById('scale-value');
        const filenameInput = document.getElementById('export-filename');
        const previewImg = document.getElementById('export-preview');
        const infoText = document.getElementById('export-info');
        const cancelBtn = document.getElementById('export-cancel');
        const downloadBtn = document.getElementById('export-download');
        
        // Set up format-specific options
        formatSelect.addEventListener('change', () => {
            const format = formatSelect.value;
            
            if (format === 'jpeg') {
                qualityOption.style.display = 'block';
                sizeOption.style.display = 'block';
            } else if (format === 'png') {
                qualityOption.style.display = 'none';
                sizeOption.style.display = 'block';
            } else if (format === 'svg') {
                qualityOption.style.display = 'none';
                sizeOption.style.display = 'none';
            }
            
            this.updatePreview();
        });
        
        // Update quality display
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${qualitySlider.value}%`;
            this.updatePreview();
        });
        
        // Update scale display
        scaleSlider.addEventListener('input', () => {
            scaleValue.textContent = `${scaleSlider.value}%`;
            this.updatePreview();
        });
        
        // Cancel button
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
        
        // Download button
        downloadBtn.addEventListener('click', () => {
            const format = formatSelect.value;
            const quality = qualitySlider.value / 100;
            const scale = scaleSlider.value / 100;
            const filename = filenameInput.value || 'my-artwork';
            
            this.exportCanvas(format, quality, scale, filename);
            modal.remove();
            style.remove();
        });
        
        // Initialize preview
        this.updatePreview();
    }
    
    updatePreview() {
        const format = document.getElementById('export-format').value;
        const quality = document.getElementById('export-quality').value / 100;
        const scale = document.getElementById('export-scale').value / 100;
        
        const previewImg = document.getElementById('export-preview');
        const infoText = document.getElementById('export-info');
        
        let dataURL;
        if (format === 'jpeg') {
            dataURL = this.getScaledCanvas(scale).toDataURL('image/jpeg', quality);
        } else if (format === 'png') {
            dataURL = this.getScaledCanvas(scale).toDataURL('image/png');
        } else if (format === 'svg') {
            // SVG export would need a different approach - for simplicity showing PNG
            dataURL = this.canvasManager.canvas.toDataURL('image/png');
        }
        
        previewImg.src = dataURL;
        
        // Estimate file size
        const base64 = dataURL.split(',')[1];
        const byteLength = this.calculateBase64Size(base64);
        const sizeInKB = Math.round(byteLength / 1024);
        
        infoText.textContent = `Size: ~${sizeInKB} KB`;
    }
    
    calculateBase64Size(base64String) {
        // Calculate the approximate size of a base64 string in bytes
        return (base64String.length * 3) / 4;
    }
    
    getScaledCanvas(scale) {
        const canvas = this.canvasManager.canvas;
        
        if (scale === 1) return canvas;
        
        // Create a new canvas with scaled dimensions
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;
        
        // Draw original canvas content to scaled canvas
        const ctx = scaledCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        
        return scaledCanvas;
    }
    
    exportCanvas(format, quality, scale, filename) {
        let dataURL;
        let fileExtension;
        
        if (format === 'jpeg') {
            dataURL = this.getScaledCanvas(scale).toDataURL('image/jpeg', quality);
            fileExtension = 'jpg';
        } else if (format === 'png') {
            dataURL = this.getScaledCanvas(scale).toDataURL('image/png');
            fileExtension = 'png';
        } else if (format === 'svg') {
            // Simple SVG conversion (actual implementation would be more complex)
            const canvas = this.canvasManager.canvas;
            const svgData = this.canvasToSVG(canvas);
            dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
            fileExtension = 'svg';
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}.${fileExtension}`;
        link.href = dataURL;
        link.click();
    }
    
    canvasToSVG(canvas) {
        // This is a simplified version - a real implementation would need to
        // analyze the canvas content and convert it to SVG paths
        const width = canvas.width;
        const height = canvas.height;
        
        // Create SVG header
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Add a background rect
        svg += `<rect width="${width}" height="${height}" fill="white"/>`;
        
        // Add a note that this is a placeholder for proper conversion
        svg += `<text x="10" y="20" font-family="Arial" font-size="14">
            This is a simplified SVG export. A full implementation would convert canvas paths to SVG elements.
        </text>`;
        
        // Close SVG
        svg += '</svg>';
        
        return svg;
    }
}
