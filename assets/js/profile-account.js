// Profile Account Management
// Manages user profile data display and updates

class ProfileAccountManager {
  constructor() {
    this.user = null;
    this.profile = null;
    this.avatarUpload = document.getElementById('avatar-upload');
    this.avatarEditBtn = document.getElementById('avatar-edit-btn');
    this.changeAvatarBtn = document.getElementById('change-avatar-btn');
    this.deleteAccountBtn = document.getElementById('delete-account-btn');
    
    this.init();
  }

  async init() {
    // Load user data from Supabase
    await this.loadUserData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Display user data
    this.displayUserData();
  }

  async loadUserData() {
    try {
      const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login.html';
        return;
      }

      this.user = user;

      // Load profile data from profiles table
      const { data: profile, error: profileError } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      this.profile = profile || {};
      
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  }

  displayUserData() {
    // Display user name
    const nameElements = document.querySelectorAll('[data-user-name]');
    const fullName = this.profile.full_name || this.user?.user_metadata?.full_name || '';
    nameElements.forEach(el => {
      el.textContent = fullName || '-';
    });

    // Display email
    const emailElements = document.querySelectorAll('[data-user-email]');
    emailElements.forEach(el => {
      el.textContent = this.user?.email || '-';
    });

    // Display phone
    const phoneElements = document.querySelectorAll('[data-user-phone]');
    phoneElements.forEach(el => {
      el.textContent = this.profile.phone || '-';
    });

    // Display grade (clasa)
    const gradeElements = document.querySelectorAll('[data-user-grade]');
    gradeElements.forEach(el => {
      el.textContent = this.profile.grade || '-';
    });

    // Display school
    const schoolElements = document.querySelectorAll('[data-user-school]');
    schoolElements.forEach(el => {
      el.textContent = this.profile.school || '-';
    });

    // Display member since
    const memberSinceElements = document.querySelectorAll('[data-member-since]');
    if (this.user?.created_at) {
      const createdDate = new Date(this.user.created_at);
      const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 
                      'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
      const monthName = months[createdDate.getMonth()];
      const year = createdDate.getFullYear();
      memberSinceElements.forEach(el => {
        el.textContent = `Membru din ${monthName} ${year}`;
      });
    }

    // Display avatar
    if (this.profile.avatar_url) {
      const avatarImgs = document.querySelectorAll('img[alt="Profil"]');
      avatarImgs.forEach(img => {
        img.src = this.profile.avatar_url;
        img.style.display = 'block';
      });
    }

    // Display last update dates
    const lastUpdateElements = document.querySelectorAll('[data-last-update]');
    if (this.profile.updated_at) {
      const updateDate = new Date(this.profile.updated_at);
      const day = updateDate.getDate();
      const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
      const month = months[updateDate.getMonth()];
      const year = updateDate.getFullYear();
      lastUpdateElements.forEach(el => {
        el.textContent = `Ultima actualizare: ${day} ${month} ${year}`;
      });
    }

    // Hide subscription/payment sections if no data
    const subscriptionPlan = document.querySelector('[data-subscription-plan]');
    if (subscriptionPlan) {
      subscriptionPlan.textContent = this.profile.subscription_plan || '-';
    }

    const subscriptionStatus = document.querySelector('[data-subscription-status]');
    if (subscriptionStatus) {
      if (this.profile.subscription_status === 'active') {
        subscriptionStatus.innerHTML = '<span class="inline-block px-12 py-4 bg-[#E8F5E9] text-[#2E7D32] rounded text-sm">Activ</span>';
      } else if (this.profile.subscription_status === 'paused') {
        subscriptionStatus.innerHTML = '<span class="inline-block px-12 py-4 bg-[#FFF3E0] text-[#E65100] rounded text-sm">În pauză</span>';
      } else if (this.profile.subscription_status === 'cancelled') {
        subscriptionStatus.innerHTML = '<span class="inline-block px-12 py-4 bg-[#FFEBEE] text-[#C62828] rounded text-sm">Anulat</span>';
      } else {
        subscriptionStatus.textContent = '-';
      }
    }

    const subscriptionPrice = document.querySelector('[data-subscription-price]');
    if (subscriptionPrice) {
      subscriptionPrice.textContent = this.profile.subscription_price || '-';
    }

    const nextPayment = document.querySelector('[data-next-payment]');
    if (nextPayment) {
      if (this.profile.next_payment_date) {
        const paymentDate = new Date(this.profile.next_payment_date);
        const day = paymentDate.getDate();
        const months = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 
                        'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
        const month = months[paymentDate.getMonth()];
        const year = paymentDate.getFullYear();
        nextPayment.textContent = `${day} ${month} ${year}`;
      } else {
        nextPayment.textContent = '-';
      }
    }

    const paymentMethod = document.querySelector('[data-payment-method]');
    if (paymentMethod) {
      paymentMethod.textContent = this.profile.payment_method || '-';
    }

    // Load payments history
    this.loadPaymentsHistory();
  }

