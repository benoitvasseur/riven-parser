// Module for "New" tab

/**
 * Initializes the New tab content
 */
export function initNouveauTab() {
  console.log('New tab initialized');
  initImageUpload();
}

/**
 * Refreshes the New tab content
 */
export function refreshNouveauTab() {
  console.log('New tab refreshed');
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

  fileInput.value = '';
  previewImg.src = '';
  imagePreview.style.display = 'none';
  dropZoneContent.style.display = 'flex';
}

/**
 * Processes a new Riven image
 * @param {File} file - The image file
 * @param {string} dataUrl - The data URL of the image
 */
function handleNewRivenImg(file, dataUrl) {
  // TODO: Implementation coming soon
  console.log('New Riven image received:', file.name, file.size, 'bytes');
}
