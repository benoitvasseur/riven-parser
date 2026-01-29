// Module for "New" tab
import { parseRivenData, validateRivenData, formatRivenData } from './riven-parser.js';

// Tesseract worker instance
let tesseractWorker = null;

/**
 * Initializes the New tab content
 */
export function initNouveauTab() {
  console.log('New tab initialized');
  initImageUpload();
  initTesseractWorker();
}

/**
 * Refreshes the New tab content
 */
export function refreshNouveauTab() {
  console.log('New tab refreshed');
}

/**
 * Cleans up resources (call when leaving tab or closing extension)
 */
export async function cleanupNouveauTab() {
  if (tesseractWorker) {
    console.log('Terminating Tesseract worker...');
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * Initializes Tesseract worker for OCR
 */
async function initTesseractWorker() {
  try {
    console.log('Initializing Tesseract worker...');
    
    // Configuration for Chrome extension
    const workerPath = chrome.runtime.getURL('libs/worker.min.js');
    const corePath = chrome.runtime.getURL('libs/tesseract.min.js');
    
    console.log('Worker path:', workerPath);
    console.log('Core path:', corePath);
    
    tesseractWorker = await Tesseract.createWorker('eng', 1, {
      workerPath: workerPath,
      corePath: corePath,
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          updateOCRProgress(m.progress);
        }
      }
    });
    console.log('Tesseract worker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Tesseract worker:', error);
  }
}

/**
 * Initializes the image upload system with drag & drop
 */
function initImageUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const removeBtn = document.getElementById('removeBtn');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');

  // Click on upload button
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Click on drop zone (except on button)
  dropZone.addEventListener('click', (e) => {
    if (e.target !== uploadBtn && !uploadBtn.contains(e.target)) {
      fileInput.click();
    }
  });

  // File selection via input
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  // Remove button
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage();
  });

  // Drag & drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  });
}

/**
 * Handles the selected or dropped file
 */
function handleFile(file) {
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    alert('Please select a PNG or JPG file');
    return;
  }

  // Read and display preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById('previewImg');
    const imagePreview = document.getElementById('imagePreview');
    const dropZoneContent = document.querySelector('.drop-zone-content');

    previewImg.src = e.target.result;
    dropZoneContent.style.display = 'none';
    imagePreview.style.display = 'flex';

    // Call processing method
    handleNewRivenImg(file, e.target.result);
  };
  reader.readAsDataURL(file);
}

/**
 * Removes the selected image
 */
function clearImage() {
  const fileInput = document.getElementById('fileInput');
  const imagePreview = document.getElementById('imagePreview');
  const dropZoneContent = document.querySelector('.drop-zone-content');
  const previewImg = document.getElementById('previewImg');
  const ocrResultsSection = document.getElementById('ocrResultsSection');

  fileInput.value = '';
  previewImg.src = '';
  imagePreview.style.display = 'none';
  dropZoneContent.style.display = 'flex';
  
  // Hide OCR results section
  if (ocrResultsSection) {
    ocrResultsSection.style.display = 'none';
  }
}

/**
 * Processes a new Riven image
 * @param {File} file - The image file
 * @param {string} dataUrl - The data URL of the image
 */
async function handleNewRivenImg(file, dataUrl) {
  console.log('New Riven image received:', file.name, file.size, 'bytes');
  
  // Show OCR section
  const ocrResultsSection = document.getElementById('ocrResultsSection');
  const ocrStatus = document.getElementById('ocrStatus');
  const ocrResults = document.getElementById('ocrResults');
  
  ocrResultsSection.style.display = 'block';
  ocrStatus.style.display = 'flex';
  ocrResults.style.display = 'none';
  
  // Update status
  updateOCRStatus('⏳', 'Initializing OCR...');
  
  try {
    // Ensure worker is initialized
    if (!tesseractWorker) {
      await initTesseractWorker();
    }
    
    updateOCRStatus('🔍', 'Analyzing image...');
    
    // Perform OCR
    const result = await tesseractWorker.recognize(dataUrl);
    
    console.log('OCR result:', result);
    
    // Display results
    displayOCRResults(result);
    
  } catch (error) {
    console.error('OCR error:', error);
    updateOCRStatus('❌', 'OCR failed. Please try again.');
  }
}

/**
 * Updates OCR status message
 * @param {string} icon - Status icon
 * @param {string} message - Status message
 */
function updateOCRStatus(icon, message) {
  const statusIcon = document.querySelector('.ocr-status-icon');
  const statusText = document.getElementById('ocrStatusText');
  
  if (statusIcon) statusIcon.textContent = icon;
  if (statusText) statusText.textContent = message;
}

/**
 * Updates OCR progress
 * @param {number} progress - Progress value (0-1)
 */
function updateOCRProgress(progress) {
  const percentage = Math.round(progress * 100);
  updateOCRStatus('🔍', `Analyzing image... ${percentage}%`);
}

/**
 * Displays OCR results
 * @param {Object} result - Tesseract recognition result
 */
function displayOCRResults(result) {
  const ocrStatus = document.getElementById('ocrStatus');
  const ocrResults = document.getElementById('ocrResults');
  const ocrConfidence = document.getElementById('ocrConfidence');
  const ocrText = document.getElementById('ocrText');
  
  // Hide status, show results
  ocrStatus.style.display = 'none';
  ocrResults.style.display = 'block';
  
  // Display confidence
  const confidence = Math.round(result.data.confidence);
  ocrConfidence.textContent = `${confidence}%`;
  
  // Apply color based on confidence
  if (confidence >= 80) {
    ocrConfidence.style.color = '#28a745';
  } else if (confidence >= 60) {
    ocrConfidence.style.color = '#ffc107';
  } else {
    ocrConfidence.style.color = '#dc3545';
  }
  
  // Display text
  ocrText.value = result.data.text;
  
  // Initialize analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.onclick = () => analyzeRivenData(result);
}

/**
 * Analyzes Riven data from OCR result
 * @param {Object} result - Tesseract recognition result
 */
function analyzeRivenData(result) {
  console.log('Analyzing Riven data...');
  console.log('OCR Text:', result.data.text);
  
  // Parse the OCR text
  const rivenData = parseRivenData(result.data.text);
  console.log('Parsed Riven data:', rivenData);
  
  // Validate the data
  const validation = validateRivenData(rivenData);
  console.log('Validation result:', validation);
  
  // Format and display results
  const formattedData = formatRivenData(rivenData);
  
  let message = '📊 Analyse Riven\n\n';
  
  if (validation.isValid) {
    message += formattedData;
    message += '\n✅ Données valides!';
  } else {
    message += formattedData;
    message += '\n\n⚠️ Avertissements:\n';
    validation.errors.forEach(error => {
      message += `  • ${error}\n`;
    });
  }
  
  alert(message);
}
