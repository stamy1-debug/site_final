// Authentication Logic

// Sign up with email and password
async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// Sign in with email and password
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// Reset password
async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password.html`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update user profile
async function updateProfile(updates) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
