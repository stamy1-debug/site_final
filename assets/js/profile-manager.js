// Profile Management for ventures/index.html

let currentUser = null;
let currentProfile = null;

// Load user data on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserProfile();
  setupEventListeners();
});

// Load user profile from Supabase
async function loadUserProfile() {
  try {
    // Get current user
    currentUser = await getCurrentUser();
    
    if (!currentUser) {
      window.location.href = '/login.html';
      return;
    }

    // Get user profile
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    currentProfile = profile;
    
    // Populate page with real data
    populateProfileData();
    
  } catch (error) {
    console.error('Error in loadUserProfile:', error);
  }
}

// Populate page with user data
function populateProfileData() {
  // User name in header
  const nameElements = document.querySelectorAll('[data-user-name]');
  nameElements.forEach(el => {
    el.textContent = currentProfile?.full_name || currentUser.email.split('@')[0];
  });

  // Email
  const emailElements = document.querySelectorAll('[data-user-email]');
  emailElements.forEach(el => {
    el.textContent = currentUser.email;
  });

  // Phone
  const phoneElements = document.querySelectorAll('[data-user-phone]');
  phoneElements.forEach(el => {
    el.textContent = currentProfile?.phone || 'Nu este setat';
  });

  // Grade
  const gradeElements = document.querySelectorAll('[data-user-grade]');
  gradeElements.forEach(el => {
    el.textContent = currentProfile?.grade ? `Clasa ${currentProfile.grade}` : 'Nu este setată';
  });

  // School
  const schoolElements = document.querySelectorAll('[data-user-school]');
  schoolElements.forEach(el => {
    el.textContent = currentProfile?.school || 'Nu este setată';
  });

  // Member since
  const memberSinceElements = document.querySelectorAll('[data-member-since]');
  memberSinceElements.forEach(el => {
    const date = new Date(currentUser.created_at);
    const monthNames = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
                       'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    el.textContent = `Membru din ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  });

  // Last updated
  if (currentProfile?.updated_at) {
    const updatedDate = new Date(currentProfile.updated_at);
    const formattedDate = `${updatedDate.getDate()} ${getMonthName(updatedDate.getMonth())} ${updatedDate.getFullYear()}`;
    
    const lastUpdateElements = document.querySelectorAll('[data-last-update]');
    lastUpdateElements.forEach(el => {
      el.textContent = `Ultima actualizare: ${formattedDate}`;
    });
  }
}

// Setup event listeners for edit buttons
function setupEventListeners() {
  // Edit profile button
  const editButtons = document.querySelectorAll('[data-edit-profile]');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openEditModal();
    });
  });
}

// Open edit modal
function openEditModal() {
  const modal = document.createElement('div');
  modal.id = 'edit-profile-modal';
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem;">
      <div style="background: white; border-radius: 1rem; max-width: 50rem; width: 100%; max-height: 90vh; overflow-y: auto; padding: 3rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: 600; margin: 0;">Editează Profilul</h2>
          <button onclick="closeEditModal()" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: #666;">&times;</button>
        </div>
        
        <form id="profile-edit-form">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nume Complet</label>
            <input type="text" id="edit-name" value="${currentProfile?.full_name || ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 1rem;">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
            <input type="email" value="${currentUser.email}" disabled style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 1rem; background: #f5f5f5; color: #666;">
            <small style="color: #666; font-size: 0.875rem;">Email-ul nu poate fi modificat</small>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Telefon</label>
            <input type="tel" id="edit-phone" value="${currentProfile?.phone || ''}" placeholder="07xxxxxxxx" style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 1rem;">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Clasa</label>
            <select id="edit-grade" style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 1rem;">
              <option value="">Selectează clasa</option>
              <option value="5" ${currentProfile?.grade === 5 ? 'selected' : ''}>Clasa 5</option>
              <option value="6" ${currentProfile?.grade === 6 ? 'selected' : ''}>Clasa 6</option>
              <option value="7" ${currentProfile?.grade === 7 ? 'selected' : ''}>Clasa 7</option>
              <option value="8" ${currentProfile?.grade === 8 ? 'selected' : ''}>Clasa 8</option>
            </select>
          </div>
          
          <div style="margin-bottom: 2rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Școala</label>
            <input type="text" id="edit-school" value="${currentProfile?.school || ''}" placeholder="Numele școlii" style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 0.5rem; font-size: 1rem;">
          </div>
          
          <div id="save-error" style="display: none; background: #fee; color: #c33; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"></div>
          <div id="save-success" style="display: none; background: #efe; color: #3c3; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"></div>
          
          <div style="display: flex; gap: 1rem;">
            <button type="button" onclick="closeEditModal()" style="flex: 1; padding: 0.875rem; background: #f5f5f5; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">Anulează</button>
            <button type="submit" id="save-profile-btn" style="flex: 1; padding: 0.875rem; background: #667eea; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">Salvează</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submit handler
  document.getElementById('profile-edit-form').addEventListener('submit', handleSaveProfile);
}

// Close edit modal
window.closeEditModal = function() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.remove();
  }
};

