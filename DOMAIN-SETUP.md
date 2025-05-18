# Domain Setup Guide for Not-a-Label

This guide provides step-by-step instructions for setting up and configuring the domain for the Not-a-Label platform.

## Domain Registration

1. The domain `not-a-label.art` was purchased from GoDaddy.
2. Domain registration should be renewed annually to maintain ownership.

## DNS Configuration

### Option 1: A Record Method (Recommended)

1. Login to GoDaddy account
2. Navigate to the domain management page for `not-a-label.art`
3. Go to the "DNS" or "DNS Management" section
4. Find the A record for the apex domain (@)
5. Delete any existing A records for the apex domain
6. Add a new A record with the following settings:
   - Type: A
   - Name: @ (or leave blank)
   - Value: 76.76.21.21 (Vercel's IP address)
   - TTL: 600 seconds (or 1 hour)

### Option 2: Nameservers Method

1. Login to GoDaddy account
2. Navigate to the domain management page for `not-a-label.art`
3. Go to the "Nameservers" section
4. Select "Change" next to the nameservers
5. Choose "I'll use my own nameservers"
6. Enter Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
7. Save changes

## Vercel Configuration

1. Login to your Vercel account
2. Go to the Not-a-Label project
3. Click on "Settings" tab
4. Select "Domains" from the left sidebar
5. Click "Add" to add a new domain
6. Enter `not-a-label.art` and click "Add"
7. Follow Vercel's instructions to verify domain ownership
8. Repeat for `www.not-a-label.art` and `api.not-a-label.art` subdomains

## Verification

DNS changes can take up to 48 hours to fully propagate across the internet. To verify the setup:

1. Run `dig not-a-label.art` to check the A record
2. Run `dig www.not-a-label.art` to check the CNAME record
3. Visit `https://not-a-label.art` to confirm the site is accessible
4. Check for the padlock icon in the browser to ensure SSL is working

## Subdomain Configuration

For the `api.not-a-label.art` subdomain:

1. In Vercel's domain settings, add the subdomain
2. In GoDaddy DNS, add a CNAME record:
   - Type: CNAME
   - Name: api
   - Value: cname.vercel-dns.com
   - TTL: 600 seconds

## Troubleshooting

If the domain doesn't resolve properly after 48 hours:

1. Verify the DNS records in GoDaddy match the instructions above
2. Check if there are any CAA records that might block Let's Encrypt
3. Clear your browser cache or try incognito mode
4. Check Vercel's domain settings for any errors or warnings
5. If using custom nameservers, ensure MX records are properly configured for email

## Email Configuration (Optional)

If you need to set up email with the domain:

1. In GoDaddy DNS, add MX records as provided by your email provider
2. Add any required TXT records for domain verification
3. Test email delivery after DNS propagation

## Additional Resources

- [Vercel Domain Documentation](https://vercel.com/docs/domains)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-records-680)
- [Let's Encrypt SSL](https://letsencrypt.org/docs/) 