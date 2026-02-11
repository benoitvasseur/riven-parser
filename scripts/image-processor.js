/**
 * Detects the region of interest (text area) in the Riven card
 * by finding the bounding box that contains most of the text content.
 * @param {ImageData} imageData - The binary image data
 * @returns {Object} { x, y, width, height } of the text region
 */
function detectTextRegion(imageData) {
  const { width, height, data } = imageData;
  
  // Find content bounds by detecting non-white pixels
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pixel = data[i]; // Grayscale, so R = G = B
      
      // If pixel is black (text)
      if (pixel < 128) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  // Add padding but focus on the center region (where text typically is)
  // Riven cards have decorative borders, text is usually in the center 60-80% area
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  
  // Crop to exclude ~15% from each side (where decorations typically are)
  const horizontalMargin = Math.floor(width * 0.15);
  const verticalMargin = Math.floor(height * 0.10);
  
  return {
    x: Math.max(0, horizontalMargin),
    y: Math.max(0, verticalMargin),
    width: Math.min(width - horizontalMargin * 2, width),
    height: Math.min(height - verticalMargin * 2, height)
  };
}

/**
 * Applies morphological operations to clean up the image
 * @param {ImageData} imageData - The image data
 * @param {string} operation - 'erode' or 'dilate'
 * @param {number} kernelSize - Size of the kernel (must be odd)
 * @returns {ImageData} Processed image data
 */
function morphologicalOperation(imageData, operation, kernelSize = 3) {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  const radius = Math.floor(kernelSize / 2);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let value = operation === 'erode' ? 255 : 0;
      
      // Check kernel
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const i = ((y + ky) * width + (x + kx)) * 4;
          const pixel = data[i];
          
          if (operation === 'erode') {
            value = Math.min(value, pixel);
          } else {
            value = Math.max(value, pixel);
          }
        }
      }
      
      const i = (y * width + x) * 4;
      output[i] = output[i + 1] = output[i + 2] = value;
    }
  }
  
  const result = new ImageData(width, height);
  result.data.set(output);
  return result;
}

/**
 * Removes small isolated noise (small connected components)
 * @param {ImageData} imageData - The binary image data
 * @param {number} minSize - Minimum component size to keep
 * @returns {ImageData} Cleaned image data
 */
function removeSmallComponents(imageData, minSize = 20) {
  const { width, height, data } = imageData;
  const visited = new Array(width * height).fill(false);
  const output = new Uint8ClampedArray(data);
  
  // Flood fill to find connected components
  function floodFill(startX, startY) {
    const stack = [[startX, startY]];
    const component = [];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) continue;
      
      const i = idx * 4;
      if (data[i] > 128) continue; // White pixel (background)
      
      visited[idx] = true;
      component.push(idx);
      
      // 4-connectivity
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    return component;
  }
  
  // Find and remove small components
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      
      if (!visited[idx] && data[i] < 128) {
        const component = floodFill(x, y);
        
        // If component is too small, remove it (make it white)
        if (component.length < minSize) {
          component.forEach(idx => {
            const i = idx * 4;
            output[i] = output[i + 1] = output[i + 2] = 255;
          });
        }
      }
    }
  }
  
  const result = new ImageData(width, height);
  result.data.set(output);
  return result;
}

/**
 * Preprocesses the image for better OCR results.
 * Applies grayscale, contrast increase, thresholding, morphological operations,
 * and region of interest detection to focus on text areas.
 * @param {HTMLImageElement} imgElement - The source image
 * @returns {string} Data URL of the processed image
 */
