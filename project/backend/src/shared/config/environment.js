require('dotenv').config();

// Fail fast instead of starting a server where every login crashes.
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  throw new Error('Brak JWT_SECRET w zmiennych środowiskowych (.env). Serwer nie może wystartować.');
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
};