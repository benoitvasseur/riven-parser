// Module for "New" tab
import { parseRivenData, validateRivenData, formatRivenData } from './riven-parser.js';
import { generateSimilarRivenQueries, similarAttributes } from './search-queries.js';

// Tesseract worker instance
let tesseractWorker = null;

let knownWeapons = [];
let knownAttributes = [];

const KNOWN_POLARITIES = [
  'Madurai', 'Vazarin', 'Naramon'
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
    formContainer.style.display = 'block'; // Make sure it's visible if it was hidden
  }

  // Hide Similar Rivens container if it exists
  const similarContainer = document.getElementById('similarRivensContainer');
  if (similarContainer) {
    similarContainer.style.display = 'none';
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

  // Search Button
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'btn btn-primary btn-block';
  searchBtn.textContent = 'Search Similar Rivens';
  searchBtn.style.marginTop = '16px';
  searchBtn.onclick = () => {
    const currentData = getFormDataFromDOM();
    if (validateFormData(currentData)) {
        findSimilarRivens(currentData);
    }
  };
  form.appendChild(searchBtn);

  formContainer.appendChild(form);
}

function getFormDataFromDOM() {
  const form = document.querySelector('.riven-form');
  if (!form) return null;

  const weaponSelect = form.querySelector('select:first-of-type'); // Assuming first select is weapon
  // Better to use IDs or specific classes, but based on renderRivenForm:
  // weaponSelect is in the first form-group.
  
  // Let's rely on the structure we built in renderRivenForm
  const weaponValue = form.querySelector('.form-group:nth-of-type(1) select').value;
  
  const stats = [];
  const attributeRows = form.querySelectorAll('.attribute-row');
  attributeRows.forEach(row => {
    const valInput = row.querySelector('input[type="number"]');
    const attrSelect = row.querySelector('select');
    
    if (valInput.value && attrSelect.value) {
      const value = parseFloat(valInput.value);
      stats.push({
        value: Math.abs(value),
        type: value < 0 ? 'negative' : 'positive',
        matchedAttribute: {
          url_name: attrSelect.value
        }
      });
    }
  });

  // Mastery Rank
  const mrInput = form.querySelector('.form-group:nth-of-type(4) input'); // 1=Weapon, 2=Attrs Label(not group), 3=AttributesContainer(not group), AddBtn, 4=MR Group
  // The structure is:
  // Group(Weapon)
  // Label(Attributes)
  // Div(AttributesContainer)
  // Button(Add)
  // Group(Mastery)
  // Group(Rolls)
  
  // Let's use robust selectors if possible, or traverse childNodes carefully.
  // We added classes or IDs?
  // attributesContainer has ID 'attributesContainer'.
  
  // To be safe, let's look for inputs by their context or add IDs in renderRivenForm.
  // But modifying renderRivenForm to add IDs is easier.
  // For now I will deduce from the DOM structure assumed.

  // Mastery is the input after "Mastery Rank" label.
  // We can select all form-groups and check their label.
  const formGroups = form.querySelectorAll('.form-group');
  let mrValue = null;
  
  formGroups.forEach(group => {
    const label = group.querySelector('label');
    if (label && label.textContent === 'Mastery Rank') {
      mrValue = group.querySelector('input').value;
    }
  });

  // Rolls
  const rollsInput = form.querySelector('input[type="checkbox"]');
  const unrolled = rollsInput ? rollsInput.checked : false;

  return {
    weaponName: weaponValue,
    stats: stats,
    mastery: mrValue,
    rolls: unrolled ? 0 : 1 // 0 if unrolled, >0 otherwise
  };
}

