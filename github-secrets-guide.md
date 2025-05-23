# GitHub Secrets Configuration Guide

## Required Secrets for Not-a-Label

Go to: https://github.com/Not-a-Label/notalabel/settings/secrets/actions

Click "New repository secret" for each of the following:

### 1. Authentication Secrets

**JWT_SECRET**
- Generate with: `openssl rand -base64 32`
- Example: `Km8Q2B8M0vN7hF3pR9tL5jX1wY6zD4eA`

**ENCRYPTION_KEY**
- Generate with: `openssl rand -hex 32`
- Example: `a5f3b2c1d4e5f6789012345678901234567890abcdef1234567890abcdef1234`

### 2. Web Push Notification Keys

**VAPID_PUBLIC_KEY** and **VAPID_PRIVATE_KEY**
- Generate both with:
  ```bash
  cd not-a-label-backend
  npx web-push generate-vapid-keys
  ```

### 3. AWS Credentials

**AWS_ACCESS_KEY_ID**
- Get from AWS IAM Console
- Example: `AKIAIOSFODNN7EXAMPLE`

**AWS_SECRET_ACCESS_KEY**
- Get from AWS IAM Console
- Example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**AWS_REGION**
- Your AWS region
- Example: `us-east-1`

### 4. OAuth Credentials

**TWITTER_CLIENT_ID** and **TWITTER_CLIENT_SECRET**
- Get from: https://developer.twitter.com/en/apps

**DISCORD_CLIENT_ID** and **DISCORD_CLIENT_SECRET**
- Get from: https://discord.com/developers/applications

**LINKEDIN_CLIENT_ID** and **LINKEDIN_CLIENT_SECRET**
- Get from: https://www.linkedin.com/developers/apps

### 5. Production Deployment (Optional)

**DOCKER_USERNAME** and **DOCKER_PASSWORD**
- Your Docker Hub credentials

**PRODUCTION_HOST**
- Value: `not-a-label.art`

**PRODUCTION_USER**
- Your SSH username for the production server

## Quick Setup Commands

Run these commands locally to generate the values:

```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key
openssl rand -hex 32

# VAPID Keys
cd not-a-label-backend
npx web-push generate-vapid-keys
```

## Verification

After adding all secrets, trigger a workflow run to verify:
1. Go to: https://github.com/Not-a-Label/notalabel/actions
2. Click on the latest workflow
3. Check for any secret-related errors

## Security Notes

- Never share these secrets
- Rotate them periodically
- Use different values for production and development
- Enable GitHub's secret scanning