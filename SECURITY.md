# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Not a Label seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Reporting Process

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security@not-a-label.art with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

## Security Best Practices

### For Users

1. **Keep credentials secure**
   - Never share your JWT tokens
   - Use strong, unique passwords
   - Enable 2FA when available

2. **OAuth tokens**
   - Regularly review connected apps
   - Revoke access for unused integrations
   - Report suspicious activity

3. **API usage**
   - Keep API keys confidential
   - Use HTTPS for all requests
   - Implement rate limiting

### For Contributors

1. **Code practices**
   - Never commit secrets or credentials
   - Use environment variables
   - Validate all user inputs
   - Sanitize database queries

2. **Dependencies**
   - Keep dependencies updated
   - Review security advisories
   - Use `npm audit` regularly

3. **Authentication**
   - Use secure password hashing (bcrypt)
   - Implement proper session management
   - Follow OAuth 2.0 best practices

## Security Features

### Current Implementation

- ✅ JWT authentication with expiration
- ✅ Bcrypt password hashing
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ SSL/TLS encryption in production
- ✅ Secure OAuth token storage
- ✅ Environment variable management

### Planned Improvements

- [ ] Two-factor authentication
- [ ] API key rotation
- [ ] Advanced threat detection
- [ ] Security audit logging
- [ ] Penetration testing

## Disclosure Policy

We follow responsible disclosure:

1. Security issues are fixed before disclosure
2. Credits given to reporters (if desired)
3. Public disclosure after patch release
4. CVE assignment for significant vulnerabilities

## Contact

- Security Team: security@not-a-label.art
- PGP Key: [Available on request]

Thank you for helping keep Not a Label secure! 🔒