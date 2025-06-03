# Complete Email DNS Setup for Not a Label

## 🔧 Additional DNS Records Needed

Add these records in DigitalOcean DNS:

### 1. Mail Server A Record
```
Type: A
Hostname: mail
Value: 159.89.247.208
TTL: 300
```

### 2. SPF Record (Sender Policy Framework)
```
Type: TXT
Hostname: @
Value: "v=spf1 a mx ip4:159.89.247.208 ~all"
TTL: 300
```

### 3. DKIM Record (after mail server setup)
```
Type: TXT
Hostname: default._domainkey
Value: [Will be generated during mail server setup]
TTL: 300
```

### 4. DMARC Record
```
Type: TXT
Hostname: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:postmaster@not-a-label.art; ruf=mailto:postmaster@not-a-label.art; fo=1"
TTL: 300
```

### 5. Autodiscover (for email clients)
```
Type: CNAME
Hostname: autodiscover
Value: mail.not-a-label.art
TTL: 300
```

### 6. Additional Mail Records
```
Type: A
Hostname: smtp
Value: 159.89.247.208
TTL: 300

Type: A
Hostname: imap
Value: 159.89.247.208
TTL: 300

Type: A
Hostname: pop
Value: 159.89.247.208
TTL: 300
```

## 📮 Email Features for Not a Label

### Artist Email Addresses
- Every artist gets: `artistname@not-a-label.art`
- Custom aliases: `music@artistname.not-a-label.art`
- Professional email for business communications

### Platform Email Features
1. **Automated Emails**
   - Welcome emails for new artists
   - Release notifications to fans
   - Playlist submission confirmations
   - Payment notifications

2. **Marketing Emails**
   - Newsletter system
   - Fan engagement campaigns
   - New release announcements
   - Event invitations

3. **Transactional Emails**
   - Password resets
   - Account verifications
   - Order confirmations
   - Collaboration invites

## 🚀 Email Server Setup Script

```bash
#!/bin/bash
# Save as: setup-email-server.sh

# Install mail server components
sudo apt update
sudo apt install -y postfix dovecot-core dovecot-imapd dovecot-lmtpd \
    postfix-mysql dovecot-mysql mysql-server \
    opendkim opendkim-tools \
    spamassassin spamc \
    certbot

# Create mail user
sudo groupadd -g 5000 vmail
sudo useradd -g vmail -u 5000 vmail -d /var/mail

# Create mail directories
sudo mkdir -p /var/mail/vhosts/not-a-label.art
sudo chown -R vmail:vmail /var/mail

# Generate DKIM keys
sudo mkdir -p /etc/opendkim/keys/not-a-label.art
cd /etc/opendkim/keys/not-a-label.art
sudo opendkim-genkey -s default -d not-a-label.art
sudo chown opendkim:opendkim default.private

# Output DKIM record for DNS
echo "Add this DKIM record to DNS:"
sudo cat default.txt
```

## 🔐 Security Configuration

### Postfix Main Configuration
```conf
# /etc/postfix/main.cf
myhostname = mail.not-a-label.art
mydomain = not-a-label.art
myorigin = $mydomain
mydestination = localhost
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
inet_protocols = all

# Virtual domains
virtual_transport = lmtp:unix:private/dovecot-lmtp
virtual_mailbox_domains = mysql:/etc/postfix/mysql-virtual-mailbox-domains.cf
virtual_mailbox_maps = mysql:/etc/postfix/mysql-virtual-mailbox-maps.cf
virtual_alias_maps = mysql:/etc/postfix/mysql-virtual-alias-maps.cf

# TLS parameters
smtpd_tls_cert_file=/etc/letsencrypt/live/mail.not-a-label.art/fullchain.pem
smtpd_tls_key_file=/etc/letsencrypt/live/mail.not-a-label.art/privkey.pem
smtpd_use_tls=yes
smtpd_tls_auth_only = yes
smtp_tls_security_level = may
smtpd_tls_security_level = may
smtpd_sasl_security_options = noanonymous, noplaintext
smtpd_sasl_tls_security_options = noanonymous

# Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes

# Restrictions
smtpd_helo_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_invalid_helo_hostname, reject_non_fqdn_helo_hostname
smtpd_recipient_restrictions = permit_sasl_authenticated, permit_mynetworks, reject_unauth_destination

# Milter configuration for DKIM
milter_protocol = 6
milter_default_action = accept
smtpd_milters = inet:localhost:12301
non_smtpd_milters = inet:localhost:12301
```

## 📊 Database Schema for Email

