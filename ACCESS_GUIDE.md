# Not a Label - Platform Access Guide

## 🌐 Official Platform URL

**https://not-a-label.art**

> **Note**: DNS propagation is currently in progress. This process typically takes 24-48 hours to complete globally.

## 📍 Current Access Methods

### While DNS Propagates
You can access the platform immediately using:
- **Direct IP**: http://159.89.247.208
- **Domain** (once propagated): https://not-a-label.art

### Features Available Now
- ✅ Full platform functionality
- ✅ AI-powered marketing tools
- ✅ User registration and login
- ✅ Marketing dashboard
- ✅ API access

### Coming Soon (After DNS Propagation)
- 🔒 HTTPS secure connection
- 🌐 Access via not-a-label.art
- 📱 Enhanced PWA features
- 🔄 Automatic HTTP-to-HTTPS redirect

## 🚀 Quick Start

### 1. Access the Platform
Visit: **http://159.89.247.208** (temporary) or **https://not-a-label.art** (once DNS propagates)

### 2. Create an Account
- Click "Register" 
- Enter your email, password, name, and artist type
- Start exploring the platform

### 3. Try Demo Account
```
Email: demo@not-a-label.art
Password: Demo123
```

## 🛠️ Platform Sections

### Main Dashboard
- **URL**: https://not-a-label.art/dashboard
- Overview of all your activities
- Quick access to all features

### Marketing Hub
- **URL**: https://not-a-label.art/dashboard/marketing
- AI-powered content generation
- Post scheduling and management
- Multi-platform support

### API Documentation
- **URL**: https://not-a-label.art/docs
- Complete API reference
- Interactive examples
- Authentication guide

## 🔐 API Access

### Base URL
```
https://not-a-label.art/api
```

### Authentication
All API requests require a JWT token:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example: Generate Marketing Content
```bash
curl -X POST https://not-a-label.art/api/marketing/templates/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "social_media",
    "context": {
      "artistName": "Your Name",
      "genre": "Your Genre",
      "announcement": "New release!"
    },
    "tone": "excited"
  }'
```

## 📱 Mobile Access

The platform is a Progressive Web App (PWA):
1. Visit https://not-a-label.art on your mobile device
2. Click "Add to Home Screen" in your browser menu
3. Access the app like any native application

## 🔍 DNS Propagation Status

To check if DNS has propagated in your area:
```bash
# Check DNS resolution
dig not-a-label.art +short

# Expected result (once propagated):
159.89.247.208
```

## 💡 Tips

1. **Bookmark the Platform**: Save https://not-a-label.art for easy access
2. **Enable Notifications**: Get updates on your marketing posts
3. **Use Strong Passwords**: Protect your account and content
4. **Regular Backups**: Export your data regularly

## 🆘 Troubleshooting

### Can't Access via Domain?
- DNS propagation may still be in progress (24-48 hours)
- Use http://159.89.247.208 as temporary access

### Forgot Password?
- Password reset feature coming soon
- Contact support for assistance

### API Not Working?
- Ensure you're using the correct Authorization header
- Check that your token hasn't expired
- Verify the API endpoint URL

## 📞 Support

For platform support or questions:
- **Documentation**: https://not-a-label.art/docs
- **Status Page**: https://not-a-label.art/docs/status.html

## 🎉 Welcome to Not a Label!

We're excited to have you join our community of independent musicians. The platform is designed to empower you with AI-powered tools to grow your career and connect with fans.

Remember: Always use **not-a-label.art** as your primary access point!