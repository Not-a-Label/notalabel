// Email Service Integration for Not a Label
// Supports multiple email service providers for newsletters and marketing

const nodemailer = require('nodemailer');
const axios = require('axios');

class EmailServiceManager {
  constructor() {
    this.providers = {
      smtp: null,
      sendgrid: null,
      mailchimp: null,
      mailgun: null
    };
    this.initializeProviders();
  }

  initializeProviders() {
    // SMTP Configuration (generic)
    if (process.env.SMTP_HOST) {
      this.providers.smtp = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }

    // SendGrid API
    if (process.env.SENDGRID_API_KEY) {
      this.providers.sendgrid = {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL
      };
    }

    // Mailchimp API
    if (process.env.MAILCHIMP_API_KEY) {
      this.providers.mailchimp = {
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER,
        listId: process.env.MAILCHIMP_LIST_ID
      };
    }

    // Mailgun API
    if (process.env.MAILGUN_API_KEY) {
      this.providers.mailgun = {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      };
    }
  }

  // Send single email via SMTP
  async sendEmailSMTP(to, subject, content, isHtml = true) {
    try {
      if (!this.providers.smtp) {
        throw new Error('SMTP not configured');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: to,
        subject: subject,
        [isHtml ? 'html' : 'text']: content
      };

      const result = await this.providers.smtp.sendMail(mailOptions);
      
      return {
        success: true,
        provider: 'smtp',
        messageId: result.messageId
      };
    } catch (error) {
      console.error('SMTP email error:', error);
      return {
        success: false,
        provider: 'smtp',
        error: error.message
      };
    }
  }

