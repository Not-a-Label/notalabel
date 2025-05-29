# DNS Fix Guide for not-a-label.art

## 🚨 Current Issue
The domain `not-a-label.art` is pointing to the wrong IP address:
- **Current IP**: 147.182.252.146 (old server)
- **Target IP**: 159.89.247.208 (new server)
- **Nameservers**: ns45.domaincontrol.com, ns46.domaincontrol.com (GoDaddy)

## 🔍 Analysis
The DNS trace shows the domain is managed through GoDaddy's DNS system. The A record needs to be updated to point to the correct server.

## 🛠️ How to Fix

### Option 1: Update DNS Records at GoDaddy (Recommended)
1. **Log into GoDaddy Account**
   - Go to https://account.godaddy.com
   - Navigate to "My Domains"
   - Find `not-a-label.art`

2. **Update DNS Records**
   - Click "Manage DNS" for the domain
   - Find the A record pointing to `147.182.252.146`
   - Change it to `159.89.247.208`
   - Set TTL to 600 seconds (10 minutes) for faster propagation

3. **Verify Settings**
   - Ensure the A record for `@` (root domain) points to `159.89.247.208`
   - Ensure the A record for `www` also points to `159.89.247.208`
   - Save changes

### Option 2: Use DigitalOcean DNS (Alternative)
If you prefer using DigitalOcean's DNS:

1. **Set Up DNS at DigitalOcean**
   - Add domain to DigitalOcean DNS
   - Create A records for `@` and `www` pointing to `159.89.247.208`

2. **Update Nameservers at GoDaddy**
   - Change nameservers to:
     - `ns1.digitalocean.com`
     - `ns2.digitalocean.com`
     - `ns3.digitalocean.com`

## 🕒 Expected Timeline
- **DNS Update**: Immediate (at registrar)
- **Propagation**: 10 minutes to 48 hours
- **Full Global Propagation**: Usually within 2-4 hours

## ✅ Verification Commands

### Check Current Status
```bash
# Check current DNS
nslookup not-a-label.art

# Check from different DNS servers
nslookup not-a-label.art 8.8.8.8
nslookup not-a-label.art 1.1.1.1

# Trace DNS path
dig +trace not-a-label.art
```

### Test Website Access
```bash
# Test HTTP access
curl -I http://not-a-label.art

# Test HTTPS (once SSL is set up)
curl -I https://not-a-label.art
```

## 🔧 Temporary Workaround
While DNS propagates, users can access the site directly via IP:
- **Direct Access**: http://159.89.247.208
- **All features work** at this URL

## 🔐 SSL Setup (After DNS Fix)
Once DNS points to the correct server:

1. **Install Certbot**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. **Get SSL Certificate**
```bash
sudo certbot --nginx -d not-a-label.art -d www.not-a-label.art
```

3. **Auto-renewal Setup**
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 DNS Status Monitoring
Use these tools to monitor propagation:
- https://www.whatsmydns.net/#A/not-a-label.art
- https://dnschecker.org/#A/not-a-label.art

## 🚨 Critical Notes
- **Don't delete old records** until new ones propagate
- **Backup current DNS settings** before making changes
- **Test thoroughly** before announcing the fix
- **Monitor for 24-48 hours** to ensure stability

## 📞 Support Contacts
- **GoDaddy Support**: Available 24/7 via phone/chat
- **DigitalOcean Support**: Available via ticket system

---

*Last Updated: May 29, 2025*
*Status: DNS pointing to wrong IP - requires registrar update*