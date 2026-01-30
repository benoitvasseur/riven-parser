// Module for "Rivens" tab
import { createAuctionCell } from './auction-cell.js';

/**
 * Initializes the Rivens tab content
 */
export function initRivensTab() {
  console.log('Rivens tab initialized');
  refreshRivensTab();
}

/**
 * Refreshes the Rivens tab content
 */
export async function refreshRivensTab() {
  console.log('Rivens tab refreshed');
  const container = document.getElementById('rivensTab');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding: 20px;">Chargement de vos enchères... ⏳</div>';

  try {
    const user = await window.WarframeAPI.getUserInfo();
    if (!user || !user.id) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: red;">Erreur: Utilisateur non identifié. Veuillez vous reconnecter.</div>';
      return;
    }

    const auctions = await window.WarframeAPI.getProfileAuctions(user.id);
    
    container.innerHTML = '';
    
    if (auctions.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">Aucune enchère en cours.</div>';
      return;
    }

    // Header with count
    const header = document.createElement('div');
    header.style.padding = '10px 10px 0 10px';
    header.style.fontWeight = 'bold';
    header.textContent = `Vos enchères (${auctions.length})`;
    container.appendChild(header);

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';
    list.style.padding = '10px';

    // Sort by most recent update
    auctions.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    auctions.forEach(auction => {
        // We pass empty arrays for original attributes as we are not comparing
        // Pass null for query
        const cell = createAuctionCell(auction, [], [], null);
        
        // Add status indicator if closed or private
        if (auction.closed || auction.private || !auction.visible) {
            const statusDiv = document.createElement('div');
            statusDiv.style.fontSize = '12px';
            statusDiv.style.marginTop = '5px';
            statusDiv.style.textAlign = 'right';
            
            if (auction.closed) {
                statusDiv.textContent = '🔴 Closed';
                statusDiv.style.color = '#ef4444';
            } else if (!auction.visible) {
                statusDiv.textContent = '👁️ Invisible';
                statusDiv.style.color = '#f59e0b';
            } else if (auction.private) {
                statusDiv.textContent = '🔒 Private';
                statusDiv.style.color = '#6b7280';
            }
            
            // Append to the infoDiv (first child of cell)
            if (cell.firstChild) {
                cell.firstChild.appendChild(statusDiv);
            }
        }

        list.appendChild(cell);
    });

    container.appendChild(list);

  } catch (error) {
    console.error('Error refreshing rivens tab:', error);
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: red;">Erreur lors du chargement: ${error.message}</div>`;
  }
}
