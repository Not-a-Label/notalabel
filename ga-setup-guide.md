# Google Analytics 4 Setup for Not a Label

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create new account: "Not a Label"
3. Create new property: "Not a Label Platform"
4. Configure property details:
   - Property name: Not a Label Platform
   - Reporting time zone: (Your timezone)
   - Currency: USD
5. Set up data stream:
   - Platform: Web
   - Website URL: https://not-a-label.art
   - Stream name: Not a Label Website

## Step 2: Get Measurement ID

After creating the property, you'll get a Measurement ID like: `G-XXXXXXXXXX`

## Step 3: Configure Environment Variables

Add to frontend environment file:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## For Demo Purposes

I'll use a demo tracking ID to test the functionality:
`G-DEMO12345678`