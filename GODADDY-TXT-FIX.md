# 🔧 Fix TXT Records in GoDaddy - Remove Backticks

## Step-by-Step Fix:

### 1. Fix SPF Record
- Click **Edit** next to the TXT record with @ name
- Current value: ```` v=spf1 mx ip4:159.89.247.208 ~all ````
- Change to: `v=spf1 mx ip4:159.89.247.208 ~all`
- Remove ALL backtick symbols (`)
- Click **Save**

### 2. Fix DKIM Record  
- Click **Edit** next to the TXT record with mail._domainkey name
- Current value starts with: ``` v=DKIM1...```
- Remove the `` from beginning and end
- Value should start with: `v=DKIM1` and end with `DAQAB`
- Click **Save**

### 3. Fix DMARC Record
- Click **Edit** next to the TXT record with _dmarc name  
- Current value: ``` v=DMARC1; p=quarantine; rua=mailto:dmarc@not-a-label.art ```
- Change to: `v=DMARC1; p=quarantine; rua=mailto:dmarc@not-a-label.art`
- Remove the `` backticks
- Click **Save**

## ❌ Wrong (with backticks):
```
`` value here ``
```

## ✅ Correct (no backticks):
```
value here
```

## Important:
- Don't add quotes either
- Just paste the plain text value
- No special characters around the values