```sql
-- Create mail database
CREATE DATABASE mailserver;
USE mailserver;

-- Virtual domains table
CREATE TABLE `virtual_domains` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Virtual users table
CREATE TABLE `virtual_users` (
  `id` int(11) NOT NULL auto_increment,
  `domain_id` int(11) NOT NULL,
  `password` varchar(106) NOT NULL,
  `email` varchar(100) NOT NULL,
  `artist_id` varchar(255) DEFAULT NULL,
  `quota` bigint(20) DEFAULT 1073741824, -- 1GB default
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Virtual aliases table
CREATE TABLE `virtual_aliases` (
  `id` int(11) NOT NULL auto_increment,
  `domain_id` int(11) NOT NULL,
  `source` varchar(100) NOT NULL,
  `destination` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert default domain
INSERT INTO `virtual_domains` (`name`) VALUES ('not-a-label.art');
```

## 🔗 Backend Integration

```typescript
// Email service for Not a Label backend
// src/services/emailManagementService.ts

import { createTransport } from 'nodemailer';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class EmailManagementService {
  private transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'localhost',
      port: 25,
      secure: false,
      auth: {
        user: 'system@not-a-label.art',
        pass: process.env.SYSTEM_EMAIL_PASSWORD
      }
    });
  }

  async createArtistEmail(artistId: string, username: string): Promise<{email: string, password: string}> {
    const email = `${username}@not-a-label.art`;
    const tempPassword = crypto.randomBytes(12).toString('base64');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Insert into mail database
    await pool.query(`
      INSERT INTO mailserver.virtual_users (domain_id, email, password, artist_id)
      VALUES (1, ?, ?, ?)
    `, [email, hashedPassword, artistId]);

    // Create default aliases
    await this.createAlias(`info@${username}.not-a-label.art`, email);
    await this.createAlias(`music@${username}.not-a-label.art`, email);

    return { email, password: tempPassword };
  }

  async createAlias(source: string, destination: string): Promise<void> {
    await pool.query(`
      INSERT INTO mailserver.virtual_aliases (domain_id, source, destination)
      VALUES (1, ?, ?)
    `, [source, destination]);
  }

  async sendWelcomeEmail(artistEmail: string, tempPassword: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'welcome@not-a-label.art',
      to: artistEmail,
      subject: 'Welcome to Not a Label - Your Professional Email is Ready!',
      html: `
        <h1>Welcome to Not a Label!</h1>
        <p>Your professional artist email has been created.</p>
        <h2>Email Details:</h2>
        <ul>
          <li>Email: ${artistEmail}</li>
          <li>Temporary Password: ${tempPassword}</li>
        </ul>
        <h3>Email Configuration:</h3>
        <ul>
          <li>IMAP Server: mail.not-a-label.art (Port 993, SSL)</li>
          <li>SMTP Server: mail.not-a-label.art (Port 587, STARTTLS)</li>
        </ul>
        <p>Please change your password after first login.</p>
      `
    });
  }

  async updateEmailQuota(email: string, quotaInMB: number): Promise<void> {
    const quotaInBytes = quotaInMB * 1024 * 1024;
    await pool.query(`
      UPDATE mailserver.virtual_users 
      SET quota = ? 
      WHERE email = ?
    `, [quotaInBytes, email]);
  }

  async getEmailStats(artistId: string): Promise<any> {
    const result = await pool.query(`
      SELECT 
        email,
        quota,
        created_at,
        (SELECT COUNT(*) FROM mailserver.virtual_aliases WHERE destination = email) as alias_count
      FROM mailserver.virtual_users
      WHERE artist_id = ?
    `, [artistId]);

    return result.rows[0];
  }
}
```

## 🎯 Integration Points

### 1. Artist Registration
```typescript
// When artist registers
const emailService = new EmailManagementService();
const { email, password } = await emailService.createArtistEmail(artistId, username);
await emailService.sendWelcomeEmail(email, password);
```

### 2. Dashboard Integration
- Email settings page
- Manage aliases
- Email forwarding options
- Quota management
- Email statistics

### 3. API Endpoints
```typescript
// Email management routes
router.post('/email/create', authenticate, createArtistEmail);
router.get('/email/stats', authenticate, getEmailStats);
router.post('/email/alias', authenticate, createEmailAlias);
router.put('/email/quota', authenticate, updateEmailQuota);
router.post('/email/forward', authenticate, setupForwarding);
```

## 🚦 Next Steps

1. **Add missing DNS records** (especially mail A record and SPF)
2. **Run email server setup** on your DigitalOcean droplet
3. **Integrate email service** into Not a Label backend
4. **Add email management UI** to artist dashboard
5. **Test email delivery** and spam scores

This gives every artist their own professional email address as part of the platform!