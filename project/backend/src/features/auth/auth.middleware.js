const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Brak tokenu - zaloguj się' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // 401 (not 403) so the frontend knows the session is gone and logs the user out.
    return res.status(401).json({
      success: false,
      message: 'Nieprawidłowy lub wygasły token' 
    });
  }
};

module.exports = authenticateToken;