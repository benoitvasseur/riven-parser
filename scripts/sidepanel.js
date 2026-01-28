// Script pour le sidepanel Riven Market

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Riven Market sidepanel chargé');
  
  // Vérifier l'état de connexion au chargement
  await checkAuthStatus();
  
  // Gestionnaire du formulaire de connexion
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);
  
  // Gestionnaire du bouton de déconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', handleLogout);
  
  // Gestionnaire du bouton d'actualisation
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.addEventListener('click', async () => {
    console.log('Actualisation demandée');
    alert('Données actualisées !');
  });
});

/**
 * Vérifie l'état d'authentification et affiche la page appropriée
 */
async function checkAuthStatus() {
  const isAuth = await window.WarframeAPI.isAuthenticated();
  
  if (isAuth) {
    await showMainPage();
  } else {
    showLoginPage();
  }
}

/**
 * Affiche la page de connexion
 */
function showLoginPage() {
  document.getElementById('loginPage').style.display = 'block';
  document.getElementById('mainPage').style.display = 'none';
}

/**
 * Affiche la page principale
 */
async function showMainPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  
  // Charger les informations utilisateur
  await loadUserInfo();
}

/**
 * Charge les informations de l'utilisateur connecté
 */
async function loadUserInfo() {
  const user = await window.WarframeAPI.getUserInfo();
  
  if (user) {
    // Afficher les informations utilisateur
    const userName = user.ingame_name || 'Utilisateur';
    const platform = user.platform || 'N/A';
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = `Plateforme: ${platform.toUpperCase()}`;
    
    // Afficher les initiales dans l'avatar
    const initials = userName.substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    console.log('Informations utilisateur chargées:', user);
  }
}

/**
 * Gère la soumission du formulaire de connexion
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const loginBtn = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('errorMessage');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  // Masquer les erreurs précédentes
  errorMessage.style.display = 'none';
  
  // Récupérer les valeurs du formulaire
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Validation basique
  if (!email || !password) {
    showError('Veuillez remplir tous les champs');
    return;
  }
  
  // Désactiver le bouton pendant la connexion
  loginBtn.disabled = true;
  
  // Sauvegarder le texte original
  const originalHTML = loginBtn.innerHTML;
  loginBtn.innerHTML = '<span class="btn-icon">⏳</span> Connexion en cours...';
  
  try {
    console.log('Connexion avec email/password...');
    
    // Appeler l'API de connexion
    const result = await window.WarframeAPI.signIn(email, password);
    
    if (result.success) {
      console.log('Connexion réussie !', result.data);
      
      // Réinitialiser le formulaire
      emailInput.value = '';
      passwordInput.value = '';
      
      // Afficher la page principale
      await showMainPage();
    } else {
      console.error('Échec de la connexion:', result.error);
      showError(result.error || 'Identifiants incorrects. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    showError('Une erreur est survenue. Veuillez réessayer.');
  } finally {
    // Réactiver le bouton
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalHTML;
  }
}

/**
 * Gère la déconnexion
 */
async function handleLogout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    await window.WarframeAPI.signOut();
    console.log('Déconnexion effectuée');
    showLoginPage();
  }
}

/**
 * Affiche un message d'erreur
 */
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

