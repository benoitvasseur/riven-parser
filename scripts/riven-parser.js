// Module for parsing Riven mod data from OCR text

/**
 * Parses Riven mod data from OCR text
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed Riven data
 */
export function parseRivenData(text) {
  console.log('Parsing Riven data from text:', text);
  
  const rivenData = {
    weaponName: null,
    stats: [],
    polarity: null,
    mastery: null,
    rolls: null,
    rawText: text
  };
  
  // Split text into lines for processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract weapon name (usually first line or contains "Riven")
  rivenData.weaponName = extractWeaponName(lines);
  
  // Extract stats (look for +/- percentages)
  rivenData.stats = extractStats(text);
  
  // Extract mastery requirement
  rivenData.mastery = extractMastery(text);
  
  // Extract rolls count
  rivenData.rolls = extractRolls(text);
  
  // Extract polarity
  rivenData.polarity = extractPolarity(text);
  
  return rivenData;
}

/**
 * Extracts weapon name from text
 * @param {Array} lines - Text lines
 * @returns {string|null} Weapon name
 */
function extractWeaponName(lines) {
  if (!lines || lines.length === 0) return null;
  
  // Look for lines containing "Riven" or weapon names
  for (const line of lines) {
    // Remove "Riven" suffix to get weapon name
    const match = line.match(/(.+?)\s*Riven/i);
    if (match) {
      return match[1].trim();
    }
  }
  
  // If no "Riven" found, return first line as potential weapon name
  return lines[0];
}

/**
 * Extracts stats from text
 * @param {string} text - Raw text
 * @returns {Array} Array of stat objects
 */
function extractStats(text) {
  const stats = [];
  
  // Regex patterns for stats
  // Examples: "+120.5% Critical Chance", "-45.2% Fire Rate"
  const statPattern = /([+-])\s*(\d+\.?\d*)\s*%\s*(.+?)(?=\n|$)/gi;
  
  let match;
  while ((match = statPattern.exec(text)) !== null) {
    stats.push({
      type: match[1] === '+' ? 'positive' : 'negative',
      value: parseFloat(match[2]),
      name: match[3].trim()
    });
  }
  
  return stats;
}

/**
 * Extracts mastery requirement
 * @param {string} text - Raw text
 * @returns {number|null} Mastery rank
 */
function extractMastery(text) {
  // Look for patterns like "Mastery Rank 8" or "MR 8" or "Rank 8"
  const patterns = [
    /Mastery\s*Rank\s*(\d+)/i,
    /MR\s*(\d+)/i,
    /Rank\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * Extracts roll count
 * @param {string} text - Raw text
 * @returns {number|null} Number of rolls
 */
function extractRolls(text) {
  // Look for patterns like "Rolled 5 times" or "5 rolls"
  const patterns = [
    /Rolled\s*(\d+)\s*times?/i,
    /(\d+)\s*rolls?/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * Extracts polarity
 * @param {string} text - Raw text
 * @returns {string|null} Polarity name
 */
function extractPolarity(text) {
  // Common Warframe polarities
  const polarities = [
    'Madurai',  // V shape
    'Vazarin',  // D shape
    'Naramon',  // Dash -
    'Zenurik',  // equal =
    'Unairu',   // R shape
    'Penjaga',  // Y shape
    'Umbra'     // Ω shape
  ];
  
  for (const polarity of polarities) {
    if (text.includes(polarity)) {
      return polarity;
    }
  }
  
  return null;
}

/**
 * Validates parsed Riven data
 * @param {Object} rivenData - Parsed Riven data
 * @returns {Object} Validation result with errors
 */
export function validateRivenData(rivenData) {
  const errors = [];
  
  if (!rivenData.weaponName) {
    errors.push('Weapon name not found');
  }
  
  if (!rivenData.stats || rivenData.stats.length === 0) {
    errors.push('No stats found');
  }
  
  if (rivenData.stats && rivenData.stats.length > 4) {
    errors.push('Too many stats detected (max 4)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats Riven data for display
 * @param {Object} rivenData - Parsed Riven data
 * @returns {string} Formatted text
 */
export function formatRivenData(rivenData) {
  let output = '';
  
  if (rivenData.weaponName) {
    output += `Weapon: ${rivenData.weaponName}\n`;
  }
  
  if (rivenData.stats && rivenData.stats.length > 0) {
    output += '\nStats:\n';
    rivenData.stats.forEach(stat => {
      const sign = stat.type === 'positive' ? '+' : '-';
      output += `  ${sign}${stat.value}% ${stat.name}\n`;
    });
  }
  
  if (rivenData.mastery !== null) {
    output += `\nMastery Rank: ${rivenData.mastery}\n`;
  }
  
  if (rivenData.rolls !== null) {
    output += `Rolls: ${rivenData.rolls}\n`;
  }
  
  if (rivenData.polarity) {
    output += `Polarity: ${rivenData.polarity}\n`;
  }
  
  return output;
}
