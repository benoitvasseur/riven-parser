#!/usr/bin/env node

/**
 * Test suite for Riven OCR parsing
 * Run with: node test-riven-parser.js
 */

import { parseRivenData, validateRivenData } from './scripts/riven-parser.js';
import { cleanOCRText } from './scripts/image-processor.js';

// Mock known weapons (complete list)
const mockKnownWeapons = [
  { item_name: 'Kulstar', url_name: 'kulstar', riven_type: 'pistol' },
  { item_name: 'Heliocor', url_name: 'heliocor', riven_type: 'melee' },
  { item_name: 'Nagantaka', url_name: 'nagantaka', riven_type: 'rifle' },
  { item_name: 'Ocucor', url_name: 'ocucor', riven_type: 'pistol' },
  { item_name: 'Falcor', url_name: 'falcor', riven_type: 'melee' },
  { item_name: 'Paracesis', url_name: 'paracesis', riven_type: 'melee' },
  { item_name: 'Exergis', url_name: 'exergis', riven_type: 'shotgun' },
  { item_name: 'Battacor', url_name: 'battacor', riven_type: 'rifle' },
  { item_name: 'Euphona Prime', url_name: 'euphona_prime', riven_type: 'shotgun' },
  { item_name: 'Fusilai', url_name: 'fusilai', riven_type: 'pistol' },
  { item_name: 'Lato', url_name: 'lato', riven_type: 'pistol' },
  { item_name: 'Magnus', url_name: 'magnus', riven_type: 'pistol' },
  { item_name: 'Ack & Brunt', url_name: 'ack_and_brunt', riven_type: 'melee' },
  { item_name: 'Amphis', url_name: 'amphis', riven_type: 'melee' },
  { item_name: 'Anku', url_name: 'anku', riven_type: 'melee' },
  { item_name: 'Arca Titron', url_name: 'arca_titron', riven_type: 'melee' },
  { item_name: 'Balla', url_name: 'balla', riven_type: 'zaw' },
  { item_name: 'Boltace', url_name: 'boltace', riven_type: 'melee' },
  { item_name: 'Broken War', url_name: 'broken_war', riven_type: 'melee' },
  { item_name: 'Caustacyst', url_name: 'caustacyst', riven_type: 'melee' },
  { item_name: 'Cerata', url_name: 'cerata', riven_type: 'melee' },
  { item_name: 'Hate', url_name: 'hate', riven_type: 'melee' },
  { item_name: 'Soma', url_name: 'soma', riven_type: 'rifle' },
  { item_name: 'Synapse', url_name: 'synapse', riven_type: 'rifle' },
  { item_name: 'Tigris', url_name: 'tigris', riven_type: 'shotgun' },
  { item_name: 'Tonkor', url_name: 'tonkor', riven_type: 'rifle' },
  { item_name: 'Torid', url_name: 'torid', riven_type: 'rifle' },
  { item_name: 'Vectis', url_name: 'vectis', riven_type: 'rifle' },
  { item_name: 'Veldt', url_name: 'veldt', riven_type: 'rifle' },
  { item_name: 'Vulkar', url_name: 'vulkar', riven_type: 'rifle' },
  { item_name: 'Zarr', url_name: 'zarr', riven_type: 'rifle' },
  { item_name: 'Zenith', url_name: 'zenith', riven_type: 'rifle' },
  { item_name: 'Zhuge', url_name: 'zhuge', riven_type: 'rifle' },
  { item_name: 'Acrid', url_name: 'acrid', riven_type: 'pistol' },
  { item_name: 'Afuris', url_name: 'afuris', riven_type: 'pistol' },
  { item_name: 'Akbolto', url_name: 'akbolto', riven_type: 'pistol' },
  { item_name: 'Akbronco', url_name: 'akbronco', riven_type: 'shotgun' },
  { item_name: 'Akjagara', url_name: 'akjagara', riven_type: 'pistol' },
  { item_name: 'Aklato', url_name: 'aklato', riven_type: 'pistol' },
  { item_name: 'Arca Scisco', url_name: 'arca_scisco', riven_type: 'pistol' },
  { item_name: 'Cycron', url_name: 'cycron', riven_type: 'pistol' },
  { item_name: 'Detron', url_name: 'detron', riven_type: 'shotgun' },
  { item_name: 'Embolist', url_name: 'embolist', riven_type: 'pistol' },
  { item_name: 'Dual Kamas', url_name: 'dual_kamas', riven_type: 'melee' },
  { item_name: 'Kuva Shildeg', url_name: 'kuva_shildeg', riven_type: 'melee' },
  { item_name: 'Kuva Ayanga', url_name: 'kuva_ayanga', riven_type: 'rifle' },
  { item_name: 'Vermisplicer', url_name: 'vermisplicer', riven_type: 'kitgun' },
  { item_name: 'Sporelacer', url_name: 'sporelacer', riven_type: 'kitgun' },
  { item_name: 'Argonak', url_name: 'argonak', riven_type: 'rifle' },
  { item_name: 'Acceltra', url_name: 'acceltra', riven_type: 'rifle' },
  { item_name: 'Castanas', url_name: 'castanas', riven_type: 'pistol' },
  { item_name: 'Cestra', url_name: 'cestra', riven_type: 'pistol' },
  { item_name: 'Dual Toxocyst', url_name: 'dual_toxocyst', riven_type: 'pistol' },
  { item_name: 'Hystrix', url_name: 'hystrix', riven_type: 'pistol' },
  { item_name: 'Fragor', url_name: 'fragor', riven_type: 'melee' },
  { item_name: 'Galatine', url_name: 'galatine', riven_type: 'melee' },
  { item_name: 'Gazal Machete', url_name: 'gazal_machete', riven_type: 'melee' },
  { item_name: 'Gram', url_name: 'gram', riven_type: 'melee' },
  { item_name: 'Guandao', url_name: 'guandao', riven_type: 'melee' },
  { item_name: 'Gunsen', url_name: 'gunsen', riven_type: 'melee' },
  { item_name: 'Dual Skana', url_name: 'dual_skana', riven_type: 'melee' },
  { item_name: 'Jaw Sword', url_name: 'jaw_sword', riven_type: 'melee' },
  { item_name: 'Kesheg', url_name: 'kesheg', riven_type: 'melee' },
  { item_name: 'Kestrel', url_name: 'kestrel', riven_type: 'melee' },
  { item_name: 'Kronsh', url_name: 'kronsh', riven_type: 'zaw' },
  { item_name: 'Ballistica', url_name: 'ballistica', riven_type: 'pistol' },
  { item_name: 'Heat Dagger', url_name: 'heat_dagger', riven_type: 'melee' },
  { item_name: 'Jat Kittag', url_name: 'jat_kittag', riven_type: 'melee' },
  { item_name: 'Sonicor', url_name: 'sonicor', riven_type: 'pistol' },
  { item_name: 'Tombfinger', url_name: 'tombfinger', riven_type: 'kitgun' },
  { item_name: 'Gaze', url_name: 'gaze', riven_type: 'kitgun' },
  { item_name: 'Pupacyst', url_name: 'pupacyst', riven_type: 'melee' },
  { item_name: 'Arca Plasmor', url_name: 'arca_plasmor', riven_type: 'shotgun' },
  { item_name: 'Galvacord', url_name: 'galvacord', riven_type: 'melee' },
  { item_name: 'Bronco', url_name: 'bronco', riven_type: 'shotgun' },
  { item_name: 'Dual Cestra', url_name: 'dual_cestra', riven_type: 'pistol' },
  { item_name: 'Furis', url_name: 'furis', riven_type: 'pistol' },
  { item_name: 'Ankyros', url_name: 'ankyros', riven_type: 'melee' },
  { item_name: 'Atterax', url_name: 'atterax', riven_type: 'melee' },
  { item_name: 'Bo', url_name: 'bo', riven_type: 'melee' },
  { item_name: 'Cassowar', url_name: 'cassowar', riven_type: 'melee' },
  { item_name: 'Ceramic Dagger', url_name: 'ceramic_dagger', riven_type: 'melee' },
  { item_name: 'Halikar', url_name: 'halikar', riven_type: 'melee' },
  { item_name: 'Hirudo', url_name: 'hirudo', riven_type: 'melee' },
  { item_name: 'Mire', url_name: 'mire', riven_type: 'melee' },
  { item_name: 'Twin Krohkur', url_name: 'twin_krohkur', riven_type: 'melee' },
  { item_name: 'Latron', url_name: 'latron', riven_type: 'rifle' },
  { item_name: 'Lenz', url_name: 'lenz', riven_type: 'rifle' },
  { item_name: 'Miter', url_name: 'miter', riven_type: 'rifle' },
  { item_name: 'Mutalist Cernos', url_name: 'mutalist_cernos', riven_type: 'rifle' },
  { item_name: 'Mutalist Quanta', url_name: 'mutalist_quanta', riven_type: 'rifle' },
  { item_name: 'Opticor', url_name: 'opticor', riven_type: 'rifle' },
  { item_name: 'Panthera', url_name: 'panthera', riven_type: 'rifle' },
  { item_name: 'Penta', url_name: 'penta', riven_type: 'rifle' },
  { item_name: 'Phage', url_name: 'phage', riven_type: 'shotgun' },
  { item_name: 'Phantasma', url_name: 'phantasma', riven_type: 'shotgun' },
  { item_name: 'Quanta', url_name: 'quanta', riven_type: 'rifle' },
  { item_name: 'Rubico', url_name: 'rubico', riven_type: 'rifle' },
  { item_name: 'Simulor', url_name: 'simulor', riven_type: 'rifle' },
  { item_name: 'Snipetron', url_name: 'snipetron', riven_type: 'rifle' },
  { item_name: 'Sobek', url_name: 'sobek', riven_type: 'shotgun' },
  { item_name: 'Stradavar', url_name: 'stradavar', riven_type: 'rifle' },
  { item_name: 'Strun', url_name: 'strun', riven_type: 'shotgun' },
  { item_name: 'Sybaris', url_name: 'sybaris', riven_type: 'rifle' },
  { item_name: 'Tetra', url_name: 'tetra', riven_type: 'rifle' },
  { item_name: 'Gammacor', url_name: 'gammacor', riven_type: 'pistol' },
  { item_name: 'Nukor', url_name: 'nukor', riven_type: 'pistol' },
  { item_name: 'Pandero', url_name: 'pandero', riven_type: 'pistol' },
  { item_name: 'Pox', url_name: 'pox', riven_type: 'pistol' },
  { item_name: 'Pyrana', url_name: 'pyrana', riven_type: 'shotgun' },
  { item_name: 'Sicarus', url_name: 'sicarus', riven_type: 'pistol' },
  { item_name: 'Spira', url_name: 'spira', riven_type: 'pistol' },
  { item_name: 'Braton', url_name: 'braton', riven_type: 'rifle' },
  { item_name: 'Skana', url_name: 'skana', riven_type: 'melee' },
];

