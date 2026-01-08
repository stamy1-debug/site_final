// Contact Form - Supabase Integration
// Handles form submissions and saves to Supabase database

class ContactFormHandler {
  constructor() {
    this.forms = document.querySelectorAll('form[action*="formspree"], form[data-component="form"]');
    this.init();
  }

  init() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    });
  }

  async handleSubmit(event, form) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Validate
    if (!name || !email || !message) {
      alert('Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    // Get form body and success message containers
    const formBody = form.querySelector('[data-form-body]');
    const successMessage = form.querySelector('[data-success-message]');

    try {
      // Disable form
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Se trimite...';
      }

      // Save to Supabase
      const { data, error } = await window.supabaseClient
        .from('contact_messages')
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            page_url: window.location.href,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Show success message
      if (formBody) {
        formBody.style.display = 'none';
      }
      
      if (successMessage) {
        successMessage.style.display = 'block';
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Trimite';
        }
        if (formBody) {
          formBody.style.display = 'grid';
        }
        if (successMessage) {
          successMessage.style.display = 'none';
        }
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('A apărut o eroare la trimiterea mesajului. Te rugăm să încerci din nou sau să ne contactezi direct la email.');
      
      // Re-enable form
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trimite';
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
  });
} else {
  new ContactFormHandler();
}
