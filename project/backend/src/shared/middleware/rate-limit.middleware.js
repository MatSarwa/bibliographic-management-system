const rateLimit = require('express-rate-limit');


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 1000,                  
  message: {
    success: false,
    message: 'Zbyt wiele requestów. Spróbuj za 15 minut.'
  },
  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 20,                    
  message: {
    success: false,
    message: 'Zbyt wiele prób. Spróbuj za 15 minut.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000,      
  max: 20,                    
  message: {
    success: false,
    message: 'Zbyt wiele wyszukiwań. Poczekaj chwilę.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const heavyOperationLimiter = rateLimit({
  windowMs: 60 * 1000,       
  max: 20,                    
  message: {
    success: false,
    message: 'Zbyt wiele operacji. Poczekaj chwilę.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  globalLimiter,
  authLimiter,
  externalApiLimiter,
  heavyOperationLimiter
};