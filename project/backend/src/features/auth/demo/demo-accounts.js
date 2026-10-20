// How demo accounts are recognised. Kept free of dependencies so auth code can use it cheaply.

// The shared demo account created by `npm run seed:demo`.
const SHARED_DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';

// Temporary per-visitor accounts from POST /api/auth/demo use this email domain
// (example.com is reserved, so it can never be a real inbox).
const VISITOR_DEMO_DOMAIN = 'demo.example.com';
const VISITOR_DEMO_TTL_MS = 24 * 60 * 60 * 1000;

const isDemoEmail = (email = '') =>
  email === SHARED_DEMO_EMAIL || email.endsWith(`@${VISITOR_DEMO_DOMAIN}`);

module.exports = { SHARED_DEMO_EMAIL, VISITOR_DEMO_DOMAIN, VISITOR_DEMO_TTL_MS, isDemoEmail };
