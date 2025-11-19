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

const sendPlacementCandidateWelcomeEmail = async (email, name, password, placementOfficerName, collegeName) => {
  const transporter = createTransport();
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`;
  const createPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/create-password?email=${encodeURIComponent(email)}&type=candidate`;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@taleglobal.com';

  const welcomeTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-top: 4px solid #fd7e14;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome to TaleGlobal!</h1>
          <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Career Success</p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 25px;">
          <p style="color: #2c3e50; font-size: 18px; line-height: 1.6; margin: 0;">Dear <strong>${name}</strong>,</p>
        </div>

        <!-- Approval Message -->
        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
            ✅ Registration Approved!
          </h3>
          <p style="color: #155724; margin: 0; font-size: 16px; line-height: 1.6;">
            Congratulations! Your registration has been <strong>approved</strong> by your placement officer <strong>${placementOfficerName}</strong> from <strong>${collegeName}</strong>.
          </p>
        </div>

        <!-- Login Credentials Section -->
        <div style="background-color: #e8f5e8; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
            🔑 Your Login Credentials
          </h3>
          <p style="color: #155724; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
            Your account is ready! Use these credentials to log in to your dashboard:
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #28a745;">
            <div style="margin-bottom: 15px;">
              <label style="color: #666; font-size: 14px; font-weight: 600; display: block; margin-bottom: 5px;">Email Address:</label>
              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; color: #2c3e50; border: 1px solid #dee2e6;">${email}</div>
            </div>
            <div>
              <label style="color: #666; font-size: 14px; font-weight: 600; display: block; margin-bottom: 5px;">Password:</label>
              <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; color: #2c3e50; border: 1px solid #dee2e6; font-weight: bold;">${password}</div>
            </div>
          </div>
        </div>

        <!-- Login Button -->
        <div style="text-align: center; margin: 35px 0;">
          <a href="${loginUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: all 0.3s ease; margin-right: 15px;">🚀 Login to Dashboard</a>
          <a href="${createPasswordUrl}" style="background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(253, 126, 20, 0.3); transition: all 0.3s ease;">🔐 Create New Password</a>
        </div>
        
        <!-- Next Steps -->
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
            📋 What's Next?
          </h3>
          <div style="color: #495057; line-height: 1.8; font-size: 15px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">1.</span>
              <span><strong>Login to your dashboard</strong> using the credentials above</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">2.</span>
              <span><strong>Complete your profile</strong> with personal and academic details</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">3.</span>
              <span><strong>Upload your resume</strong> and showcase your skills</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">4.</span>
              <span><strong>Browse job opportunities</strong> from top companies</span>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">5.</span>
              <span><strong>Apply to jobs</strong> with one click</span>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <span style="color: #fd7e14; font-weight: bold; margin-right: 10px; font-size: 16px;">6.</span>
              <span><strong>Track your applications</strong> and interview progress</span>
            </div>
          </div>
        </div>

        <!-- Security Note -->
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-size: 14px; display: flex; align-items: center;">
            <span style="margin-right: 8px; font-size: 16px;">🔒</span>
            <span><strong>Security Tip:</strong> You can login with the provided password or create a new secure password using the "Create New Password" button above for enhanced security.</span>
          </p>
        </div>

        <!-- Quick Access Info -->
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
          <h4 style="color: #1565c0; margin: 0 0 10px 0; font-size: 16px;">📱 Quick Access</h4>
          <p style="color: #1565c0; margin: 0; font-size: 14px;">
            Bookmark this link for easy access: <strong>${loginUrl}</strong><br>
            Sign in using the <strong>"Candidate"</strong> tab with your email and password.
          </p>
        </div>
        
        <!-- Support -->
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">Need help getting started?</p>
          <p style="color: #6c757d; margin: 0; font-size: 14px;">
            Contact our support team at <a href="mailto:${supportEmail}" style="color: #fd7e14; text-decoration: none; font-weight: 600;">${supportEmail}</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 16px; margin: 0 0 5px 0; font-weight: 600;">Best regards,</p>
          <p style="color: #fd7e14; font-size: 18px; margin: 0 0 5px 0; font-weight: 700;">The TaleGlobal Team</p>
          <p style="color: #6c757d; font-size: 14px; margin: 0; font-style: italic;">🌟 Connecting Talent with Opportunities 🌟</p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"TaleGlobal Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to TaleGlobal - Your Account is Ready!',
    html: welcomeTemplate
  };

  console.log(`Sending welcome email to: ${email}`);
  const result = await transporter.sendMail(mailOptions);
  console.log(`Welcome email sent successfully to: ${email}`);
  return result;
};

const retryFailedEmail = async (email, name, password, placementOfficerName, collegeName, maxRetries = 3) => {
  let attempt = 0;
  let lastError;
  
  while (attempt < maxRetries) {
    try {
      await sendPlacementCandidateWelcomeEmail(email, name, password, placementOfficerName, collegeName);
      return { success: true, attempt: attempt + 1 };
    } catch (error) {
      lastError = error;
      attempt++;
      console.log(`Email retry ${attempt}/${maxRetries} failed for ${email}:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return { success: false, error: lastError, attempts: attempt };
};

module.exports = { 
  sendWelcomeEmail, 
  sendResetEmail, 
  sendPasswordCreationEmail, 
  sendAssessmentNotificationEmail, 
  sendOTPEmail, 
  sendPlacementCandidateWelcomeEmail,
  retryFailedEmail
};