// Handle save profile
async function handleSaveProfile(e) {
  e.preventDefault();
  
  const saveBtn = document.getElementById('save-profile-btn');
  const errorDiv = document.getElementById('save-error');
  const successDiv = document.getElementById('save-success');
  
  saveBtn.disabled = true;
  saveBtn.textContent = 'Se salvează...';
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';
  
  const updates = {
    full_name: document.getElementById('edit-name').value,
    phone: document.getElementById('edit-phone').value || null,
    grade: document.getElementById('edit-grade').value ? parseInt(document.getElementById('edit-grade').value) : null,
    school: document.getElementById('edit-school').value || null
  };
  
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);
    
    if (error) throw error;
    
    // Update local profile data
    currentProfile = { ...currentProfile, ...updates };
    
    // Show success message
    successDiv.textContent = 'Profilul a fost actualizat cu succes!';
    successDiv.style.display = 'block';
    
    // Refresh page data
    populateProfileData();
    
    // Close modal after 1 second
    setTimeout(() => {
      closeEditModal();
    }, 1000);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    errorDiv.textContent = 'Eroare la salvarea datelor: ' + error.message;
    errorDiv.style.display = 'block';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salvează';
  }
}

// Helper function
function getMonthName(month) {
  const names = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month];
}

// Load subscriptions and payments
async function loadSubscriptionsAndPayments() {
  if (!currentUser) return;
  
  // Load active subscription
  const { data: subscriptions } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (subscriptions && subscriptions.length > 0) {
    displaySubscription(subscriptions[0]);
  }
  
  // Load payment history
  const { data: payments } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (payments && payments.length > 0) {
    displayPayments(payments);
  }
}

function displaySubscription(subscription) {
  // Mapare plan_type la nume în română
  const planNames = {
    'STARTER': 'STARTER - Fundamentele Matematicii',
    'PRO': 'PRO - Meditație Completă',
    'ELITE': 'ELITE - Pregătire Intensivă'
  };

  // Mapare status la badge
  const statusBadges = {
    'active': '<span class="inline-block px-12 py-4 bg-[#E8F5E9] text-[#2E7D32] rounded text-sm">Activ</span>',
    'pending': '<span class="inline-block px-12 py-4 bg-[#FFF3E0] text-[#E65100] rounded text-sm">În așteptare</span>',
    'expired': '<span class="inline-block px-12 py-4 bg-[#FFEBEE] text-[#C62828] rounded text-sm">Expirat</span>',
    'cancelled': '<span class="inline-block px-12 py-4 bg-[#F5F5F5] text-[#666666] rounded text-sm">Anulat</span>'
  };

  // Populează elementele cu data attributes
  const planElement = document.querySelector('[data-subscription-plan]');
  const statusElement = document.querySelector('[data-subscription-status]');
  const priceElement = document.querySelector('[data-subscription-price]');
  const nextPaymentElement = document.querySelector('[data-next-payment]');

  if (planElement) {
    planElement.textContent = planNames[subscription.plan_type] || subscription.plan_type;
  }

  if (statusElement) {
    statusElement.innerHTML = statusBadges[subscription.status] || subscription.status;
  }

  if (priceElement) {
    priceElement.textContent = `${subscription.price} RON/lună`;
  }

  if (nextPaymentElement && subscription.end_date) {
    const endDate = new Date(subscription.end_date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    nextPaymentElement.textContent = endDate.toLocaleDateString('ro-RO', options);
  }
}

function displayPayments(payments) {
  const paymentsContainer = document.querySelector('[data-payments-list]');
  
  if (!paymentsContainer) return;

  if (payments.length === 0) {
    paymentsContainer.innerHTML = `
      <div class="py-40 text-center text-[#666666]">
        <p class="text-base">Nu există plăți înregistrate încă.</p>
        <p class="mt-8"><a href="../longevity-intelligence.html" class="text-[#000000] underline hover:opacity-70">Alege un plan pentru a începe</a></p>
      </div>
    `;
    return;
  }

  // Mapare status la badge
  const statusBadges = {
    'completed': '<span class="inline-block px-12 py-4 bg-[#E8F5E9] text-[#2E7D32] rounded text-sm">Finalizat</span>',
    'pending': '<span class="inline-block px-12 py-4 bg-[#FFF3E0] text-[#E65100] rounded text-sm">În așteptare</span>',
    'failed': '<span class="inline-block px-12 py-4 bg-[#FFEBEE] text-[#C62828] rounded text-sm">Eșuat</span>',
    'refunded': '<span class="inline-block px-12 py-4 bg-[#E3F2FD] text-[#1565C0] rounded text-sm">Rambursat</span>'
  };

  // Generează HTML pentru fiecare plată
  const paymentsHTML = payments.map(payment => {
    const paymentDate = payment.payment_date ? new Date(payment.payment_date) : new Date(payment.created_at);
    const formattedDate = paymentDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-y-8 md:gap-x-30 py-16 border-b border-[#E0E0E0] hover:bg-[#F9F9F9] transition-colors duration-200">
        <div class="text-base md:text-md font-medium text-[#000000]">${formattedDate}</div>
        <div class="text-base md:text-md text-[#666666]">${payment.amount} ${payment.currency}</div>
        <div class="text-base md:text-md">${statusBadges[payment.status] || payment.status}</div>
        <div class="text-base md:text-md text-[#666666] text-right">${payment.payment_method || 'Card'}</div>
      </div>
    `;
  }).join('');

  paymentsContainer.innerHTML = paymentsHTML;
}
