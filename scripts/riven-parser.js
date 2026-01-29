// Module for parsing Riven mod data from OCR text

/**
 * Parses Riven mod data from OCR text
 * @param {string} text - Raw OCR text
 * @param {Array} knownWeapons - Optional list of valid weapon names to fuzzy match against
 * @returns {Object} Parsed Riven data
 */
export function parseRivenData(text, knownWeapons = []) {
  console.log('Parsing Riven data from text:', text, knownWeapons);
  
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
  rivenData.weaponName = extractWeaponName(lines, knownWeapons);
  
  // Extract stats (look for +/- percentages)
  rivenData.stats = extractStats(text);
  
  // Extract mastery requirement
  rivenData.mastery = extractMastery(text);
  
  // Extract rolls count
  rivenData.rolls = extractRolls(text);

  // Fallback: If mastery or rolls are missing, try to find them based on position (below stats)
  if (rivenData.mastery === null || rivenData.rolls === null) {
    const footerData = extractFooterData(lines);
    if (rivenData.mastery === null) rivenData.mastery = footerData.mastery;
    if (rivenData.rolls === null) rivenData.rolls = footerData.rolls;
  }
  
  // Extract polarity
  rivenData.polarity = extractPolarity(text);
  
  return rivenData;
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number} Distance
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Extracts weapon name from text
 * @param {Array} lines - Text lines
 * @param {Array} knownWeapons - Optional list of known weapons
 * @returns {string|null} Weapon name
 */
function extractWeaponName(lines, knownWeapons = []) {
  if (!lines || lines.length === 0) return null;
  
  // Strategy: Scan lines to find the best matching weapon name.
  // We prioritize matches on longer weapon names to avoid false positives with short names (like "Bo") in noisy text.
  
  if (knownWeapons && knownWeapons.length > 0) {
    const allCandidates = [];

    // Scan more lines, as OCR noise can push the name down (e.g. line 11)
    // We scan up to 20 lines or all lines if fewer
    const linesToScan = lines.slice(0, 20);

    for (const line of linesToScan) {
      let cleanedLine = line;
      // Remove "Riven Mod" or "Riven" suffix if present explicitly
      const rivenMatch = line.match(/(.+?)\s*Riven/i);
      if (rivenMatch) {
        cleanedLine = rivenMatch[1].trim();
      }

      // Find candidates in this line
      const candidatesInLine = findWeaponCandidates(cleanedLine, knownWeapons);
      allCandidates.push(...candidatesInLine);
    }

    if (allCandidates.length > 0) {
      // Sort globally: Longest name first, then best distance
      allCandidates.sort((a, b) => {
        if (b.length !== a.length) {
          return b.length - a.length; // Descending length
        }
        return a.dist - b.dist; // Ascending distance
      });

      return allCandidates[0].name;
    }
  }

  // Legacy behavior / Fallback if no known weapons or no match found
  // ...
  
  // Look for lines containing "Riven" or weapon names
  for (const line of lines) {
    // Remove "Riven" suffix to get weapon name
    const match = line.match(/(.+?)\s*Riven/i);
    if (match) {
      return match[1].trim();
    }
  }
  
  // If no "Riven" found, return first line as potential weapon name
  return lines[0].split('-')[0].trim();
}

/**
 * Finds all potential weapon matches in a raw string
 * @param {string} rawName 
 * @param {Array} knownWeapons 
 * @returns {Array} List of candidates {name, dist, length}
 */
function findWeaponCandidates(rawName, knownWeapons) {
  const candidates = [];
  const normalizedRaw = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalizedRaw.length < 2) return []; // Ignore too short lines

  for (const weapon of knownWeapons) {
    const weaponName = typeof weapon === 'string' ? weapon : weapon.item_name || weapon.url_name;
    if (!weaponName) continue;

    const normalizedWeapon = weaponName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Optimization: check if raw name starts with weapon name
    if (normalizedRaw.startsWith(normalizedWeapon)) {
       candidates.push({
         name: weaponName,
         dist: 0,
         length: normalizedWeapon.length
       });
       continue;
    }

    // Truncate raw string for fuzzy comparison
    // We try strictly the length of the weapon, and length + 1 to account for potential single insertion
    // If the raw string continues without space (e.g. "WeaponSuffix"), we want to match "Weapon"
    
    const subExact = normalizedRaw.substring(0, normalizedWeapon.length);
    const distExact = levenshteinDistance(subExact, normalizedWeapon);
    
    let dist = distExact;

    // Optional: Check slightly longer substring if it helps (e.g. missing char in OCR but followed by noise)
    // But generally, comparing equal lengths is safer for prefix matching
    
    // Adjust threshold based on length
    // Short names must be very accurate
    let threshold;
    if (normalizedWeapon.length <= 3) {
      threshold = 0; // Exact match only for 2-3 char names like "Bo", "Uz"
    } else if (normalizedWeapon.length <= 6) {
      threshold = 1; // 1 error max for medium short
    } else {
      threshold = Math.floor(normalizedWeapon.length / 3); // Allow ~33% errors for long names
    }

    if (dist <= threshold) {
      candidates.push({
        name: weaponName,
        dist: dist,
        length: normalizedWeapon.length
      });
    }
  }
  return candidates;
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
 * Scans lines below the last detected attribute to find Mastery and Rolls
 * Based on rule: "Mastery is always below the last attribute. the number right to it is the number of reroll."
 * @param {Array} lines - Array of text strings
 * @returns {Object} { mastery: number|null, rolls: number|null }
 */
function extractFooterData(lines) {
  let lastStatIndex = -1;
  const statLinePattern = /[+-]\s*\d+\.?\d*\s*%/;

  // Find the index of the last line that looks like a stat
  for (let i = 0; i < lines.length; i++) {
    if (statLinePattern.test(lines[i])) {
      lastStatIndex = i;
    }
  }

  // Start searching after the last stat found. If no stats found, scan the whole text (fallback)
  const startIndex = lastStatIndex === -1 ? 0 : lastStatIndex + 1;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for a line with at least two numbers (e.g. "15 040")
    // This catches patterns like "(VR 15 040 A" where 15 is MR and 040 is Rolls
    const numbers = line.match(/\d+/g);
    
    if (numbers && numbers.length >= 2) {
      // Heuristic: First number is MR, second is Rolls
      // MR is typically between 8 and 18.
      const mr = parseInt(numbers[0], 10);
      const rolls = parseInt(numbers[1], 10);
      
      // Basic sanity check for MR to avoid picking up random large numbers
      if (mr <= 18) {
        return { mastery: mr, rolls: rolls };
      }
    }
  }

  return { mastery: null, rolls: null };
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
