# OpenAI API Key Setup for Not a Label

## Current Status
The platform is running with a demo AI assistant that provides pre-written music career advice. To enable full AI capabilities with OpenAI GPT-3.5-turbo, you need to configure a valid API key.

## How to Get an OpenAI API Key

1. **Create OpenAI Account**
   - Go to https://platform.openai.com/signup
   - Sign up with your email or Google account

2. **Add Payment Method**
   - Navigate to https://platform.openai.com/account/billing
   - Add a credit card (required for API access)
   - Set usage limits to control costs

3. **Generate API Key**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name it "Not-a-Label-Production"
   - Copy the key immediately (it won't be shown again!)

## Configure the API Key

### Option 1: Update on Server (Recommended)

```bash
# SSH into server
ssh root@159.89.247.208

# Edit environment file
nano /var/www/clean-backend/.env

# Update the OPENAI_API_KEY line:
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_API_KEY_HERE

# Save and exit (Ctrl+X, Y, Enter)

# Restart backend
pm2 restart backend
```

### Option 2: Test API Key First

```bash
# Test the key before adding to production
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json"

# If successful, you'll see a list of available models
```

## Cost Estimates

For Not a Label's AI Assistant using GPT-3.5-turbo:
- **Input**: $0.0005 per 1K tokens (~750 words)
- **Output**: $0.0015 per 1K tokens (~750 words)
- **Typical conversation**: ~$0.002 (less than a penny)
- **Monthly estimate**: $10-50 depending on usage

## Security Best Practices

1. **Never commit API keys to Git**
   - Always use environment variables
   - Add .env to .gitignore

2. **Set usage limits**
   - Configure monthly spending limits in OpenAI dashboard
   - Monitor usage regularly

3. **Rotate keys periodically**
   - Generate new keys every 3-6 months
   - Delete old keys after rotation

4. **Use separate keys for environments**
   - Development: Limited budget key
   - Production: Production key with higher limits

## Verify AI Assistant is Working

After updating the API key:

```bash
# Test from server
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I promote my music?"}'

# Test from outside
curl -X POST http://159.89.247.208/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the best music distribution platforms?"}'
```

## Troubleshooting

### "Invalid API Key" Error
- Double-check the key is copied correctly
- Ensure no extra spaces or characters
- Verify billing is set up in OpenAI account

### "Rate Limit" Error
- Check OpenAI dashboard for usage
- Implement request throttling if needed
- Consider upgrading OpenAI plan

### "Service Unavailable" Error
- Check OpenAI status: https://status.openai.com
- Verify internet connectivity from server
- Review backend logs: `pm2 logs backend`

## Alternative: Keep Demo Mode

If you prefer to keep the demo AI assistant:
- No API costs
- Provides helpful pre-written responses
- Good for testing and development
- Limited to 5 response variations

The platform works perfectly fine in demo mode!