function validateFormData(data) {
    if (!data.weaponName) {
        alert('Please select a weapon.');
        return false;
    }
    if (data.stats.length === 0) {
        alert('Please add at least one attribute.');
        return false;
    }
    return true;
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

// --- Similar Rivens Logic ---

async function findSimilarRivens(data) {
  const queries = generateSimilarRivenQueries(data, knownWeapons);
  
  if (queries.length === 0) {
    return;
  }

  renderSimilarRivensLoading();

  const allResults = [];
  let successfulQueriesCount = 0;
  const BATCH_SIZE = 3; // Rate limit: 3 requests per second

  try {
    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      // If we have found 3 queries with data, stop
      if (successfulQueriesCount >= 3) {
        break;
      }

      // Take a batch
      const batch = queries.slice(i, i + BATCH_SIZE);
      
      // Execute the batch
      const batchResults = await Promise.all(batch.map(async (q) => {
        try {
          const auctions = await WarframeAPI.searchAuctions(q);
          return { query: q, auctions };
        } catch (err) {
          console.error("Error fetching similar riven query", q, err);
          return { query: q, auctions: [] }; // Treat error as empty result
        }
      }));

      // Process results
      for (const res of batchResults) {
        allResults.push(res);
        if (res.auctions && res.auctions.length > 0) {
          successfulQueriesCount++;
        }
      }

      // If we need to continue (haven't found 3 yet and have more queries), wait 1s to respect rate limit
      if (successfulQueriesCount < 3 && (i + BATCH_SIZE) < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    renderSimilarRivens(allResults, data);

  } catch (err) {
    console.error("Error fetching similar rivens", err);
    // Even if error, render what we have
    if (allResults.length > 0) {
      renderSimilarRivens(allResults, data);
    }
  }
}

function renderSimilarRivensLoading() {
  const ocrResultsSection = document.getElementById('ocrResultsSection');
  const formContainer = document.getElementById('rivenFormContainer');
  
  if (formContainer) formContainer.style.display = 'none';

  let similarContainer = document.getElementById('similarRivensContainer');
  if (!similarContainer) {
    similarContainer = document.createElement('div');
    similarContainer.id = 'similarRivensContainer';
    ocrResultsSection.appendChild(similarContainer);
  }
  
  similarContainer.style.display = 'block';
  similarContainer.innerHTML = '<div style="text-align:center; padding: 20px;">Loading similar auctions... ⏳</div>';
}

function renderSimilarRivens(results, originalData) {
  const similarContainer = document.getElementById('similarRivensContainer');
  similarContainer.innerHTML = '';

  // Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary btn-sm';
  prevBtn.textContent = '← Back to Form';
  prevBtn.style.marginBottom = '16px';
  prevBtn.onclick = () => {
    similarContainer.style.display = 'none';
    const formContainer = document.getElementById('rivenFormContainer');
    if (formContainer) formContainer.style.display = 'block';
  };
  similarContainer.appendChild(prevBtn);

  // Title
  const title = document.createElement('h3');
  title.textContent = 'Similar Rivens on Market';
  similarContainer.appendChild(title);

  // Original Riven Attributes (for reference)
  const originalPositiveAttrs = originalData.stats
    .filter(s => s.type === 'positive' && s.matchedAttribute)
    .map(s => s.matchedAttribute.url_name);

  const originalNegativeAttrs = originalData.stats
    .filter(s => s.type === 'negative' && s.matchedAttribute)
    .map(s => s.matchedAttribute.url_name);

  // Render Results
  results.forEach(res => {
    let sectionTitle = similarContainer.querySelector(`h4[data-label="${res.query._label}"]`);
    let section;
    let list;

    if (sectionTitle) {
      // Update existing section
      section = sectionTitle.parentElement;
      const currentCount = parseInt(sectionTitle.getAttribute('data-count') || '0');
      const newCount = currentCount + res.auctions.length;
      
      sectionTitle.setAttribute('data-count', newCount);
      sectionTitle.textContent = `${res.query._label} (${newCount} results)`;
      
      list = section.querySelector('.auction-list');
      
      // If we have results but currently showing "No auctions found", clean it up
      if (res.auctions.length > 0) {
        const noRes = section.querySelector('.no-results');
        if (noRes) {
          noRes.remove();
        }
        if (!list) {
          list = document.createElement('div');
          list.className = 'auction-list';
          list.style.display = 'flex';
          list.style.flexDirection = 'column';
          list.style.gap = '8px';
          section.appendChild(list);
        }
      }
    } else {
      // Create new section
      section = document.createElement('div');
      section.style.marginBottom = '24px';
      
      sectionTitle = document.createElement('h4');
      sectionTitle.setAttribute('data-label', res.query._label);
      sectionTitle.setAttribute('data-count', res.auctions.length);
      sectionTitle.textContent = `${res.query._label} (${res.auctions.length} results)`;
      sectionTitle.style.color = '#667eea';
      sectionTitle.style.marginBottom = '8px';
      section.appendChild(sectionTitle);

      if (res.auctions.length > 0) {
        list = document.createElement('div');
        list.className = 'auction-list';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '8px';
        section.appendChild(list);
      } else {
        const noRes = document.createElement('div');
        noRes.className = 'no-results';
        noRes.textContent = 'No auctions found.';
        noRes.style.color = '#999';
        noRes.style.fontStyle = 'italic';
        section.appendChild(noRes);
      }
      similarContainer.appendChild(section);
    }

    // Append items
    if (list && res.auctions.length > 0) {
      // Limit to top 5 results per query to avoid clutter
      res.auctions.slice(0, 5).forEach(auction => {
        list.appendChild(createAuctionCell(auction, originalPositiveAttrs, originalNegativeAttrs, res.query));
      });
      
      if (res.auctions.length > 5) {
        const more = document.createElement('div');
        more.textContent = `...and ${res.auctions.length - 5} more`;
        more.style.fontSize = '12px';
        more.style.color = '#666';
        more.style.textAlign = 'center';
        list.appendChild(more);
      }
    }
  });
}

function createAuctionCell(auction, originalPositiveAttrs, originalNegativeAttrs, query = null) {
  const cell = document.createElement('div');
  cell.className = 'auction-cell';
  cell.style.border = '1px solid #eee';
  cell.style.borderRadius = '8px';
  cell.style.padding = '12px';
  cell.style.background = '#fff';
  cell.style.display = 'flex';
  cell.style.justifyContent = 'space-between';
  cell.style.alignItems = 'center';

  // Info (Attributes)
  const infoDiv = document.createElement('div');
  infoDiv.style.flex = '1';

  // Riven Name
  const nameDiv = document.createElement('div');
  nameDiv.textContent = `${auction.item.name} (Rank ${auction.item.mod_rank})`;
  nameDiv.style.fontWeight = 'bold';
  nameDiv.style.marginBottom = '4px';
  nameDiv.style.fontSize = '14px';
  infoDiv.appendChild(nameDiv);

  // Attributes List
  const attrsDiv = document.createElement('div');
  attrsDiv.style.display = 'flex';
  attrsDiv.style.flexWrap = 'wrap';
  attrsDiv.style.gap = '6px';

  console.log(query);
  console.log(query._added);

  if (auction.item && auction.item.attributes) {
    auction.item.attributes.forEach(attr => {
      const tag = document.createElement('span');
      tag.textContent = `${attr.value} ${attr.url_name.replace(/_/g, ' ')}`;
      tag.style.fontSize = '11px';
      tag.style.padding = '2px 6px';
      tag.style.borderRadius = '4px';
      
      // Check for match
      const isNegative = attr.value < 0;

      let matchType = 'none';
      
      // Exact Match
      if (!isNegative && originalPositiveAttrs.includes(attr.url_name)) {
        matchType = 'positive';
      } else if (isNegative && originalNegativeAttrs.includes(attr.url_name)) {
        matchType = 'negative';
      }
      
      // Check for swapped/similar attribute
      if (matchType === 'none' && query && query._added) {
        // query._added is the attribute we searched for (the replacement)
        // query._removed is the attribute from the original Riven that was replaced
        if (attr.url_name === query._added) {
           matchType = 'similar';
        }
      }

      if (matchType === 'positive') {
        tag.style.background = '#d1fae5'; // Green-ish
        tag.style.color = '#065f46';
        tag.style.border = '1px solid #a7f3d0';
      } else if (matchType === 'negative') {
        tag.style.background = '#fee2e2'; // Red-ish
        tag.style.color = '#991b1b';
        tag.style.border = '1px solid #fecaca';
      } else if (matchType === 'similar') {
        tag.style.background = '#fef3c7'; // Yellow-ish
        tag.style.color = '#92400e';
        tag.style.border = '1px solid #fde68a';
        tag.title = `Similar to ${query._removed.replace(/_/g, ' ')}`;
      } else {
        tag.style.background = '#f3f4f6'; // Grey
        tag.style.color = '#4b5563';
        tag.style.border = '1px solid #e5e7eb';
      }
      
      attrsDiv.appendChild(tag);
    });
  }
  infoDiv.appendChild(attrsDiv);

  cell.appendChild(infoDiv);

  // Price
  const priceDiv = document.createElement('div');
  priceDiv.style.fontWeight = 'bold';
  priceDiv.style.fontSize = '16px';
  priceDiv.style.color = '#667eea';
  priceDiv.style.marginLeft = '16px';
  priceDiv.style.whiteSpace = 'nowrap';
  priceDiv.textContent = `${auction.buyout_price || auction.starting_price} P`;
  
  cell.appendChild(priceDiv);

  return cell;
}