// Mock known attributes (complete list from getPrefix function)
const mockKnownAttributes = [
  { effect: 'Ammo Maximum', url_name: 'ammo_maximum', positive_is_negative: false },
  { effect: 'Damage to Corpus', url_name: 'damage_vs_corpus', positive_is_negative: false },
  { effect: 'Damage to Grineer', url_name: 'damage_vs_grineer', positive_is_negative: false },
  { effect: 'Damage to Infested', url_name: 'damage_vs_infested', positive_is_negative: false },
  { effect: 'Critical Chance', url_name: 'critical_chance', positive_is_negative: false },
  { effect: 'Critical Damage', url_name: 'critical_damage', positive_is_negative: false },
  { effect: 'Base Damage / Melee Damage', url_name: 'base_damage_/_melee_damage', positive_is_negative: false },
  { effect: 'Base Damage', url_name: 'base_damage', positive_is_negative: false },
  { effect: 'Melee Damage', url_name: 'melee_damage', positive_is_negative: false },
  { effect: 'Damage', url_name: 'damage', positive_is_negative: false },
  { effect: 'Critical Chance on Slide Attack', url_name: 'critical_chance_on_slide_attack', positive_is_negative: false },
  { effect: 'Combo Duration', url_name: 'combo_duration', positive_is_negative: false },
  { effect: 'Electric Damage', url_name: 'electric_damage', positive_is_negative: false },
  { effect: 'Cold Damage', url_name: 'cold_damage', positive_is_negative: false },
  { effect: 'Heat Damage', url_name: 'heat_damage', positive_is_negative: false },
  { effect: 'Finisher Damage', url_name: 'finisher_damage', positive_is_negative: false },
  { effect: 'Fire Rate / Attack Speed', url_name: 'fire_rate_/_attack_speed', positive_is_negative: false },
  { effect: 'Projectile Speed', url_name: 'projectile_speed', positive_is_negative: false },
  { effect: 'Channeling Damage', url_name: 'channeling_damage', positive_is_negative: false },
  { effect: 'Channeling Efficiency', url_name: 'channeling_efficiency', positive_is_negative: false },
  { effect: 'Impact Damage', url_name: 'impact_damage', positive_is_negative: false },
  { effect: 'Magazine Capacity', url_name: 'magazine_capacity', positive_is_negative: false },
  { effect: 'Multishot', url_name: 'multishot', positive_is_negative: false },
  { effect: 'Toxin Damage', url_name: 'toxin_damage', positive_is_negative: false },
  { effect: 'Punch Through', url_name: 'punch_through', positive_is_negative: false },
  { effect: 'Puncture Damage', url_name: 'puncture_damage', positive_is_negative: false },
  { effect: 'Reload Speed', url_name: 'reload_speed', positive_is_negative: false },
  { effect: 'Range', url_name: 'range', positive_is_negative: false },
  { effect: 'Slash Damage', url_name: 'slash_damage', positive_is_negative: false },
  { effect: 'Status Chance', url_name: 'status_chance', positive_is_negative: false },
  { effect: 'Status Duration', url_name: 'status_duration', positive_is_negative: false },
  { effect: 'Recoil', url_name: 'recoil', positive_is_negative: true },
  { effect: 'Zoom', url_name: 'zoom', positive_is_negative: false },
  { effect: 'Chance to Gain Extra Combo Count', url_name: 'chance_to_gain_extra_combo_count', positive_is_negative: false },
  { effect: 'Chance to Gain Combo Count', url_name: 'chance_to_gain_combo_count', positive_is_negative: false },
];

