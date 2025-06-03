# 🌐 DNS Update Checklist for not-a-label.art

## Current Status
- **Domain**: not-a-label.art
- **Current IP**: 147.182.252.146 (OLD)
- **New IP**: 159.89.247.208 (PRODUCTION SERVER)

## Step-by-Step DNS Update

### 1. **Log into Your Domain Registrar**
Common registrars:
- GoDaddy
- Namecheap  
- Google Domains
- Cloudflare
- Others

### 2. **Navigate to DNS Management**
Look for:
- "DNS Settings"
- "Manage DNS"
- "DNS Records"
- "Zone Editor"

### 3. **Update A Records**

#### Primary Domain
- **Type**: A
- **Name**: @ (or blank)
- **Value**: 159.89.247.208
- **TTL**: 300 (5 minutes)

#### WWW Subdomain
- **Type**: A
- **Name**: www
- **Value**: 159.89.247.208
- **TTL**: 300

### 4. **Remove Old Records**
Delete any A records pointing to:
- 147.182.252.146
- Any other IPs

### 5. **Save Changes**
- Click "Save" or "Update"
- Changes typically take 5-30 minutes

## Verification Steps

### Check DNS Propagation
```bash
# Run this command to check:
dig not-a-label.art +short

# Should return:
159.89.247.208
```

### Test Website Access
1. Wait 5-10 minutes after updating
2. Visit http://not-a-label.art
3. Should see the platform status page

### Global DNS Check
Visit: https://www.whatsmydns.net/
- Enter: not-a-label.art
- Check that most servers show 159.89.247.208

## After DNS Updates

### 1. **Activate SSL Certificate**
Once DNS is pointing to 159.89.247.208:
```bash
./activate-ssl-live.sh
```

### 2. **Update Platform URLs**
- Change all references from IP to domain
- Update email templates
- Update social media links

### 3. **Test Everything**
- [ ] Homepage loads
- [ ] API endpoints work
- [ ] Admin panel accessible
- [ ] SSL certificate active

## Troubleshooting

### DNS Not Updating?
- Clear browser cache
- Try incognito/private mode
- Flush local DNS:
  - Mac: `sudo dscacheutil -flushcache`
  - Windows: `ipconfig /flushdns`
  - Linux: `sudo systemd-resolve --flush-caches`

### Still Seeing Old Site?
- DNS can take up to 48 hours (rare)
- Try different browser
- Check from mobile network
- Use VPN to test from different location

## Emergency Contacts

### Domain Issues
- Registrar support (check your provider)
- DNS typically updates in 5-30 minutes

### Server Issues  
- SSH: `ssh root@159.89.247.208`
- PM2 status: `pm2 status`
- Restart services: `pm2 restart all`

## Success Checklist

- [ ] DNS updated to 159.89.247.208
- [ ] not-a-label.art loads correctly
- [ ] www.not-a-label.art loads correctly
- [ ] API endpoints responding
- [ ] SSL certificate activated
- [ ] All systems operational

---

**Note**: Keep this document handy. DNS is the critical step to making your platform publicly accessible at not-a-label.art instead of just the IP address.