export function preprocessImage(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  
  ctx.drawImage(imgElement, 0, 0);
  
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Parameters
  const threshold = 120; // 0-255, adjust based on Riven mod background
  const contrast = 80; // 0-100ish
  
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  // Step 1: Grayscale, Contrast, and Binarization
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Standard luminance formula
    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Contrast enhancement
    gray = contrastFactor * (gray - 128) + 128;
    gray = Math.max(0, Math.min(255, gray));
    
    // Binarization: Text (light) -> Black (0), Background (dark) -> White (255)
    let val;
    if (gray > threshold) {
      val = 0; // Text becomes black
    } else {
      val = 255; // Background becomes white
    }
    
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  
  // Step 2: Remove small noise components
  imageData = removeSmallComponents(imageData, 15);
  
  // Step 3: Morphological opening (erosion followed by dilation) to remove thin decorations
  imageData = morphologicalOperation(imageData, 'erode', 2);
  imageData = morphologicalOperation(imageData, 'dilate', 2);
  
  // Step 4: Detect text region and crop to ROI
  const roi = detectTextRegion(imageData);
  
  // Create new canvas with cropped region
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  
  croppedCanvas.width = roi.width;
  croppedCanvas.height = roi.height;
  
  // Put the processed image data back
  ctx.putImageData(imageData, 0, 0);
  
  // Draw the ROI region onto the cropped canvas
  croppedCtx.fillStyle = 'white';
  croppedCtx.fillRect(0, 0, roi.width, roi.height);
  croppedCtx.drawImage(
    canvas,
    roi.x, roi.y, roi.width, roi.height,
    0, 0, roi.width, roi.height
  );
  
  return croppedCanvas.toDataURL('image/png'); // PNG preserves sharp edges better than JPEG
}

/**
 * Returns optimized Tesseract configuration for Riven mod OCR
 * @returns {Object} Tesseract configuration object
 */
export function getTesseractConfig() {
  return {
    lang: 'eng',
    // PSM 6: Assume a single uniform block of text
    // PSM 11: Sparse text - Find as much text as possible in no particular order (alternative)
    tessedit_pageseg_mode: 6,
    
    // Character whitelist - only allow characters that appear in Riven mods
    // Letters (upper/lower), numbers, spaces, +, -, %, ., /
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 +-.%/',
    
    // Preserve interword spaces
    preserve_interword_spaces: '1',
  };
}

/**
 * Filters OCR result to remove noise and aberrant lines
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
export function cleanOCRText(text) {
  if (!text) return '';
  
  const lines = text.split('\n');
  const cleanedLines = [];
  
  for (let line of lines) {
    line = line.trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Skip lines that are too short (likely noise)
    if (line.length < 2) continue;
    
    // Check if line looks like a valid stat or weapon name
    const hasNumber = /\d/.test(line);
    const hasLetter = /[a-zA-Z]/.test(line);
    const wordCount = line.split(/\s+/).filter(w => w.length > 0).length;
    
    // Filter short meaningless lines (e.g., "ps", "PE", "Co", "Lr uy ig 4")
    // Valid lines should either:
    // 1. Be a stat line: contain numbers AND letters AND reasonable word count
    // 2. Be a weapon name: contain letters AND be longer OR have recognizable words
    if (line.length <= 4) {
      // Very short lines must look like partial stats (have both numbers and letters)
      // or be potential abbreviations (MR, etc.)
      if (wordCount === 1 && hasLetter && !hasNumber) {
        // Single short word without number (e.g., "ps", "PE", "Co") - likely noise
        continue;
      }
      if (wordCount >= 3 && line.length <= 15) {
        // Multiple tiny words cramped together (e.g., "Lr uy ig 4") - likely noise
        const avgWordLength = line.replace(/\s+/g, '').length / wordCount;
        if (avgWordLength < 2) {
          continue;
        }
      }
    }
    
    // Skip lines with too many special characters (decorations detected as text)
    const specialCharCount = (line.match(/[^a-zA-Z0-9\s+\-.%]/g) || []).length;
    const specialCharRatio = specialCharCount / line.length;
    if (specialCharRatio > 0.4) {
      continue;
    }
    
    // Skip lines with too many consecutive special chars (e.g., "---", "===")
    if (/[^a-zA-Z0-9\s]{4,}/.test(line)) {
      continue;
    }
    
    // Skip lines that are likely decorative patterns
    // Example: lines with repeating patterns like "- - - -" or "= = ="
    if (/^[\s\-_=.]{4,}$/.test(line)) {
      continue;
    }
    
    // Skip lines with weird spacing patterns (likely OCR artifacts)
    // BUT: Keep lines that look like stat lines (have number + % + stat name)
    // More than 5 spaces in a row is suspicious
    if (/\s{6,}/.test(line)) {
      // Exception: if line contains percentage sign and numbers, it's likely a stat
      const looksLikeStat = /\d+\s*[%/]\s*[a-zA-Z]/.test(line);
      if (!looksLikeStat) {
        continue;
      }
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n');
}
