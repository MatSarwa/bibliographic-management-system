// Features that can be switched off per deployment with VITE_* variables (all on by default).

// Google login needs OAuth set up for the deployed domain.
export const GOOGLE_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_LOGIN !== 'false';

// On the public demo there is no email sending, so sign-up and password reset are hidden
// and visitors use the demo account instead.
export const REGISTRATION_ENABLED = import.meta.env.VITE_ENABLE_REGISTRATION !== 'false';