// Test cases
const testCases = [
  {
    name: 'Opticor Visi-satipha with 3 positive and 1 negative stat',
    rawOCR: `Ts        LT TT Nam
 IS           ot
-        4
ps
/            7      1
.            Nr
.     -
Lr uy   ig 4
PE
4    a.            .
  pa               FAS
      -        2
C               .
A        .
     Co
Zrepticor Visi-satipha
 4 107 1% Multishot
+189 8% Damage
+90 8% Heat
0 4 Damage to Infested
8 MR 9                    02
a
WOLF NT`,
    expected: {
      weaponName: 'Opticor',
      stats: [
        { value: 107.1, name: 'Multishot', type: 'positive', matchedAttribute: 'multishot' },
        { value: 189.8, name: 'Damage', type: 'positive', matchedAttribute: 'damage' },
        { value: 90.8, name: 'Heat', type: 'positive', matchedAttribute: 'heat_damage' },
        { value: 0.4, name: 'Damage to Infested', type: 'negative', matchedAttribute: 'damage_vs_infested' },
      ],
      mastery: '9',
      rolls: null,
    }
  },
  {
    name: 'Lenz riven',
    rawOCR: `x             vv ww
IS             Nd
y T-        3
3           .            SRE
/                    .      -    pe
.   po    A          y
ad    E%N            -
- .  pa                     J 2
.     Ls        -        .
Q                       .
        CL
gr Lenz Visi-ignican
XA 191 5% Multshor
+92 5% Heat
+174 1% Damage
y           37 6% Reload Speed
rC MR 11                           0
TAN`,
    expected: {
      weaponName: 'Lenz',
      stats: [
        { value: 191.5, name: 'Multishot', type: 'positive', matchedAttribute: 'multishot' },
        { value: 92.5, name: 'Heat', type: 'positive', matchedAttribute: 'heat_damage' },
        { value: 174.1, name: 'Damage', type: 'positive', matchedAttribute: 'damage' },
        { value: 37.6, name: 'Reload Speed', type: 'negative', matchedAttribute: 'reload_speed' },
      ],
      mastery: '11',
      rolls: '0',
    }
  },
  {
    name: 'Acceltra riven',
    rawOCR: `rr -      -
ro  W       a
JAN
.    BN
oR     .
2
-z  7
oN
I
/        .
 Acceltra Leximag
6 9% Weapon Recoll
+0 2 Punch Through
        MR 11`,
    expected: {
      weaponName: 'Acceltra',
      stats: [
        { value: 6.9, name: 'Weapon Recoil', type: 'positive', matchedAttribute: 'recoil' },
        { value: 0.2, name: 'Punch Through', type: 'positive', matchedAttribute: 'punch_through' },
      ],
      mastery: '11',
      rolls: '0',
    }
  },
];

