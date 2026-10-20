const config = require('../config/environment');

const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Expected errors (AppError) carry their own status and a user-facing message.
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.needsVerification && { needsVerification: true, email: err.email })
    });
  }

  // Unexpected errors: log the details, but never send internals (SQL, stack) to the client in production.
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: config.env === 'production'
      ? 'Wystąpił błąd serwera. Spróbuj ponownie później.'
      : err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
