// Module for parsing Riven mod data from OCR text

/**
 * @param {string} text 
 */
export function getPrefix(text) {
  switch (text) {
    case 'ammo_maximum':
      return 'Ampi';
    case 'damage_vs_corpus':
      return 'Manti';
    case 'damage_vs_grineer':
      return 'Argi';
    case 'damage_vs_infested':
      return 'Vexi';
    case 'critical_chance':
      return 'Crita';
    case 'critical_damage':
      return 'Acri';
    case 'base_damage_/_melee_damage':
    case 'base_damage':
    case 'melee_damage':
    case 'damage':
      return 'Visi';
    case 'critical_chance_on_slide_attack':
      return 'Pleci';
    case 'combo_duration':
      return 'Tempi';
    case 'electric_damage':
      return 'Vexi';
    case 'cold_damage':
      return 'Zeti';
    case 'heat_damage':
      return 'Igni';
    case 'finisher_damage':
      return 'Exi';
    case 'fire_rate_/_attack_speed':
      return 'Croni';
    case 'projectile_speed':
      return 'Conci';
    case 'channeling_damage':
      return 'Para';
    case 'channeling_efficiency':
      return 'Forti';
    case 'impact_damage':
      return 'Magna';
    case 'magazine_capacity':
      return 'Arma';
    case 'multishot':
      return 'Sati';
    case 'toxin_damage':
      return 'Toxi';
    case 'punch_through':
      return 'Lexi';
    case 'puncture_damage':
      return 'Insi';
    case 'reload_speed':
      return 'Feva';
    case 'range':
      return 'Locti';
    case 'slash_damage':
      return 'Sci';
    case 'status_chance':
      return 'Hexa';
    case 'status_duration':
      return 'Deci';
    case 'recoil':
      return 'Zeti';
    case 'zoom':
      return 'Hera';
    case 'chance_to_gain_extra_combo_count':
      return 'Laci';
    case 'chance_to_gain_combo_count':
      return 'Nus';
    default:
      return null;
  }
}

/**

 * @param {string} text 
 */
export function getSuffix(text) {
  switch (text) {
    case 'ammo_maximum':
      return 'Bin';
    case 'damage_vs_corpus':
      return 'Tron';
    case 'damage_vs_grineer':
      return 'Con';
    case 'damage_vs_infested':
      return 'Ada';
    case 'cold_damage':
      return 'Do';
    case 'channeling_damage':
      return 'Um';
    case 'channeling_efficiency':
      return 'Us';
    case 'combo_duration':
      return 'Nem';
    case 'critical_chance':
      return 'Cron';
    case 'critical_chance_on_slide_attack':
      return 'Nent';
    case 'critical_damage':
      return 'Tis';
    case 'base_damage_/_melee_damage':
    case 'base_damage':
    case 'melee_damage':
    case 'damage':
      return 'Ata';
    case 'electric_damage':
      return 'Tio';
    case 'heat_damage':
      return 'Pha';
    case 'finisher_damage':
      return 'Cta';
    case 'fire_rate_/_attack_speed':
      return 'Dra';
    case 'projectile_speed':
      return 'Nak';
    case 'impact_damage':
      return 'Ton';
    case 'magazine_capacity':
      return 'Tin';
    case 'multishot':
      return 'Can';
    case 'toxin_damage':
      return 'Tox';
    case 'punch_through':
      return 'Nok';
    case 'puncture_damage':
      return 'Cak';
    case 'reload_speed':
      return 'Tak';
    case 'range':
      return 'Tor';
    case 'slash_damage':
      return 'Sus';
    case 'status_chance':
      return 'Dex';
    case 'status_duration':
      return 'Des';
    case 'recoil':
      return 'Mag';
    case 'zoom':
      return 'Lis';
    case 'chance_to_gain_extra_combo_count':
      return 'Nus';
    default:
      return null;
  }
}

/**
 * Generates possible Riven names based on stats
 * @param {Array} stats Array of { value, matchedAttribute: { url_name } }
 * @returns {Object} { recommended: string, others: string[] }
 */
