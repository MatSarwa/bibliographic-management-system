// Expected (business) error with an HTTP status code. Anything thrown that is
// not an AppError is treated by the error handler as an unexpected 500.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