// Test runner
let passed = 0;
let failed = 0;

console.log('🧪 Running Riven Parser Tests\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(60));
  
  try {
    // Clean OCR text first
    const cleanedText = cleanOCRText(testCase.rawOCR);
    console.log('Cleaned OCR:', cleanedText.replace(/\n/g, ' | '));
    
    // Parse the data
    const result = parseRivenData(cleanedText, mockKnownWeapons, mockKnownAttributes);
    
    // Validate
    const validation = validateRivenData(result);
    if (!validation.isValid) {
      console.log('⚠️  Validation warnings:', validation.errors);
    }
    
    // Check weapon name
    let testPassed = true;
    if (testCase.expected.weaponName !== undefined) {
      if (result.weaponName === testCase.expected.weaponName) {
        console.log(`✅ Weapon name: ${result.weaponName || 'null'}`);
      } else {
        console.log(`❌ Weapon name: expected "${testCase.expected.weaponName}", got "${result.weaponName}"`);
        testPassed = false;
      }
    }
    
    // Check stats count
    if (result.stats.length === testCase.expected.stats.length) {
      console.log(`✅ Stats count: ${result.stats.length}`);
    } else {
      console.log(`❌ Stats count: expected ${testCase.expected.stats.length}, got ${result.stats.length}`);
      testPassed = false;
    }
    
    // Match stats by attribute instead of by index
    const matchedExpected = new Set();
    const matchedActual = new Set();
    const statMatches = [];
    
    // For each actual stat, find the matching expected stat by attribute
    result.stats.forEach((actualStat, actualIndex) => {
      let bestMatch = null;
      let bestMatchIndex = -1;
      
      testCase.expected.stats.forEach((expectedStat, expectedIndex) => {
        if (matchedExpected.has(expectedIndex)) return; // Already matched
        
        // Match by attribute
        if (expectedStat.matchedAttribute && actualStat.matchedAttribute) {
          if (actualStat.matchedAttribute.url_name === expectedStat.matchedAttribute) {
            bestMatch = expectedStat;
            bestMatchIndex = expectedIndex;
          }
        }
      });
      
      if (bestMatch) {
        matchedExpected.add(bestMatchIndex);
        matchedActual.add(actualIndex);
        statMatches.push({ actualStat, actualIndex, expectedStat: bestMatch, expectedIndex: bestMatchIndex });
      }
    });
    
    // Check matched stats
    statMatches.forEach(({ actualStat, actualIndex, expectedStat, expectedIndex }) => {
      let statErrors = [];
      
      // Check value (with tolerance for floating point)
      if (Math.abs(actualStat.value - expectedStat.value) > 0.01) {
        statErrors.push(`value: expected ${expectedStat.value}, got ${actualStat.value}`);
      }
      
      // Check type
      if (actualStat.type !== expectedStat.type) {
        statErrors.push(`type: expected "${expectedStat.type}", got "${actualStat.type}"`);
      }
      
      if (statErrors.length === 0) {
        console.log(`✅ Stat (${expectedStat.matchedAttribute}): ${actualStat.type === 'positive' ? '+' : '-'}${actualStat.value}% ${actualStat.name}`);
      } else {
        console.log(`❌ Stat (${expectedStat.matchedAttribute}): ${statErrors.join(', ')}`);
        console.log(`   Expected: ${expectedStat.type === 'positive' ? '+' : '-'}${expectedStat.value}% ${expectedStat.name}`);
        console.log(`   Got:      ${actualStat.type === 'positive' ? '+' : '-'}${actualStat.value}% ${actualStat.name}`);
        testPassed = false;
      }
    });
    
    // Check for missing expected stats
    testCase.expected.stats.forEach((expectedStat, expectedIndex) => {
      if (!matchedExpected.has(expectedIndex)) {
        console.log(`❌ Stat (${expectedStat.matchedAttribute}): missing`);
        console.log(`   Expected: ${expectedStat.type === 'positive' ? '+' : '-'}${expectedStat.value}% ${expectedStat.name}`);
        testPassed = false;
      }
    });
    
    // Check for extra actual stats
    result.stats.forEach((actualStat, actualIndex) => {
      if (!matchedActual.has(actualIndex)) {
        console.log(`❌ Extra stat detected: ${actualStat.type === 'positive' ? '+' : '-'}${actualStat.value}% ${actualStat.name} (${actualStat.matchedAttribute?.url_name || 'no match'})`);
        testPassed = false;
      }
    });
    
    if (testPassed) {
      console.log('\n✅ Test passed');
      passed++;
    } else {
      console.log('\n❌ Test failed');
      failed++;
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    console.error(error.stack);
    failed++;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('✅ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`❌ ${failed} test(s) failed\n`);
  process.exit(1);
}