export function generateRivenNames(stats) {
  // Filter positive attributes with valid url_name
  const positiveStats = stats.filter(s => 
    s.type === 'positive' && 
    s.matchedAttribute && 
    s.matchedAttribute.url_name
  );

  if (positiveStats.length < 2) {
    return { recommended: '', others: [] };
  }

  // Sort by value descending for the "recommended" logic
  const sortedByValue = [...positiveStats].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  
  let recommended = '';
  const others = new Set();

  if (positiveStats.length === 2) {
    // Rule: {Prefix}{Suffix} with Prefix = highest %
    // sortedByValue[0] is highest
    const prefix = getPrefix(sortedByValue[0].matchedAttribute.url_name);
    const suffix = getSuffix(sortedByValue[1].matchedAttribute.url_name);
    
    if (prefix && suffix) {
      recommended = capitalize(prefix + suffix.toLowerCase());
    }

    // Permutations (only 2 for 2 stats)
    // 1. A-Prefix B-Suffix (Recommended)
    // 2. B-Prefix A-Suffix
    const p1 = getPrefix(positiveStats[0].matchedAttribute.url_name);
    const s2 = getSuffix(positiveStats[1].matchedAttribute.url_name);
    if (p1 && s2) others.add(capitalize(p1 + s2.toLowerCase()));

    const p2 = getPrefix(positiveStats[1].matchedAttribute.url_name);
    const s1 = getSuffix(positiveStats[0].matchedAttribute.url_name);
    if (p2 && s1) others.add(capitalize(p2 + s1.toLowerCase()));

  } else if (positiveStats.length >= 3) {
    // Take top 3 if more than 3 (rare but possible in some contexts, strictly rivens have 2 or 3 positives)
    // Rule: {Prefix1}-{Prefix2}{Suffix}
    // Prefix1 = highest, Prefix2 = 2nd highest, Suffix = lowest (3rd)
    const top3 = sortedByValue.slice(0, 3);
    
    const p1 = getPrefix(top3[0].matchedAttribute.url_name);
    const p2 = getPrefix(top3[1].matchedAttribute.url_name);
    const s3 = getSuffix(top3[2].matchedAttribute.url_name);

    if (p1 && p2 && s3) {
      recommended = capitalize(`${p1}-${p2}${s3.toLowerCase()}`);
    }

    // Permutations of 3 items: 3! = 6
    // We need to generate all valid combinations of P-P-S
    const perms = getPermutations(positiveStats.slice(0, 3));
    perms.forEach(perm => {
      const pp1 = getPrefix(perm[0].matchedAttribute.url_name);
      const pp2 = getPrefix(perm[1].matchedAttribute.url_name);
      const ss3 = getSuffix(perm[2].matchedAttribute.url_name);
      
      if (pp1 && pp2 && ss3) {
        others.add(capitalize(`${pp1}-${pp2}${ss3.toLowerCase()}`));
      }
    });

    // Also add permutations of 2 items (P-S) using any pair from the 3 stats
    // This covers cases where one stat might be ignored or the user prefers a 2-stat name
    for (let i = 0; i < top3.length; i++) {
        for (let j = 0; j < top3.length; j++) {
            if (i === j) continue;
            const stat1 = top3[i];
            const stat2 = top3[j];
            
            const p = getPrefix(stat1.matchedAttribute.url_name);
            const s = getSuffix(stat2.matchedAttribute.url_name);
            
            if (p && s) {
                others.add(capitalize(p + s.toLowerCase()));
            }
        }
    }
  }

  // Remove recommended from others
  if (recommended) {
    others.delete(recommended);
  }

  return {
    recommended,
    others: Array.from(others)
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = getPermutations(remaining);
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

/**
 * Parses Riven mod data from OCR text
 * @param {string} text - Raw OCR text
 * @param {Array} knownWeapons - Optional list of valid weapon names to fuzzy match against
 * @param {Array} knownAttributes - Optional list of valid attributes to match stats against
 * @returns {Object} Parsed Riven data
 */
export function parseRivenData(text, knownWeapons = [], knownAttributes = []) {
  console.log('Parsing Riven data from text:', text, knownWeapons);
  
  const rivenData = {
    weaponName: null,
    stats: [],
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

  // Match stats to known attributes
  if (knownAttributes && knownAttributes.length > 0) {
    rivenData.stats.forEach(stat => {
      stat.matchedAttribute = findBestAttributeMatch(stat.name, knownAttributes);
    });
  }
  
  // Extract mastery requirement
  rivenData.mastery = extractMastery(text);
  
  // Extract rolls count
  rivenData.rolls = extractRolls(text);

  // Extract polarity
  rivenData.polarity = extractPolarity(text);

  // Fallback: If mastery or rolls are missing, try to find them based on position (below stats)
  if (rivenData.mastery === null || rivenData.rolls === null) {
    const footerData = extractFooterData(lines);
    if (rivenData.mastery === null) rivenData.mastery = footerData.mastery;
    if (rivenData.rolls === null) rivenData.rolls = footerData.rolls;
  }
  
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
  // Examples: "+120.5% Critical Chance", "-45.2% Fire Rate", "+0 4/Damage"
  // Handles OCR errors like spaces in numbers ("0 4" -> 0.4), missing %, or "/" instead of "%"
  const statPattern = /([+-])\s*((?:\d+(?:[.,\s]\d+)*))\s*[%/]?\s*([a-zA-Z].+?)(?=\n|$)/gi;
  
  let match;
  while ((match = statPattern.exec(text)) !== null) {
    let rawValue = match[2];
    
    // Clean up value: replace spaces and commas with dots
    rawValue = rawValue.replace(/[\s,]/g, '.');
    
    let value = parseFloat(rawValue);
    let type = match[1] === '+' ? 'positive' : 'negative';

    // Rule: 0 counts as negative
    if (value === 0) {
      type = 'negative';
    }

    stats.push({
      type: type,
      value: value,
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
  // Added more robust patterns and common OCR error handling
  const patterns = [
    /Rolled\s*(\d+)\s*times?/i,
    /(\d+)\s*rolls?/i,
    /Rolled\s*:\s*(\d+)/i,
    /Rerolls\s*:\s*(\d+)/i,
    /Rolled\s*(\d+)/i // Just "Rolled 5"
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Fallback: Scan for lines with "roll" and try to extract number with OCR fixes
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.match(/roll/i)) {
      // Replace common OCR mix-ups for numbers
      const cleanLine = line.replace(/[oO]/g, '0')
                          .replace(/[lI|]/g, '1')
                          .replace(/[sS]/g, '5')
                          .replace(/[zZ]/g, '2')
                          .replace(/[g]/g, '9')
                          .replace(/[b]/g, '6'); // sometimes b is 6
      
      const match = cleanLine.match(/(\d+)/);
      if (match) {
        // Verify it's not a stat line (usually stats have %)
        if (!line.includes('%')) {
           return parseInt(match[1], 10);
        }
      }
    }
  }
  
  return null;
}

/**
 * Extracts polarity from text if present
 * @param {string} text 
 * @returns {string|null} Polarity name or null
 */
function extractPolarity(text) {
  const polarities = ['madurai', 'vazarin', 'naramon', 'zenurik', 'unairu'];
  const lowerText = text.toLowerCase();
  
  for (const pol of polarities) {
    if (lowerText.includes(pol)) {
      return pol;
    }
  }
  
  // Check for common OCR misreads of symbols if they appear as single chars?
  // Hard to say without examples.
  
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
  
  return output;
}

/**
 * Finds the best matching attribute for a given raw stat name
 * Priorities:
 * 1. Exact match (case insensitive)
 * 2. Inclusion (substring) - prefers smallest length difference
 * 3. Levenshtein distance - prefers smallest distance
 * 
 * @param {string} rawName 
 * @param {Array} knownAttributes 
 * @returns {Object|null} Best matching attribute or null
 */
function findBestAttributeMatch(rawName, knownAttributes) {
  if (!rawName || !knownAttributes) return null;
  
  const normalizedRaw = rawName.toLowerCase().trim();
  let bestMatch = null;
  // Score types: 3 = Exact, 2 = Inclusion, 1 = Levenshtein
  let bestScoreType = 0; 
  let bestDist = Infinity; // For Levenshtein (lower is better) or Length Diff for Inclusion (lower is better)

  for (const attr of knownAttributes) {
    const attrEffect = attr.effect.toLowerCase();
    
    // 1. Exact Match
    if (attrEffect === normalizedRaw) {
      return attr; // Best possible match, return immediately
    }
    
    // 2. Inclusion
    const isIncluded = attrEffect.includes(normalizedRaw) || normalizedRaw.includes(attrEffect);
    let isValidInclusion = false;

    if (isIncluded) {
      // Calculate overlap ratio to prevent short generic terms matching long specific terms
      // e.g. "damage" vs "damage to grifesr" -> should fail inclusion and use Levenshtein to find "damage to grineer"
      const minLen = Math.min(attrEffect.length, normalizedRaw.length);
      const maxLen = Math.max(attrEffect.length, normalizedRaw.length);
      const ratio = minLen / maxLen;
      
      // Only consider valid inclusion if it covers significant portion (> 60%)
      if (ratio > 0.75) {
        isValidInclusion = true;
        if (bestScoreType < 2) {
          // Found first inclusion, upgrades previous Levenshtein matches
          bestScoreType = 2;
          bestMatch = attr;
          bestDist = Math.abs(attrEffect.length - normalizedRaw.length);
        } else if (bestScoreType === 2) {
          // Already have an inclusion, check if this one is better (closer in length)
          const diff = Math.abs(attrEffect.length - normalizedRaw.length);
          if (diff < bestDist) {
            bestMatch = attr;
            bestDist = diff;
          }
        }
      }
    }

    if (isValidInclusion) {
      continue;
    }
    
    // 3. Levenshtein Distance
    if (bestScoreType < 2) { // Only check if we haven't found an inclusion or exact match yet
      const dist = levenshteinDistance(normalizedRaw, attrEffect);
      if (dist < bestDist) {
        bestScoreType = 1;
        bestMatch = attr;
        bestDist = dist;
      }
    }
  }
  
  return bestMatch;
}
