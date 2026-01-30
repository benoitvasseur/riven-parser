/**
 * Generates search queries for finding similar Rivens
 * @param {Object} data - The Riven data from the form
 * @param {Array} knownWeapons - List of known weapons
 * @returns {Array} List of query objects
 */
export function generateSimilarRivenQueries(data, knownWeapons) {
  const weapon = knownWeapons.find(w => 
    (w.item_name && w.item_name.toLowerCase() === data.weaponName?.toLowerCase()) || 
    (w.url_name && w.url_name === data.weaponName)
  );

  if (!weapon) {
    console.warn('Weapon not found for search:', data.weaponName);
    return [];
  }

  const positiveStats = data.stats.filter(s => s.type === 'positive' && s.matchedAttribute);
  const negativeStats = data.stats.filter(s => s.type === 'negative' && s.matchedAttribute);
  
  if (positiveStats.length === 0) {
    return [];
  }

  const baseQuery = {
    weapon_url_name: weapon.url_name,
    buyout_policy: 'direct',
    sort_by: 'price_asc',
    platform: 'pc',
    polarity: 'any'
  };

  const queries = [];

  // Call 1: Identical
  const positivesStr = positiveStats.map(s => s.matchedAttribute.url_name).join(',');

  // If there are no negative attributes, query param should not be added
  const negativesStr = negativeStats.length > 0 
    ? negativeStats.map(s => s.matchedAttribute.url_name).join(',') 
    : undefined;

  queries.push({
    ...baseQuery,
    positive_stats: positivesStr,
    ...(negativesStr ? { negative_stats: negativesStr } : {}),
    _label: 'Similar',
  });

  // Determine priority rules
  const potentialRules = [];

  // Rule 1: if there is a negative attribute search without it
  if (negativeStats.length > 0) {
    potentialRules.push({
      ...baseQuery,
      positive_stats: positivesStr,
      _label: 'Similar without negative attribute',
    });
  }

  // Rule 2: If there are 3 positive attributes, search without the last one
  if (positiveStats.length === 3) {
    const subset = positiveStats.slice(0, 2).map(s => s.matchedAttribute.url_name).join(',');
    potentialRules.push({
      ...baseQuery,
      positive_stats: subset,
      ...(negativesStr ? { negative_stats: negativesStr } : {}),
      _label: 'Similar without last attribute',
    });
  }

  // Rule 3: Search without the first positive attribute
  if (positiveStats.length > 1) {
    const subset = positiveStats.slice(1).map(s => s.matchedAttribute.url_name).join(',');
    potentialRules.push({
      ...baseQuery,
      positive_stats: subset,
      ...(negativesStr ? { negative_stats: negativesStr } : {}),
      _label: 'Similar without first attribute',
    });
  }

  // Rule 4: Search without the last positive attribute
  if (positiveStats.length > 1) {
    const subset = positiveStats.slice(0, positiveStats.length - 1).map(s => s.matchedAttribute.url_name).join(',');
    // Check duplication with Rule 2
    const isDuplicate = potentialRules.some(q => q.positive_stats === subset && q.negative_stats === negativesStr);
    if (!isDuplicate) {
        potentialRules.push({
            ...baseQuery,
            positive_stats: subset,
            ...(negativesStr ? { negative_stats: negativesStr } : {}),
            _label: 'Similar without last attribute',
        });
    }
  }

  // Select first 2 applicable rules
  const selectedRules = potentialRules.slice(0, 2);
  queries.push(...selectedRules);

  return queries;
}
