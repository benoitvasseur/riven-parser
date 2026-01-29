// Module for "New" tab
import { parseRivenData, validateRivenData, formatRivenData } from './riven-parser.js';

// Tesseract worker instance
let tesseractWorker = null;

let knownWeapons = [];
let knownAttributes = [];

const KNOWN_POLARITIES = [
  'Madurai', 'Vazarin', 'Naramon', 'Zenurik', 'Unairu', 'Penjaga', 'Umbra'
];

async function loadKnownWeapons() {
  const knownWeaponsUnsorted = await WarframeAPI.getRivenItems();
  knownWeapons = knownWeaponsUnsorted.sort((a, b) => a.item_name.localeCompare(b.item_name));
}

async function loadKnownAttributes() {
  knownAttributes = await WarframeAPI.getRivenAttributes();
}

/**
 * Initializes the New tab content
 */
export function initNouveauTab() {
  console.log('New tab initialized');
  initImageUpload();
  initTesseractWorker();
  loadKnownWeapons();
  loadKnownAttributes();
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
    const corePath = chrome.runtime.getURL('libs/tesseract-core.wasm.js');
    
    console.log('Worker path:', workerPath);
    console.log('Core path:', corePath);
    
    tesseractWorker = await Tesseract.createWorker('eng', 1, {
      workerPath: workerPath,
      corePath: corePath,
      workerBlobURL: false,
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
  if (ocrResults) ocrResults.style.display = 'none';
  
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
    
    // Automatically analyze result instead of displaying raw text
    updateOCRStatus('🧠', 'Parsing Riven data...');
    analyzeRivenData(result);
    
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
 * Analyzes Riven data from OCR result and renders the form
 * @param {Object} result - Tesseract recognition result
 */
function analyzeRivenData(result) {
  console.log('Analyzing Riven data...');
  console.log('OCR Text:', result.data.text);
  
  // Parse the OCR text
  const rivenData = parseRivenData(result.data.text, knownWeapons, knownAttributes);
  console.log('Parsed Riven data:', rivenData);
  
  // Validate the data (optional, just for logging)
  const validation = validateRivenData(rivenData);
  console.log('Validation result:', validation);

  // Hide status
  const ocrStatus = document.getElementById('ocrStatus');
  ocrStatus.style.display = 'none';

  // Render Form
  renderRivenForm(rivenData);
}

/**
 * Renders the Riven data form
 * @param {Object} data - Parsed Riven data
 */
function renderRivenForm(data) {
  const ocrResultsSection = document.getElementById('ocrResultsSection');
  
  // Create or get form container
  let formContainer = document.getElementById('rivenFormContainer');
  if (!formContainer) {
    formContainer = document.createElement('div');
    formContainer.id = 'rivenFormContainer';
    formContainer.className = 'riven-form-container';
    ocrResultsSection.appendChild(formContainer);
  } else {
    formContainer.innerHTML = ''; // Clear existing
  }

  // Create Form HTML
  const form = document.createElement('form');
  form.className = 'riven-form';
  form.onsubmit = (e) => e.preventDefault();

  // Weapon Field
  const weaponGroup = createFormGroup('Weapon');
  const weaponSelect = document.createElement('select');
  weaponSelect.className = 'form-input';
  weaponSelect.innerHTML = '<option value="">Select Weapon...</option>';
  
  knownWeapons.forEach(weapon => {
    const option = document.createElement('option');
    const weaponName = typeof weapon === 'string' ? weapon : weapon.item_name || weapon.url_name;
    option.value = weaponName;
    option.textContent = weaponName;
    if (data.weaponName && weaponName.toLowerCase() === data.weaponName.toLowerCase()) {
      option.selected = true;
    }
    weaponSelect.appendChild(option);
  });
  weaponGroup.appendChild(weaponSelect);
  form.appendChild(weaponGroup);

  // Attributes Section
  const attributesLabel = document.createElement('label');
  attributesLabel.textContent = 'Attributes';
  attributesLabel.style.display = 'block';
  attributesLabel.style.marginBottom = '8px';
  attributesLabel.style.fontWeight = '600';
  form.appendChild(attributesLabel);

  const attributesContainer = document.createElement('div');
  attributesContainer.id = 'attributesContainer';
  form.appendChild(attributesContainer);

  // Add parsed attributes (or empty rows if none)
  if (data.stats && data.stats.length > 0) {
    data.stats.forEach(stat => {
      addAttributeRow(attributesContainer, stat);
    });
  } else {
    // Add 2 empty rows by default if no stats
    addAttributeRow(attributesContainer);
    addAttributeRow(attributesContainer);
  }

  // Add Attribute Button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-secondary btn-sm';
  addBtn.textContent = '+ Add Attribute';
  addBtn.style.marginTop = '8px';
  addBtn.style.marginBottom = '16px';
  addBtn.onclick = () => addAttributeRow(attributesContainer);
  form.appendChild(addBtn);

  // Mastery Rank
  const mrGroup = createFormGroup('Mastery Rank');
  const mrInput = document.createElement('input');
  mrInput.type = 'number';
  mrInput.className = 'form-input';
  mrInput.value = data.mastery || '';
  mrGroup.appendChild(mrInput);
  form.appendChild(mrGroup);

  // Polarity
  const polarityGroup = createFormGroup('Polarity');
  const polaritySelect = document.createElement('select');
  polaritySelect.className = 'form-input';
  polaritySelect.innerHTML = '<option value="">Select Polarity...</option>';
  
  KNOWN_POLARITIES.forEach(polarity => {
    const option = document.createElement('option');
    option.value = polarity;
    option.textContent = polarity;
    if (data.polarity && data.polarity.toLowerCase() === polarity.toLowerCase()) {
      option.selected = true;
    }
    polaritySelect.appendChild(option);
  });
  polarityGroup.appendChild(polaritySelect);
  form.appendChild(polarityGroup);

  // Rolls (Unrolled Checkbox)
  const rollsGroup = document.createElement('div');
  rollsGroup.className = 'form-group';
  rollsGroup.style.display = 'flex';
  rollsGroup.style.alignItems = 'center';
  rollsGroup.style.marginTop = '8px';

  const rollsLabel = document.createElement('label');
  rollsLabel.style.display = 'flex';
  rollsLabel.style.alignItems = 'center';
  rollsLabel.style.cursor = 'pointer';

  const rollsInput = document.createElement('input');
  rollsInput.type = 'checkbox';
  // Logic: unchecked if 0, checked otherwise
  rollsInput.checked = (data.rolls || 0) == 0;
  
  const rollsText = document.createElement('span');
  rollsText.textContent = 'unrolled';
  rollsText.style.marginLeft = '8px';
  rollsText.style.fontWeight = '600';

  rollsLabel.appendChild(rollsInput);
  rollsLabel.appendChild(rollsText);
  rollsGroup.appendChild(rollsLabel);
  form.appendChild(rollsGroup);

  formContainer.appendChild(form);
}

function createFormGroup(labelText) {
  const group = document.createElement('div');
  group.className = 'form-group';
  const label = document.createElement('label');
  label.textContent = labelText;
  group.appendChild(label);
  return group;
}

function addAttributeRow(container, statData = null) {
  // Enforce max 4 attributes
  if (container.children.length >= 4) {
    alert('Maximum 4 attributes allowed');
    return;
  }

  const row = document.createElement('div');
  row.className = 'attribute-row';
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.marginBottom = '8px';
  row.style.alignItems = 'center';

  // Numeric Value
  const numInput = document.createElement('input');
  numInput.type = 'number';
  numInput.className = 'form-input';
  numInput.style.width = '80px';
  numInput.placeholder = 'Value';
  numInput.step = '0.1';
  if (statData) {
    const sign = statData.type === 'negative' ? '-' : '';
    numInput.value = `${sign}${statData.value}`;
  }
  row.appendChild(numInput);

  // Attribute Dropdown
  const attrSelect = document.createElement('select');
  attrSelect.className = 'form-input';
  attrSelect.style.flex = '1';
  attrSelect.innerHTML = '<option value="">Select Attribute...</option>';
  
  // Sort attributes by effect name
  const sortedAttributes = [...knownAttributes].sort((a, b) => 
    a.effect.localeCompare(b.effect)
  );

  sortedAttributes.forEach(attr => {
    const option = document.createElement('option');
    option.value = attr.url_name;
    option.textContent = attr.effect;
    
    // Match based on pre-calculated matchedAttribute from parser
    if (statData && statData.matchedAttribute && statData.matchedAttribute.url_name === attr.url_name) {
      option.selected = true;
    }
    attrSelect.appendChild(option);
  });
  row.appendChild(attrSelect);

  // Delete Button
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'btn btn-delete btn-sm';
  delBtn.innerHTML = '🗑️';
  delBtn.title = 'Remove attribute';
  delBtn.onclick = () => {
    if (container.children.length > 0) {
      container.removeChild(row);
    }
  };
  row.appendChild(delBtn);

  container.appendChild(row);
}
