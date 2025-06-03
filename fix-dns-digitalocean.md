# Fix DNS for not-a-label.art

## Current Issue
Your domain `not-a-label.art` is pointing to `147.182.252.146` instead of your DigitalOcean droplet at `159.89.247.208`.

## Solution Steps

### Option 1: If using DigitalOcean DNS

1. **Log into DigitalOcean**
   - Go to https://cloud.digitalocean.com

2. **Navigate to Networking**
   - Click "Networking" in the left sidebar
   - Click on your domain "not-a-label.art"

3. **Update A Record**
   - Find the A record for `@` (root domain)
   - Click the three dots → Edit
   - Change the IP from `147.182.252.146` to `159.89.247.208`
   - Save

4. **Update WWW Record** (if exists)
   - Find the A record for `www`
   - Update to `159.89.247.208`
   - Or create CNAME pointing to `@`

### Option 2: If using External Registrar (like Namecheap, GoDaddy)

1. **Find your DNS provider**
   - Check where you registered the domain
   - Common registrars: Namecheap, GoDaddy, Google Domains, Cloudflare

2. **Update nameservers to DigitalOcean** (recommended)
   - In your registrar's DNS settings, change nameservers to:
     ```
     ns1.digitalocean.com
     ns2.digitalocean.com
     ns3.digitalocean.com
     ```

3. **Then add domain in DigitalOcean**
   - Go to DigitalOcean → Networking → Domains
   - Add domain "not-a-label.art"
   - Create A record pointing to `159.89.247.208`

### Option 3: Quick Fix at Current DNS Provider

1. **Login to your current DNS provider**
2. **Find DNS/Zone records**
3. **Update records**:
   ```
   Type: A
   Name: @ (or blank)
   Value: 159.89.247.208
   TTL: 300 (5 minutes)
   
   Type: A
   Name: www
   Value: 159.89.247.208
   TTL: 300
   ```

## Verify DNS Change

After making changes, check propagation:

```bash
# Check current DNS
dig not-a-label.art +short

# Check from different servers
dig @8.8.8.8 not-a-label.art +short
dig @1.1.1.1 not-a-label.art +short

# Monitor propagation
watch -n 10 'dig not-a-label.art +short'
```

## Expected Timeline
- Changes typically propagate in 5-30 minutes
- Full global propagation can take up to 48 hours
- Using lower TTL (300 seconds) speeds this up

## After DNS Updates

Once pointing to `159.89.247.208`:

1. **Install SSL Certificate**
   ```bash
   ssh root@159.89.247.208
   certbot --nginx -d not-a-label.art -d www.not-a-label.art
   ```

2. **Test the site**
   ```bash
   curl -I https://not-a-label.art
   ```

## Need Help?

If you tell me which DNS provider you're using, I can give more specific instructions for that platform.