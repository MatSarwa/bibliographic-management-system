const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../shared/utils/email.service');

class AuthService {
  async register({ username, email, password }) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('Email już jest używany');
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username zajęty');
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
      throw new Error('Nieprawidłowy login lub hasło');
    }

    if (!user.password) {
      throw new Error('To konto zostało utworzone przez Google. Zaloguj się przez Google.');
    }

    if (!user.isVerified) {
      const error = new Error('Email nie został zweryfikowany');
      error.needsVerification = true;
      error.email = user.email;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Nieprawidłowy login lub hasło');
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
      throw new Error('Token nieprawidłowy lub wygasł');
    }

    await user.update({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    return user;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Użytkownik nie istnieje');
    }

    if (!user.password) {
      throw new Error('To konto zostało utworzone przez Google. Nie możesz zmienić hasła.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Obecne hasło jest nieprawidłowe');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Użytkownik z tym emailem nie istnieje');
    }

    if (!user.password) {
      throw new Error('To konto zostało utworzone przez Google. Zaloguj się przez Google.');
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
      throw new Error('Token nieprawidłowy lub wygasł');
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
      throw new Error('Użytkownik nie znaleziony');
    }

    return user;
  }
}

module.exports = new AuthService();