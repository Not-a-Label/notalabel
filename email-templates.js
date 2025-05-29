// Email Templates for Not a Label
const emailTemplates = {
  // Welcome Email
  welcome: {
    subject: 'Welcome to Not a Label - Your Music Journey Begins! 🎵',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Not a Label</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 32px; margin: 0;">🎵 Not a Label</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">Welcome to Your Music Community</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">Hey ${data.name}! 👋</h2>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Welcome to Not a Label - the platform built by artists, for artists. We're thrilled to have you join our community of independent musicians who are taking control of their careers.
                            </p>
                            
                            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin: 30px 0;">
                                <h3 style="color: #333333; font-size: 18px; margin: 0 0 20px 0;">🚀 Get Started:</h3>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="width: 30px; vertical-align: top;">✅</td>
                                                    <td style="color: #666666; font-size: 15px;">Complete your artist profile</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="width: 30px; vertical-align: top;">📊</td>
                                                    <td style="color: #666666; font-size: 15px;">Set up your analytics dashboard</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="width: 30px; vertical-align: top;">🎸</td>
                                                    <td style="color: #666666; font-size: 15px;">Find your first collaborator</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <table cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="width: 30px; vertical-align: top;">💰</td>
                                                    <td style="color: #666666; font-size: 15px;">Connect your payment methods</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                            </div>
                            
                            <div style="border-top: 1px solid #e9ecef; margin: 40px 0; padding-top: 30px;">
                                <h3 style="color: #333333; font-size: 18px; margin: 0 0 20px 0;">🎯 Platform Features:</h3>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px;">
                                    <tr>
                                        <td width="50%" style="padding-right: 15px;">
                                            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; text-align: center;">
                                                <div style="font-size: 32px; margin-bottom: 10px;">🤖</div>
                                                <h4 style="color: #333333; margin: 0 0 5px 0;">AI Assistant</h4>
                                                <p style="color: #666666; font-size: 14px; margin: 0;">Get personalized career guidance</p>
                                            </div>
                                        </td>
                                        <td width="50%" style="padding-left: 15px;">
                                            <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px; text-align: center;">
                                                <div style="font-size: 32px; margin-bottom: 10px;">📈</div>
                                                <h4 style="color: #333333; margin: 0 0 5px 0;">Analytics</h4>
                                                <p style="color: #666666; font-size: 14px; margin: 0;">Track your growth in real-time</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                Need help getting started? Check out our <a href="${data.helpUrl}" style="color: #667eea;">help center</a> or reply to this email - we're here to support your journey!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                Follow us for updates and tips:
                            </p>
                            <div style="margin: 20px 0;">
                                <a href="#" style="text-decoration: none; margin: 0 10px;">📘</a>
                                <a href="#" style="text-decoration: none; margin: 0 10px;">🐦</a>
                                <a href="#" style="text-decoration: none; margin: 0 10px;">📷</a>
                                <a href="#" style="text-decoration: none; margin: 0 10px;">🎵</a>
                            </div>
                            <p style="color: #999999; font-size: 12px; margin: 20px 0 0 0;">
                                © 2025 Not a Label. All rights reserved.<br>
                                <a href="${data.unsubscribeUrl}" style="color: #999999;">Unsubscribe</a> | 
                                <a href="${data.preferencesUrl}" style="color: #999999;">Email Preferences</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    text: (data) => `
Welcome to Not a Label, ${data.name}!

We're thrilled to have you join our community of independent musicians who are taking control of their careers.

GET STARTED:
✅ Complete your artist profile
📊 Set up your analytics dashboard
🎸 Find your first collaborator
💰 Connect your payment methods

Go to Dashboard: ${data.dashboardUrl}

PLATFORM FEATURES:
• AI Assistant - Get personalized career guidance
• Analytics - Track your growth in real-time
• Collaboration Matching - Find perfect partners
• Marketing Tools - Grow your audience

Need help? Visit ${data.helpUrl} or reply to this email.

Follow us:
Facebook | Twitter | Instagram | TikTok

© 2025 Not a Label. All rights reserved.
Unsubscribe: ${data.unsubscribeUrl}
    `
  },

  // Password Reset Email
  passwordReset: {
    subject: 'Reset Your Not a Label Password 🔐',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
                            <h1 style="color: #333333; font-size: 24px; margin: 0;">Password Reset Request</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 40px 40px;">
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi ${data.name},
                            </p>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                            </div>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                <p style="color: #666666; font-size: 14px; margin: 0;">
                                    <strong>⏰ This link expires in 1 hour</strong><br><br>
                                    If you didn't request this, you can safely ignore this email. Your password won't be changed.
                                </p>
                            </div>
                            
                            <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                Or copy and paste this link into your browser:<br>
                                <code style="background-color: #f8f9fa; padding: 10px; display: block; margin-top: 10px; word-break: break-all; border-radius: 4px;">${data.resetUrl}</code>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                This is an automated message from Not a Label.<br>
                                Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
    text: (data) => `
Password Reset Request

Hi ${data.name},

We received a request to reset your password. Visit the link below to create a new password:

${data.resetUrl}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email. Your password won't be changed.

This is an automated message from Not a Label.
Please do not reply to this email.
    `
  },

  // Collaboration Invitation
  collaborationInvite: {
    subject: '🎸 You have a new collaboration invitation!',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">New Collaboration Opportunity! 🎸</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Hi ${data.recipientName},
                            </p>
                            
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">
                                    ${data.senderName} wants to collaborate with you!
                                </h2>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <strong style="color: #666666;">Match Score:</strong>
                                            <span style="color: #667eea; font-weight: 600;">${data.matchScore}%</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <strong style="color: #666666;">Genres:</strong>
                                            <span style="color: #333333;">${data.genres.join(', ')}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <strong style="color: #666666;">Project Type:</strong>
                                            <span style="color: #333333;">${data.projectType}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">Message from ${data.senderName}:</h3>
                                <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">
                                    "${data.message}"
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td width="48%" style="text-align: right; padding-right: 10px;">
                                            <a href="${data.acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept</a>
                                        </td>
                                        <td width="48%" style="text-align: left; padding-left: 10px;">
                                            <a href="${data.viewUrl}" style="display: inline-block; background: #e9ecef; color: #495057; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Profile</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="color: #999999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                                This invitation expires in 7 days
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                Manage your collaboration preferences in your <a href="${data.settingsUrl}" style="color: #667eea;">account settings</a>
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2025 Not a Label. Connecting artists worldwide.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  },

  // Monthly Summary
  monthlySummary: {
    subject: '📊 Your Monthly Not a Label Summary',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0;">Your ${data.month} Summary 📊</h1>
                            <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.9;">Here's how you performed this month</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <!-- Key Metrics -->
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">📈 Key Metrics</h2>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td width="50%" style="padding: 15px; text-align: center;">
                                            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px;">
                                                <div style="font-size: 32px; font-weight: 700; color: #667eea;">${data.totalStreams}</div>
                                                <div style="color: #666666; font-size: 14px;">Total Streams</div>
                                                <div style="color: #28a745; font-size: 12px; margin-top: 5px;">↑ ${data.streamsGrowth}%</div>
                                            </div>
                                        </td>
                                        <td width="50%" style="padding: 15px; text-align: center;">
                                            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px;">
                                                <div style="font-size: 32px; font-weight: 700; color: #28a745;">$${data.revenue}</div>
                                                <div style="color: #666666; font-size: 14px;">Revenue</div>
                                                <div style="color: #28a745; font-size: 12px; margin-top: 5px;">↑ ${data.revenueGrowth}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" style="padding: 15px; text-align: center;">
                                            <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px;">
                                                <div style="font-size: 32px; font-weight: 700; color: #7b1fa2;">${data.newFollowers}</div>
                                                <div style="color: #666666; font-size: 14px;">New Followers</div>
                                                <div style="color: #28a745; font-size: 12px; margin-top: 5px;">↑ ${data.followersGrowth}%</div>
                                            </div>
                                        </td>
                                        <td width="50%" style="padding: 15px; text-align: center;">
                                            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px;">
                                                <div style="font-size: 32px; font-weight: 700; color: #856404;">${data.collaborations}</div>
                                                <div style="color: #666666; font-size: 14px;">Collaborations</div>
                                                <div style="color: #666666; font-size: 12px; margin-top: 5px;">This month</div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Top Performing Content -->
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">🎵 Top Performing Content</h2>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px;">
                                    ${data.topSongs.map((song, index) => `
                                    <tr>
                                        <td style="padding: 15px 20px; border-bottom: ${index < data.topSongs.length - 1 ? '1px solid #e9ecef' : 'none'};">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td width="40" style="font-size: 24px; font-weight: 700; color: #667eea;">${index + 1}</td>
                                                    <td>
                                                        <div style="font-weight: 600; color: #333333;">${song.title}</div>
                                                        <div style="color: #666666; font-size: 14px;">${song.streams} streams</div>
                                                    </td>
                                                    <td style="text-align: right; color: #28a745; font-size: 14px;">↑ ${song.growth}%</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    `).join('')}
                                </table>
                            </div>
                            
                            <!-- AI Insights -->
                            <div style="background-color: #e7f3ff; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                                <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">🤖 AI Insights</h3>
                                <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                                    ${data.aiInsight}
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${data.fullReportUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Full Report</a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                Keep up the great work! 🎵
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2025 Not a Label | <a href="${data.preferencesUrl}" style="color: #999999;">Email Preferences</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  },

  // Revenue Payment Notification
  paymentNotification: {
    subject: '💰 Payment Processed - Not a Label',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #28a745; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <div style="font-size: 48px; margin-bottom: 10px;">💰</div>
                            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Payment Processed!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Hi ${data.name},
                            </p>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Great news! Your payment has been successfully processed.
                            </p>
                            
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                                <h2 style="color: #333333; font-size: 20px; margin: 0 0 20px 0;">Payment Details</h2>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                            <strong style="color: #666666;">Amount:</strong>
                                        </td>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                                            <span style="font-size: 24px; font-weight: 700; color: #28a745;">$${data.amount}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                            <strong style="color: #666666;">Period:</strong>
                                        </td>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                                            ${data.period}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                            <strong style="color: #666666;">Payment Method:</strong>
                                        </td>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                                            ${data.paymentMethod}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0;">
                                            <strong style="color: #666666;">Transaction ID:</strong>
                                        </td>
                                        <td style="padding: 10px 0; text-align: right;">
                                            <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${data.transactionId}</code>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">Revenue Breakdown</h3>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 15px 20px;">
                                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td style="color: #666666;">Streaming Revenue</td>
                                                    <td style="text-align: right; color: #333333;">$${data.streamingRevenue}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #666666; padding-top: 10px;">Digital Sales</td>
                                                    <td style="text-align: right; color: #333333; padding-top: 10px;">$${data.salesRevenue}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #666666; padding-top: 10px;">Merchandise</td>
                                                    <td style="text-align: right; color: #333333; padding-top: 10px;">$${data.merchRevenue}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #666666; padding-top: 10px; border-top: 1px solid #e9ecef; padding-top: 15px;">
                                                        <strong>Total</strong>
                                                    </td>
                                                    <td style="text-align: right; color: #333333; padding-top: 10px; border-top: 1px solid #e9ecef; padding-top: 15px;">
                                                        <strong>$${data.amount}</strong>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${data.statementUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Statement</a>
                            </div>
                            
                            <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                Funds will be available in your account within 2-3 business days.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                Questions about your payment? <a href="${data.supportUrl}" style="color: #667eea;">Contact Support</a>
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                © 2025 Not a Label. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
  }
};

// Email sender function
async function sendEmail(to, templateName, data) {
  const template = emailTemplates[templateName];
  
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  const emailData = {
    to,
    subject: template.subject,
    html: template.html(data),
    text: template.text ? template.text(data) : stripHtml(template.html(data))
  };
  
  console.log('Sending email:', {
    to: emailData.to,
    subject: emailData.subject,
    template: templateName
  });
  
  // Return mock response
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    template: templateName
  };
}

// Helper function to strip HTML (basic implementation)
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  emailTemplates,
  sendEmail
};