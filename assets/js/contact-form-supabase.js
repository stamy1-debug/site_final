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

    // Determine if this is a newsletter form or contact form
    // Newsletter forms are typically in footer or have "Abonează-te" button
    const submitBtn = form.querySelector('button[type="submit"]');
    const isNewsletterForm = submitBtn && submitBtn.textContent.includes('Abonează');

    // Validate based on form type
    if (!name || !email) {
      alert('Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    // For contact forms, message is required
    if (!isNewsletterForm && !message) {
      alert('Te rugăm să completezi mesajul.');
      return;
    }

    // Get form body and success message containers
    const formBody = form.querySelector('[data-form-body]');
    const successMessage = form.querySelector('[data-success-message]');

    try {
      // Disable form
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Se trimite...';
      }

      // Save to appropriate Supabase table
      if (isNewsletterForm) {
        // Save to newsletter_subscribers
        const { data, error } = await window.supabaseClient
          .from('newsletter_subscribers')
          .insert([
            {
              name: name.trim(),
              email: email.trim(),
              message: message ? message.trim() : null,
              subscribed_at: new Date().toISOString(),
              active: true,
              confirmed: false
            }
          ]);

        if (error) {
          // Check if email already exists
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('Acest email este deja înregistrat pentru newsletter.');
          }
          console.error('Supabase error:', error);
          throw error;
        }
      } else {
        // Save to contact_messages
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
      }

      // Show success message
      if (formBody) {
        formBody.style.display = 'none';
      }
      
      if (successMessage) {
        successMessage.style.display = 'block';
      }

      // Reset form after 5 seconds
      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isNewsletterForm ? 'Abonează-te' : 'Trimite';
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
      
      // Show appropriate error message
      const errorMsg = error.message || 'A apărut o eroare la trimiterea mesajului. Te rugăm să încerci din nou sau să ne contactezi direct la email.';
      alert(errorMsg);
      
      // Re-enable form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = isNewsletterForm ? 'Abonează-te' : 'Trimite';
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
