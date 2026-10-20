const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendVerificationEmail = async (email, token, username) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: `"Bibliografia App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Potwierdź swój email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #6366f1; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Witaj ${username}! 👋</h1>
              <p>Dziękujemy za rejestrację. Kliknij przycisk poniżej, aby potwierdzić swój adres email:</p>
              
              <a href="${verificationLink}" class="button">Potwierdź Email</a>
              
              <p>Lub skopiuj i wklej ten link do przeglądarki:</p>
              <p style="color: #6366f1;">${verificationLink}</p>
              
              <div class="footer">
                <p>Link wygasa za 24 godziny.</p>
                <p>Jeśli to nie Ty, zignoruj ten email.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
    
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, token, username) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: `"Bibliografia App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset hasła',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #ef4444; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Reset hasła 🔒</h1>
              <p>Cześć ${username},</p>
              <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
              
              <a href="${resetLink}" class="button">Zresetuj hasło</a>
              
              <p>Lub skopiuj i wklej ten link do przeglądarki:</p>
              <p style="color: #ef4444;">${resetLink}</p>
              
              <div class="footer">
                <p>Link wygasa za 1 godzinę.</p>
                <p>Jeśli nie prosiłeś o reset hasła, zignoruj ten email.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return { success: true };
    
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};