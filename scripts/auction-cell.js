export function createAuctionCell(auction, originalPositiveAttrs, originalNegativeAttrs, query = null) {
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