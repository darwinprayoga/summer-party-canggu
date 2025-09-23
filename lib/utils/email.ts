import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(phone: string, code: string): Promise<void> {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.FROM_EMAIL, // In real app, this would be SMS service
    subject: 'Summer Party Canggu - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">Summer Party Canggu</h2>
        <p>Your OTP code for phone number <strong>${phone}</strong> is:</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0891b2; font-size: 32px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendRegistrationNotificationEmail(
  type: 'staff' | 'admin',
  userData: {
    fullName: string;
    email?: string;
    instagram: string;
    phone?: string;
  }
): Promise<void> {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.SUPER_ADMIN_EMAIL,
    subject: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Registration - Summer Party Canggu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">New ${type.charAt(0).toUpperCase() + type.slice(1)} Registration</h2>
        <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #0891b2;">
          <p><strong>Name:</strong> ${userData.fullName}</p>
          <p><strong>Instagram:</strong> @${userData.instagram}</p>
          ${userData.email ? `<p><strong>Email:</strong> ${userData.email}</p>` : ''}
          ${userData.phone ? `<p><strong>Phone:</strong> ${userData.phone}</p>` : ''}
        </div>
        <p>Please review and approve this registration in the admin dashboard.</p>
        <p><a href="${process.env.APP_URL}/admin" style="color: #0891b2;">Go to Admin Dashboard</a></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}