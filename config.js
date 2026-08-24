/**
 * Pyari — Configuration & Supabase Credentials
 */
const CONFIG = {
  SUPABASE_URL: 'https://nuyxpdremqwymhrbakup.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXhwZHJlbXF3eW1ocmJha3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDI2MjcsImV4cCI6MjEwMjk3ODYyN30.RPliJpMJPSI7qmC7bZDKeEJspOYDXrHHcf9wap7ObyI',
  APP_NAME: 'Pyari',
  DEFAULT_OCCASION: 'birthday',
  DEFAULT_STYLE: 'prank',
  ENABLE_SOUND: true,
  ALLOW_LOCAL_FALLBACK: true
};

function isSupabaseConfigured() {
  return Boolean(
    CONFIG.SUPABASE_URL &&
    CONFIG.SUPABASE_ANON_KEY &&
    CONFIG.SUPABASE_URL.startsWith('https://') &&
    CONFIG.SUPABASE_ANON_KEY.length > 20
  );
}

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.isSupabaseConfigured = isSupabaseConfigured;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, isSupabaseConfigured };
}