const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../shared/utils/email.service');
const AuthService = require('../../features/auth/auth.service');


jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mockedId' }),
    })),
}));

jest.mock('../../models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../../shared/utils/email.service');

process.env.JWT_SECRET = 'test-secret';

describe('AuthService - Pełne Testy Jednostkowe', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValueOnce({}); 

      await expect(
        AuthService.register({ username: 'newuser', email: 'existing@email.com', password: 'pass' })
      ).rejects.toThrow('Email już jest używany');
    });

    it('should throw error if username already exists', async () => {
      User.findOne.mockResolvedValueOnce(null); 
      User.findOne.mockResolvedValueOnce({}); 

      await expect(
        AuthService.register({ username: 'existinguser', email: 'new@email.com', password: 'pass' })
      ).rejects.toThrow('Username zajęty');
    });

    it('should create user and send verification email', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValueOnce('hashedpass');
      crypto.randomBytes.mockReturnValue({ toString: () => 'veriftoken' });
      const fakeUser = { id: 1, username: 'newuser', email: 'new@email.com' };
      User.create.mockResolvedValueOnce(fakeUser);
      sendVerificationEmail.mockResolvedValueOnce();

      const result = await AuthService.register({ username: 'newuser', email: 'new@email.com', password: 'pass' });

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'newuser',
        email: 'new@email.com',
        password: 'hashedpass',
        isVerified: false,
        verificationToken: 'veriftoken',
        verificationTokenExpires: expect.any(Date)
      }));
      expect(sendVerificationEmail).toHaveBeenCalledWith('new@email.com', 'veriftoken', 'newuser');
      expect(result.user).toEqual(fakeUser);
      expect(result.verificationToken).toBe('veriftoken');
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await expect(
        AuthService.login({ login: 'noone', password: 'pass' })
      ).rejects.toThrow('Nieprawidłowy login lub hasło');
    });

    it('should throw error if account is Google-only', async () => {
      User.findOne.mockResolvedValueOnce({ password: null });
      
      await expect(
        AuthService.login({ login: 'googleuser', password: 'pass' })
      ).rejects.toThrow('To konto zostało utworzone przez Google. Zaloguj się przez Google.');
    });

    it('should throw error if email not verified', async () => {
      const fakeUser = { password: 'hashed', isVerified: false, email: 'a@a.com' };
      User.findOne.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(true);

      const errorPromise = AuthService.login({ login: 'a@a.com', password: 'pass' });
      await expect(errorPromise).rejects.toThrow('Email nie został zweryfikowany');
      await expect(errorPromise).rejects.toMatchObject({ needsVerification: true, email: 'a@a.com', statusCode: 403 });
    });

    it('should not reveal email of unverified account when password is wrong', async () => {
      const fakeUser = { password: 'hashed', isVerified: false, email: 'secret@a.com' };
      User.findOne.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      const errorPromise = AuthService.login({ login: 'someone', password: 'guess' });
      await expect(errorPromise).rejects.toThrow('Nieprawidłowy login lub hasło');
      await expect(errorPromise).rejects.not.toHaveProperty('email');
    });

    it('should throw error if password does not match', async () => {
      const fakeUser = { password: 'hashed', isVerified: true };
      User.findOne.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        AuthService.login({ login: 'user', password: 'wrong' })
      ).rejects.toThrow('Nieprawidłowy login lub hasło');
    });

    it('should return token and user if login successful', async () => {
      const fakeUser = { id: 1, username: 'user', email: 'a@a.com', password: 'hashed', isVerified: true };
      User.findOne.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValue('jwt-token');

      const result = await AuthService.login({ login: 'a@a.com', password: 'pass' });

      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual(fakeUser);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, username: 'user', email: 'a@a.com' },
        'test-secret',
        { expiresIn: '7d' }
      );
    });
  });

  describe('verifyEmail', () => {
    it('should throw error if token invalid or expired', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await expect(
        AuthService.verifyEmail('invalidtoken')
      ).rejects.toThrow('Token nieprawidłowy lub wygasł');
    });

    it('should verify user and return user', async () => {
      const fakeUser = { update: jest.fn().mockResolvedValueOnce() };
      User.findOne.mockResolvedValueOnce(fakeUser);

      const result = await AuthService.verifyEmail('validtoken');

      expect(fakeUser.update).toHaveBeenCalledWith({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      });
      expect(result).toBe(fakeUser);
    });
  });

  describe('changePassword', () => {
    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValueOnce(null);

      await expect(
        AuthService.changePassword(1, { currentPassword: 'old', newPassword: 'new' })
      ).rejects.toThrow('Użytkownik nie istnieje');
    });

    it('should throw error if account is Google-only', async () => {
      User.findByPk.mockResolvedValueOnce({ password: null });

      await expect(
        AuthService.changePassword(1, { currentPassword: 'old', newPassword: 'new' })
      ).rejects.toThrow('To konto zostało utworzone przez Google. Nie możesz zmienić hasła.');
    });

    it('should throw error if current password incorrect', async () => {
      const fakeUser = { password: 'hashed', update: jest.fn() };
      User.findByPk.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        AuthService.changePassword(1, { currentPassword: 'wrong', newPassword: 'new' })
      ).rejects.toThrow('Obecne hasło jest nieprawidłowe');
    });

    it('should change password and return user', async () => {
      const fakeUser = { password: 'hashed', update: jest.fn().mockResolvedValueOnce() };
      User.findByPk.mockResolvedValueOnce(fakeUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('newhashed');

      const result = await AuthService.changePassword(1, { currentPassword: 'old', newPassword: 'new' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new', expect.any(Number));
      expect(fakeUser.update).toHaveBeenCalledWith({ password: 'newhashed' });
      expect(result).toBe(fakeUser);
    });
  });

  describe('resendVerification', () => {
    it('should generate a new token and send email for unverified account', async () => {
      const fakeUser = { username: 'user', password: 'hashed', isVerified: false, update: jest.fn().mockResolvedValueOnce() };
      User.findOne.mockResolvedValueOnce(fakeUser);
      crypto.randomBytes.mockReturnValueOnce({ toString: () => 'newtoken' });

      const result = await AuthService.resendVerification('user@email.com');

      expect(fakeUser.update).toHaveBeenCalledWith(expect.objectContaining({
        verificationToken: 'newtoken',
        verificationTokenExpires: expect.any(Date)
      }));
      expect(sendVerificationEmail).toHaveBeenCalledWith('user@email.com', 'newtoken', 'user');
      expect(result).toEqual({ success: true });
    });

    it.each([
      ['user not found', null],
      ['account already verified', { password: 'hashed', isVerified: true }],
      ['account is Google-only', { password: null, isVerified: false }],
    ])('should succeed silently and send nothing if %s', async (_, user) => {
      User.findOne.mockResolvedValueOnce(user);

      const result = await AuthService.resendVerification('x@email.com');

      expect(result).toEqual({ success: true });
      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    // Unknown and Google-only emails get the same answer as real ones (no account enumeration).
    it('should succeed silently and send nothing if user not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      const result = await AuthService.forgotPassword('no@email.com');

      expect(result).toEqual({ success: true });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should succeed silently and send nothing if account is Google-only', async () => {
      User.findOne.mockResolvedValueOnce({ password: null });

      const result = await AuthService.forgotPassword('google@email.com');

      expect(result).toEqual({ success: true });
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should generate reset token, update user, and send email', async () => {
      const fakeUser = { username: 'user', password: 'hashed', update: jest.fn().mockResolvedValueOnce() }; 
      User.findOne.mockResolvedValueOnce(fakeUser);
      crypto.randomBytes.mockReturnValueOnce({ toString: () => 'resettoken' });
      sendPasswordResetEmail.mockResolvedValueOnce({ success: true });

      const result = await AuthService.forgotPassword('user@email.com');

      expect(fakeUser.update).toHaveBeenCalledWith(expect.objectContaining({
        resetPasswordToken: 'resettoken',
        resetPasswordExpires: expect.any(Date)
      }));
      expect(sendPasswordResetEmail).toHaveBeenCalledWith('user@email.com', 'resettoken', 'user');
      expect(result).toEqual({ success: true });
    });

    it('should throw error if email sending fails', async () => {

      const fakeUser = { username: 'user', password: 'hashed', update: jest.fn().mockResolvedValueOnce() }; 
      User.findOne.mockResolvedValueOnce(fakeUser);
      crypto.randomBytes.mockReturnValueOnce({ toString: () => 'resettoken' });
      sendPasswordResetEmail.mockResolvedValueOnce({ success: false });

      await expect(
        AuthService.forgotPassword('user@email.com')
      ).rejects.toThrow('Błąd wysyłania emaila');
    });
  });

  describe('resetPassword', () => {
    it('should throw error if token invalid or expired', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await expect(
        AuthService.resetPassword({ token: 'invalid', newPassword: 'new' })
      ).rejects.toThrow('Token nieprawidłowy lub wygasł');
    });

    it('should reset password and return user', async () => {
      const fakeUser = { update: jest.fn().mockResolvedValueOnce() };
      User.findOne.mockResolvedValueOnce(fakeUser);
      bcrypt.hash.mockResolvedValueOnce('newhashed');

      const result = await AuthService.resetPassword({ token: 'valid', newPassword: 'new' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new', expect.any(Number));
      expect(fakeUser.update).toHaveBeenCalledWith({
        password: 'newhashed',
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      expect(result).toBe(fakeUser);
    });
  });

  describe('getMe', () => {
    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValueOnce(null);

      await expect(
        AuthService.getMe(1)
      ).rejects.toThrow('Użytkownik nie znaleziony');
    });

    it('should return user details', async () => {
      const fakeUser = { id: 1, username: 'user', email: 'a@a.com', isVerified: true, googleId: null, createdAt: new Date() };
      User.findByPk.mockResolvedValueOnce(fakeUser);

      const result = await AuthService.getMe(1);

      expect(result).toEqual(fakeUser);
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['id', 'username', 'email', 'isVerified', 'googleId', 'createdAt']
      });
    });
  });
});