const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendWelcomeEmail = async (email, name, userType) => {
  const transporter = createTransport();
  const userTypeParam = encodeURIComponent(userType || 'candidate');
  const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?email=${encodeURIComponent(email)}&type=${userTypeParam}`;
  
  const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to TaleGlobal!</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up with TaleGlobal! We're excited to have you join our community of ${userType === 'employer' ? 'employers' : userType === 'placement' ? 'placement officers' : 'job seekers'}.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          To complete your registration, please create your password by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${createPasswordUrl}" style="background-color: #fd7e14; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Create Your Password</a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            ${userType === 'employer' ? `
              <li>Create your password</li>
              <li>Post unlimited job openings</li>
              <li>Access to qualified candidates</li>
              <li>Advanced application management</li>
            ` : userType === 'placement' ? `
              <li>Create your password</li>
              <li>Upload student data files</li>
              <li>Manage student registrations</li>
              <li>Track placement activities</li>
            ` : `
              <li>Create your password</li>
              <li>Complete your profile</li>
              <li>Browse thousands of job opportunities</li>
              <li>Apply to jobs with one click</li>
            `}
          </ul>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to TaleGlobal - Create Your Password',
    html: welcomeTemplate
  };

  await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, resetToken, userType) => {
  const transporter = createTransport();
  const basePath = userType === 'employer' ? '/employer' : userType === 'placement' ? '/placement' : '/candidate';
  const resetUrl = `${process.env.FRONTEND_URL}${basePath}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordCreationEmail = async (email, name) => {
  const transporter = createTransport();
  const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  
  const welcomeTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to TaleGlobal!</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up with TaleGlobal! We're excited to have you join our community of job seekers.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          To complete your registration, please create your password by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${createPasswordUrl}" style="background-color: #fd7e14; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Create Your Password</a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Create your password</li>
            <li>Complete your profile</li>
            <li>Browse thousands of job opportunities</li>
            <li>Apply to jobs with one click</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to TaleGlobal - Create Your Password',
    html: welcomeTemplate
  };

  await transporter.sendMail(mailOptions);
};

const formatAssessmentDate = (date) => {
  const parsed = new Date(date);
  return parsed.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const sendAssessmentNotificationEmail = async ({ email, name, jobTitle, startDate, type }) => {
  const transporter = createTransport();
  const formattedDate = formatAssessmentDate(startDate);
  const subject = type === 'reminder'
    ? `Reminder: ${jobTitle} assessment starts soon`
    : `${jobTitle} assessment is now open`;
  const intro = type === 'reminder'
    ? `Your assessment for <strong>${jobTitle}</strong> begins in one hour.`
    : `Your assessment for <strong>${jobTitle}</strong> is now open.`;
  const actionText = type === 'reminder'
    ? 'Review the instructions and ensure you are ready to begin on time.'
    : 'Log in now to start the assessment without delay.';
  const buttonLabel = type === 'reminder' ? 'Review Assessment Details' : 'Start Assessment';
  const assessmentUrl = `${process.env.FRONTEND_URL}/candidate/start-tech-assessment`;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@taleglobal.com';

  const template = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f7f7f9;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);">
        <h2 style="margin-top: 0; color: #1e293b; font-size: 22px;">Hello ${name || 'Candidate'},</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">${intro}</p>
        <div style="background-color: #0f172a; color: #f8fafc; padding: 16px 20px; border-radius: 10px; margin: 24px 0;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6;"><strong>Assessment:</strong> ${jobTitle}</p>
          <p style="margin: 8px 0 0; font-size: 15px; line-height: 1.6;"><strong>Start Time:</strong> ${formattedDate}</p>
        </div>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">${actionText}</p>
        <div style="text-align: center; margin: 32px 0 12px;">
          <a href="${assessmentUrl}" style="background: #2563eb; color: #ffffff; padding: 14px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${buttonLabel}</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; text-align: center;">Need help? Contact support at <a href="mailto:${supportEmail}" style="color: #2563eb;">${supportEmail}</a>.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: template
  };

  await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransport();
  
  console.log('=== SENDING OTP EMAIL ===');
  console.log('Recipient Email:', email);
  console.log('OTP Code:', otp);
  console.log('Recipient Name:', name);
  
  const otpTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset OTP</h1>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Dear ${name || 'User'},</p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You have requested to reset your password. Please use the following OTP to complete the process:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #fff5f2; border: 2px solid #ff6b35; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          Best regards,<br>
          The TaleGlobal Team
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - TaleGlobal',
    html: otpTemplate
  };

  console.log('Mail Options:', JSON.stringify(mailOptions, null, 2));
  const result = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully:', result);
  return result;
};

module.exports = { sendWelcomeEmail, sendResetEmail, sendPasswordCreationEmail, sendAssessmentNotificationEmail, sendOTPEmail };
