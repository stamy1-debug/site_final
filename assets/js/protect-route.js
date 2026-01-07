// Route Protection - Add this script to protected pages
(async function() {
  const session = await checkAuth();
  
  if (!session) {
    // User is not authenticated, redirect to login
    window.location.href = '/login.html';
  }
})();

// Add logout functionality to logout buttons
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtns = document.querySelectorAll('[data-logout]');
  
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  });
});
