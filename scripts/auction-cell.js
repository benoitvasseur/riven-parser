export function createAuctionCell(auction, originalPositiveAttrs, originalNegativeAttrs, query = null, options = {}) {
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

    // Weapon Name (if requested)
    if (options.showWeapon && auction.item && auction.item.weapon_url_name) {
        const weaponDiv = document.createElement('div');
        // Format: "rubico_prime" -> "Rubico Prime"
        const weaponName = auction.item.weapon_url_name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
            
        weaponDiv.textContent = weaponName;
        weaponDiv.style.fontSize = '12px';
        weaponDiv.style.color = '#6b7280';
        weaponDiv.style.marginBottom = '2px';
        infoDiv.appendChild(weaponDiv);
    }
  
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
  
    if (auction.item && auction.item.attributes) {
      auction.item.attributes.forEach(attr => {
        const tag = document.createElement('span');
        tag.textContent = `${attr.value} ${attr.url_name.replace(/_/g, ' ')}`;
        tag.style.fontSize = '11px';
        tag.style.padding = '2px 6px';
        tag.style.borderRadius = '4px';
        
        // Check for match
        // const isRecoil = attr.url_name === 'recoil';
        // let isPositiveType = false;

        // if (isRecoil) {
        //     // Recoil: Negative value (< 0) is GOOD (Positive type)
        //     isPositiveType = attr.value <= 0; 
        // } else {
        //     // Standard: Positive value (> 0) is GOOD (Positive type)
        //     isPositiveType = attr.value > 0;
        // }

        let matchType = 'none';
        
        // Match Logic
        // If it's a "Good" attribute (positive type), check if it's in our desired positives
        if (originalPositiveAttrs.includes(attr.url_name)) {
          matchType = 'positive';
        } 
        // If it's a "Bad" attribute (negative type), check if it's in our desired negatives
        else if (originalNegativeAttrs.includes(attr.url_name)) {
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
  
    // Right side container (Price + Button)
    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.flexDirection = 'column';
    rightDiv.style.alignItems = 'flex-end';
    rightDiv.style.gap = '8px';
    rightDiv.style.marginLeft = '16px';

    // Price
    const priceDiv = document.createElement('div');
    priceDiv.style.fontWeight = 'bold';
    priceDiv.style.fontSize = '16px';
    priceDiv.style.color = '#667eea';
    priceDiv.style.whiteSpace = 'nowrap';
    priceDiv.textContent = `${auction.buyout_price || auction.starting_price} P`;
    rightDiv.appendChild(priceDiv);
    
    // Update Button (if requested)
    if (options.showUpdate && !auction.closed) {
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.className = 'btn btn-primary btn-xs';
        updateBtn.style.fontSize = '11px';
        updateBtn.style.padding = '2px 8px';
        updateBtn.onclick = (e) => {
            e.stopPropagation();
            if (options.onUpdate) options.onUpdate(auction);
        };
        rightDiv.appendChild(updateBtn);
    }

    cell.appendChild(rightDiv);
  
    return cell;
  }