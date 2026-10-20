const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../shared/utils/email.service');
const AppError = require('../../shared/utils/app-error');

// Same default as the demo seed (src/database/seed-demo.js).
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';

class AuthService {
  async register({ username, email, password }) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new AppError('Email już jest używany', 409);
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError('Username zajęty', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await sendVerificationEmail(email, verificationToken, username);

    return { user, verificationToken };
  }

  async login({ login, password }) {
    const isEmail = login.includes('@');
    
    const user = await User.findOne({
      where: isEmail ? { email: login } : { username: login }
    });

    if (!user) {
      throw new AppError('Nieprawidłowy login lub hasło', 401);
    }

    if (!user.password) {
      throw new AppError('To konto zostało utworzone przez Google. Zaloguj się przez Google.', 400);
    }

    // Password is checked first, so account state (and the email) is only revealed to its owner.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Nieprawidłowy login lub hasło', 401);
    }

    if (!user.isVerified) {
      const error = new AppError('Email nie został zweryfikowany', 403);
      error.needsVerification = true;
      error.email = user.email;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  }

  async verifyEmail(token) {
    const { Op } = require('sequelize');
    
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new AppError('Token nieprawidłowy lub wygasł', 400);
    }

    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    return user;
  }

  async resendVerification(email) {
    const user = await User.findOne({ where: { email } });

    // Same response for unknown, already verified and Google-only accounts (no account enumeration).
    if (!user || user.isVerified || !user.password) {
      return { success: true };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await sendVerificationEmail(email, verificationToken, user.username);

    return { success: true };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new AppError('Użytkownik nie istnieje', 404);
    }

    if (!user.password) {
      throw new AppError('To konto zostało utworzone przez Google. Nie możesz zmienić hasła.', 400);
    }

    // The demo password is public; letting a visitor change it would lock everyone else out.
    if (user.email === DEMO_EMAIL) {
      throw new AppError('Nie można zmienić hasła konta demo', 403);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Obecne hasło jest nieprawidłowe', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    // Same response whether or not the account exists, so the endpoint cannot be used
    // to check which emails are registered. Google-only accounts have no password to reset.
    if (!user || !user.password) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000)
    });

    const emailResult = await sendPasswordResetEmail(email, resetToken, user.username);

    if (!emailResult.success) {
      throw new Error('Błąd wysyłania emaila');
    }

    return { success: true };
  }

  async resetPassword({ token, newPassword }) {
    const { Op } = require('sequelize');

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new AppError('Token nieprawidłowy lub wygasł', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return user;
  }

  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'isVerified', 'googleId', 'createdAt']
    });

    if (!user) {
      throw new AppError('Użytkownik nie znaleziony', 404);
    }

    return user;
  }
}

module.exports = new AuthService();