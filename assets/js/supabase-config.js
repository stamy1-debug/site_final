// Supabase Configuration
const SUPABASE_URL = 'https://mjiogekienxwgaqvhhcj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1XeZbP9yYIvygcU5_lpq-w_E4gJHtdu';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is authenticated
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

// Sign out
async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (!error) {
    window.location.href = '/index.html';
  }
  return error;
}
