# ⚠️ Port 25 Blocked - Email Sending Solution

## Issue
DigitalOcean blocks port 25 by default to prevent spam. This affects outbound email delivery.

## Solutions

### Option 1: Request Port 25 Unblock (Recommended)
1. Go to DigitalOcean support
2. Request port 25 unblock for your droplet
3. Usually approved within 24-48 hours

### Option 2: Use Email Relay Service (Immediate)
Configure Postfix to use an SMTP relay like:
- SendGrid (100 emails/day free)
- Mailgun (5,000 emails/month free)
- Amazon SES ($0.10 per 1,000 emails)

### Option 3: Use Alternative Ports
Your email server can still:
- **Receive** emails (port 25 inbound works)
- **Send** between your own accounts
- **Access** via IMAP/SMTP clients

## Current Status
✅ Email receiving works
✅ Internal email delivery works
✅ IMAP/SMTP access works
❌ Sending to external domains blocked

## Quick Fix for Testing
For now, you can:
1. Set up email clients to use your accounts
2. Use platform's built-in email features
3. Send emails between your not-a-label.art accounts

## To Request Port 25 Unblock:
1. Log into DigitalOcean
2. Go to Support → New Ticket
3. Subject: "Request to unblock port 25"
4. Message: "I need port 25 unblocked for legitimate email service on droplet 159.89.247.208. This is for a music platform's transactional emails, not bulk mail."