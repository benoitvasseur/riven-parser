// Module loader for tab initialization
import { initNouveauTab, cleanupNouveauTab } from './nouveau-tab.js';
import { initRivensTab } from './rivens-tab.js';

// Make functions available globally
window.initNouveauTab = initNouveauTab;
window.cleanupNouveauTab = cleanupNouveauTab;
window.initRivensTab = initRivensTab;