  // Send email via SendGrid
  async sendEmailSendGrid(to, subject, content, isHtml = true) {
    try {
      if (!this.providers.sendgrid) {
        throw new Error('SendGrid not configured');
      }

      const { apiKey, fromEmail } = this.providers.sendgrid;

      const emailData = {
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: fromEmail },
        content: [{
          type: isHtml ? 'text/html' : 'text/plain',
          value: content
        }]
      };

      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        emailData,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        provider: 'sendgrid',
        messageId: response.headers['x-message-id']
      };
    } catch (error) {
      console.error('SendGrid email error:', error);
      return {
        success: false,
        provider: 'sendgrid',
        error: error.message
      };
    }
  }

  // Send email via Mailgun
  async sendEmailMailgun(to, subject, content, isHtml = true) {
    try {
      if (!this.providers.mailgun) {
        throw new Error('Mailgun not configured');
      }

      const { apiKey, domain } = this.providers.mailgun;

      const formData = new FormData();
      formData.append('from', `Not a Label <noreply@${domain}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append(isHtml ? 'html' : 'text', content);

      const response = await axios.post(
        `https://api.mailgun.net/v3/${domain}/messages`,
        formData,
        {
          auth: {
            username: 'api',
            password: apiKey
          }
        }
      );

      return {
        success: true,
        provider: 'mailgun',
        messageId: response.data.id
      };
    } catch (error) {
      console.error('Mailgun email error:', error);
      return {
        success: false,
        provider: 'mailgun',
        error: error.message
      };
    }
  }

  // Add subscriber to Mailchimp list
  async addSubscriberMailchimp(email, firstName = '', lastName = '', tags = []) {
    try {
      if (!this.providers.mailchimp) {
        throw new Error('Mailchimp not configured');
      }

      const { apiKey, server, listId } = this.providers.mailchimp;

      const subscriberData = {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        },
        tags: tags
      };

      const response = await axios.post(
        `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
        subscriberData,
        {
          auth: {
            username: 'anystring',
            password: apiKey
          }
        }
      );

      return {
        success: true,
        provider: 'mailchimp',
        subscriberId: response.data.id
      };
    } catch (error) {
      console.error('Mailchimp subscription error:', error);
      return {
        success: false,
        provider: 'mailchimp',
        error: error.message
      };
    }
  }

  // Send newsletter campaign via Mailchimp
  async sendNewsletterMailchimp(subject, content, fromName = 'Not a Label') {
    try {
      if (!this.providers.mailchimp) {
        throw new Error('Mailchimp not configured');
      }

      const { apiKey, server, listId } = this.providers.mailchimp;

      // Create campaign
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: listId
        },
        settings: {
          subject_line: subject,
          from_name: fromName,
          reply_to: process.env.MAILCHIMP_REPLY_EMAIL || 'noreply@not-a-label.art'
        }
      };

      const campaignResponse = await axios.post(
        `https://${server}.api.mailchimp.com/3.0/campaigns`,
        campaignData,
        {
          auth: {
            username: 'anystring',
            password: apiKey
          }
        }
      );

      const campaignId = campaignResponse.data.id;

      // Set campaign content
      const contentData = {
        html: content
      };

      await axios.put(
        `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`,
        contentData,
        {
          auth: {
            username: 'anystring',
            password: apiKey
          }
        }
      );

      // Send campaign
      const sendResponse = await axios.post(
        `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`,
        {},
        {
          auth: {
            username: 'anystring',
            password: apiKey
          }
        }
      );

      return {
        success: true,
        provider: 'mailchimp',
        campaignId: campaignId
      };
    } catch (error) {
      console.error('Mailchimp newsletter error:', error);
      return {
        success: false,
        provider: 'mailchimp',
        error: error.message
      };
    }
  }

  // Universal email sending (tries multiple providers)
  async sendEmail(to, subject, content, isHtml = true, preferredProvider = null) {
    const providers = preferredProvider ? [preferredProvider] : ['sendgrid', 'mailgun', 'smtp'];
    
    for (const provider of providers) {
      try {
        let result;
        
        switch (provider) {
          case 'sendgrid':
            result = await this.sendEmailSendGrid(to, subject, content, isHtml);
            break;
          case 'mailgun':
            result = await this.sendEmailMailgun(to, subject, content, isHtml);
            break;
          case 'smtp':
            result = await this.sendEmailSMTP(to, subject, content, isHtml);
            break;
          default:
            continue;
        }

        if (result.success) {
          return result;
        }
      } catch (error) {
        console.error(`Failed to send via ${provider}:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All email providers failed'
    };
  }

  // Email templates for musicians
  getEmailTemplates() {
    return {
      welcome: {
        subject: 'Welcome to Not a Label! 🎵',
        html: `
          <h1>Welcome to Not a Label!</h1>
          <p>Hi {{name}},</p>
          <p>Thanks for joining our community of independent musicians. We're excited to help you grow your career!</p>
          <h2>Getting Started:</h2>
          <ul>
            <li>📝 Generate marketing content with AI</li>
            <li>📅 Schedule posts across platforms</li>
            <li>📊 Track your analytics</li>
            <li>🤝 Connect with other artists</li>
          </ul>
          <p>Ready to get started? <a href="{{dashboard_url}}">Visit your dashboard</a></p>
          <p>Best regards,<br>The Not a Label Team</p>
        `
      },
      
      newsletter: {
        subject: 'Music Industry Insights - {{month}} {{year}}',
        html: `
          <h1>Not a Label Newsletter</h1>
          <p>Hi {{name}},</p>
          <p>Here's what's happening in the independent music world:</p>
          {{content}}
          <hr>
          <p>Want to unsubscribe? <a href="{{unsubscribe_url}}">Click here</a></p>
        `
      },

      postReminder: {
        subject: 'Your scheduled post is ready! 📢',
        html: `
          <h1>Post Reminder</h1>
          <p>Hi {{name}},</p>
          <p>Your post "{{post_title}}" is scheduled to go live on {{platform}} at {{time}}.</p>
          <p><a href="{{dashboard_url}}">View in dashboard</a></p>
        `
      },

      weeklyReport: {
        subject: 'Your Weekly Music Analytics 📊',
        html: `
          <h1>Weekly Report</h1>
          <p>Hi {{name}},</p>
          <p>Here's how your content performed this week:</p>
          <ul>
            <li>📝 Posts created: {{posts_created}}</li>
            <li>📊 Total reach: {{total_reach}}</li>
            <li>❤️ Engagement: {{engagement}}</li>
          </ul>
          <p><a href="{{analytics_url}}">View full analytics</a></p>
        `
      }
    };
  }

  // Send template email with variable substitution
  async sendTemplateEmail(to, templateName, variables = {}) {
    const templates = this.getEmailTemplates();
    const template = templates[templateName];
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let subject = template.subject;
    let content = template.html;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      content = content.replace(regex, value);
    }

    return await this.sendEmail(to, subject, content, true);
  }
}

module.exports = EmailServiceManager;