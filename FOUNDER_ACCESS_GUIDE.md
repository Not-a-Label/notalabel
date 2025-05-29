# Founder Access Guide - Jason Ino

## 🎯 Quick Start - Accessing Your Platform Profits

### Step 1: Register as Founder
1. Go to https://not-a-label.art/auth/register
2. Register with your email
3. Note your user ID after registration (shown in profile)

### Step 2: Configure Founder Access
Update the backend `.env` file:
```env
FOUNDER_USER_ID=YOUR_USER_ID_HERE  # Replace with your actual user ID
```

### Step 3: Access Revenue Dashboard
Visit: **https://not-a-label.art/business/revenue**

This exclusive dashboard shows:
- 💰 Total platform revenue
- 📊 Revenue breakdown by source
- 💳 Available balance for withdrawal
- 📈 Daily/monthly/yearly analytics

## 💸 Withdrawing Your Profits

### Via API (Automated)
```bash
# Check your available balance
curl -X GET https://not-a-label.art/api/founder/profit-summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# Withdraw profits
curl -X POST https://not-a-label.art/api/founder/withdraw \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "description": "Monthly profit withdrawal"
  }'
```

### Via Dashboard (Coming Soon)
A dedicated founder withdrawal interface will be added to the business dashboard.

## 📊 Revenue Streams & Fees

Your platform automatically collects:

| Source | Fee | Example |
|--------|-----|---------|
| **Marketplace Sales** | 15% | $100 sale = $15 profit |
| **Subscriptions** | 20% | $19.99/mo = $4 profit |
| **AI Processing** | $2.50-$5 | Per request |
| **NFT Minting** | $25 flat | Per mint |
| **Withdrawals** | 2.5% | Artist payouts |

## 🏦 Setting Up Bank Transfers

### Connect Your Bank Account
```javascript
// One-time setup
POST /api/founder/setup-bank-account
{
  "account_holder_name": "Jason Ino",
  "routing_number": "110000000",
  "account_number": "000123456789",
  "country": "US",
  "currency": "USD"
}
```

### Withdrawal Options
- **Standard Transfer**: 2-3 business days (free)
- **Instant Transfer**: Within minutes (1.5% fee)
- **Monthly Auto-withdrawal**: Set up recurring transfers

## 📈 Financial Reports

### Monthly Profit Report
Access at: `/api/founder/monthly-report?year=2025&month=05`

Shows:
- Revenue by category
- Transaction volumes
- Average transaction values
- Month-over-month growth

### Export Options
- CSV export for accounting
- PDF reports for investors
- API access for custom dashboards

## 🔐 Security

### Protecting Your Access
1. **Two-Factor Authentication**: Enable 2FA on your founder account
2. **IP Whitelisting**: Restrict dashboard access to specific IPs
3. **API Key Rotation**: Regularly rotate API keys
4. **Audit Logs**: All withdrawals are logged

### Backup Access
Store these securely:
- Your user ID
- Backup authentication codes
- Bank account details
- Stripe account credentials

## 💡 Maximizing Revenue

### Growth Strategies
1. **Increase Subscriptions**: Focus on Pro/Label tier conversions
2. **Marketplace Volume**: Encourage more beat/sample listings
3. **AI Usage**: Promote AI features to increase usage
4. **Geographic Expansion**: Target international markets

### Revenue Optimization
- A/B test pricing strategies
- Offer limited-time promotions
- Create bundle packages
- Implement referral programs

## 🚨 Important Notes

1. **Tax Obligations**: Platform revenue is taxable income
2. **Minimum Withdrawal**: $100 minimum for founder withdrawals
3. **Currency Support**: USD, EUR, GBP, CAD available
4. **Withdrawal Limits**: No maximum limit for founders

## 📞 Support

For founder-specific support:
- Technical issues: Check server logs at `/var/log/not-a-label/`
- Stripe issues: Access Stripe Dashboard
- Database queries: Use SQLite browser on `notalabel.db`

## 🎯 Quick Commands

```bash
# SSH to server
ssh root@159.89.247.208

# Check platform status
pm2 status

# View revenue logs
pm2 logs backend --lines 100 | grep "Business revenue"

# Database backup
sqlite3 /path/to/notalabel.db ".backup /path/to/backup.db"
```

---

**Remember**: As the founder, you have full access to all platform data and revenue. The business dashboard at `/business/revenue` is your primary tool for monitoring platform health and accessing profits.