  async loadPaymentsHistory() {
    const paymentsList = document.querySelector('[data-payments-list]');
    if (!paymentsList) return;

    try {
      const { data: payments, error } = await window.supabaseClient
        .from('payments')
        .select('*')
        .eq('user_id', this.user.id)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!payments || payments.length === 0) {
        paymentsList.innerHTML = `
          <div class="py-40 text-center text-[#666666]">
            <p class="text-base">Nu există plăți înregistrate încă.</p>
          </div>
        `;
        return;
      }

      // Display payments
      paymentsList.innerHTML = payments.map(payment => {
        const date = new Date(payment.payment_date);
        const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        
        return `
          <div class="grid grid-cols-1 md:grid-cols-4 gap-y-8 md:gap-x-30 py-16 border-b border-[#E0E0E0] hover:bg-[#F9F9F9] transition-colors duration-200">
            <div class="text-base md:text-md font-medium text-[#000000]">${formattedDate}</div>
            <div class="text-base md:text-md text-[#666666]">${payment.description || 'Plată abonament'}</div>
            <div class="text-base md:text-md text-[#000000] font-medium">${payment.amount} RON</div>
            <div class="text-base md:text-md text-[#666666] text-right">
              <span class="inline-block px-12 py-4 bg-[#E8F5E9] text-[#2E7D32] rounded text-sm">Plătit</span>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Error loading payments:', error);
      paymentsList.innerHTML = `
        <div class="py-40 text-center text-[#666666]">
          <p class="text-base">Nu s-au putut încărca plățile.</p>
        </div>
      `;
    }
  }

  setupEventListeners() {
    // Avatar upload
    if (this.avatarEditBtn && this.avatarUpload) {
      this.avatarEditBtn.addEventListener('click', () => {
        this.avatarUpload.click();
      });
    }

    if (this.changeAvatarBtn && this.avatarUpload) {
      this.changeAvatarBtn.addEventListener('click', () => {
        this.avatarUpload.click();
      });
    }

    if (this.avatarUpload) {
      this.avatarUpload.addEventListener('change', (e) => {
        this.handleAvatarUpload(e);
      });
    }

    // Delete account
    if (this.deleteAccountBtn) {
      this.deleteAccountBtn.addEventListener('click', () => {
        this.handleDeleteAccount();
      });
    }

    // Edit profile buttons
    const editButtons = document.querySelectorAll('[data-edit-profile]');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleEditProfile();
      });
    });
  }

  async handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Te rugăm să selectezi o imagine.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imaginea este prea mare. Maxim 2MB.');
      return;
    }

    try {
      // Show loading state
      const avatarImgs = document.querySelectorAll('img[alt="Profil"]');
      avatarImgs.forEach(img => {
        img.style.opacity = '0.5';
      });

      // Convert image to base64
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64Image = e.target.result;

          // Update profile with base64 image
          const { error: updateError } = await window.supabaseClient
            .from('profiles')
            .update({ 
              avatar_url: base64Image, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', this.user.id);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }

          // Update display
          avatarImgs.forEach(img => {
            img.src = base64Image;
            img.style.opacity = '1';
            img.style.display = 'block';
          });

          this.profile.avatar_url = base64Image;

          // Show success message
          alert('Poza de profil a fost actualizată cu succes!');

        } catch (error) {
          console.error('Error updating avatar:', error);
          alert('A apărut o eroare la actualizarea pozei. Te rugăm să încerci din nou.');
          
          // Restore opacity
          avatarImgs.forEach(img => {
            img.style.opacity = '1';
          });
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('A apărut o eroare la citirea fișierului.');
        
        // Restore opacity
        avatarImgs.forEach(img => {
          img.style.opacity = '1';
        });
      };

      // Read file as base64
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('A apărut o eroare la încărcarea pozei. Te rugăm să încerci din nou.');
      
      // Restore opacity
      const avatarImgs = document.querySelectorAll('img[alt="Profil"]');
      avatarImgs.forEach(img => {
        img.style.opacity = '1';
      });
    }
  }

  handleEditProfile() {
    // For now, just show an alert
    // In a full implementation, this would open a modal with edit form
    alert('Funcționalitatea de editare va fi disponibilă în curând. Vei putea actualiza datele tale direct din această pagină.');
  }

  async handleDeleteAccount() {
    // Show confirmation dialog
    const confirmed = confirm(
      'Ești sigur că vrei să ștergi contul? Această acțiune este permanentă și nu poate fi anulată.\n\n' +
      'Toate datele tale, inclusiv progresul și plățile, vor fi șterse definitiv.'
    );

    if (!confirmed) return;

    // Second confirmation
    const doubleConfirmed = confirm(
      'Ultima confirmare: Contul tău va fi șters permanent. Ești absolut sigur?'
    );

    if (!doubleConfirmed) return;

    try {
      // Delete user data from profiles table
      const { error: profileError } = await window.supabaseClient
        .from('profiles')
        .delete()
        .eq('id', this.user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete user payments
      const { error: paymentsError } = await window.supabaseClient
        .from('payments')
        .delete()
        .eq('user_id', this.user.id);

      if (paymentsError) {
        console.error('Error deleting payments:', paymentsError);
      }

      // Delete user's avatar from storage if exists (not needed for base64, but clean up profile)
      if (this.profile.avatar_url) {
        // Avatar is stored as base64 in database, no storage cleanup needed
      }

      // Delete auth user (this must be done via admin API or through Supabase functions)
      // For now, we'll just sign out and redirect
      // Note: Actual user deletion should be handled server-side
      
      await window.supabaseClient.auth.signOut();
      
      // Show message and redirect
      alert('Contul tău a fost șters. Vei fi redirecționat către pagina principală.');
      window.location.href = '/index.html';

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('A apărut o eroare la ștergerea contului. Te rugăm să ne contactezi pentru asistență.');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProfileAccountManager();
  });
} else {
  new ProfileAccountManager();
}
