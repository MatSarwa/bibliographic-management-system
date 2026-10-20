const asyncHandler = require('../../shared/utils/async-handler');
const authService = require('./auth.service');
const ResponseHelper = require('../../shared/utils/response.helper');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const tempCodes = new Map();


class AuthController {
  register = asyncHandler(async (req, res) => {
    // The public demo has no email sending, so sign-ups would only collect visitors' addresses.
    if (process.env.ENABLE_REGISTRATION === 'false') {
      return ResponseHelper.error(res, 'Rejestracja jest wyłączona w wersji demonstracyjnej', 403);
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return ResponseHelper.error(res, 'Wszystkie pola są wymagane', 400);
    }

    if (password.length < 6) {
      return ResponseHelper.error(res, 'Hasło musi mieć min. 6 znaków', 400);
    }

    const { user } = await authService.register({ username, email, password });


    ResponseHelper.created(res, 
      { email: user.email },
      'Rejestracja udana! Sprawdź email, aby potwierdzić konto.'
    );
  });

  login = asyncHandler(async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
      return ResponseHelper.error(res, 'Podaj login i hasło', 400);
    }

    try {
      const { token, user } = await authService.login({ login, password });


      ResponseHelper.success(res, {
        token,
        username: user.username,
        email: user.email,
        userId: user.id
      });
    } catch (error) {
      if (error.needsVerification) {
        return res.status(403).json({
          success: false,
          message: error.message,
          needsVerification: true,
          email: error.email
        });
      }
      throw error;
    }
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
      return ResponseHelper.error(res, 'Brak tokenu weryfikacyjnego', 400);
    }

    const user = await authService.verifyEmail(token);


    ResponseHelper.success(res, null, 'Email zweryfikowany pomyślnie! Możesz się teraz zalogować.');
  });

  resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return ResponseHelper.error(res, 'Podaj email', 400);
    }

    await authService.resendVerification(email);

    ResponseHelper.success(res, null, 'Jeśli konto wymaga weryfikacji, wysłaliśmy nowy link na podany adres');
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ResponseHelper.error(res, 'Podaj obecne i nowe hasło', 400);
    }

    if (newPassword.length < 6) {
      return ResponseHelper.error(res, 'Nowe hasło musi mieć min. 6 znaków', 400);
    }

    await authService.changePassword(req.user.id, { currentPassword, newPassword });


    ResponseHelper.success(res, null, 'Hasło zostało zmienione pomyślnie');
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return ResponseHelper.error(res, 'Podaj email', 400);
    }

    await authService.forgotPassword(email);

    ResponseHelper.success(res, null, 'Jeśli konto z tym adresem istnieje, wysłaliśmy na nie link do resetowania hasła');
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return ResponseHelper.error(res, 'Token i nowe hasło są wymagane', 400);
    }

    if (newPassword.length < 6) {
      return ResponseHelper.error(res, 'Hasło musi mieć min. 6 znaków', 400);
    }

    const user = await authService.resetPassword({ token, newPassword });


    ResponseHelper.success(res, null, 'Hasło zostało zmienione! Możesz się teraz zalogować.');
  });

  me = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);

    ResponseHelper.success(res, user);
  });

  verify = asyncHandler(async (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    } 
  });
});

googleCallback = (req, res) => {
  
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
  }

  const code = crypto.randomBytes(32).toString('hex');
  
  tempCodes.set(code, {
    userId: req.user.id,
    username: req.user.username,
    email: req.user.email,
    expiresAt: Date.now() + 60000
  });


  res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?code=${code}`);
};

exchangeGoogleCode = (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Brak kodu' });
  }

  const data = tempCodes.get(code);
  
  if (!data) {
    return res.status(400).json({ success: false, message: 'Nieprawidłowy lub wygasły kod' });
  }

  if (Date.now() > data.expiresAt) {
    tempCodes.delete(code);
    return res.status(400).json({ success: false, message: 'Kod wygasł' });
  }

  tempCodes.delete(code);

  const token = jwt.sign(
    { id: data.userId, username: data.username, email: data.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );


  res.json({
    success: true,
    data: {
      token,
      username: data.username,
      userId: data.userId,
      email: data.email
    }
  });
};



}

module.exports = new AuthController();