/**
 * Preprocesses the image for better OCR results.
 * Applies grayscale, contrast increase, and thresholding.
 * @param {HTMLImageElement} imgElement - The source image
 * @returns {string} Data URL of the processed image
 */
export function preprocessImage(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  
  ctx.drawImage(imgElement, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Parameters
  const threshold = 120; // 0-255, adjust based on Riven mod background
  const contrast = 80; // 0-100ish
  
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    // 1. Grayscale
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Standard luminance formula
    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // 2. Contrast
    gray = contrastFactor * (gray - 128) + 128;
    
    // Clamp
    gray = Math.max(0, Math.min(255, gray));
    
    // 3. Threshold (Binarization)
    // Invert because Riven text is often purple/white on dark, we want Black text on White background for Tesseract usually?
    // Tesseract works best with dark text on light background.
    // Riven mods: Text is usually light (purple/white) on dark background.
    // So if gray > threshold (light pixel), make it Black (text). Else White (bg).
    // Wait, Tesseract standard is Black text on White bg.
    // If pixel is light (text), we want it to be dark (0).
    // If pixel is dark (bg), we want it to be light (255).
    
    // But let's check what the user suggested: "texte soit noir pur sur fond blanc pur".
    // So Text (which is light) -> Black (0).
    // Background (which is dark) -> White (255).
    
    let val;
    if (gray > threshold) {
      val = 0; // Text becomes black
    } else {
      val = 255; // Background becomes white
    }
    
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    // Alpha unchanged
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9); // High quality jpeg
}
