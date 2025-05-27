# Production Monitoring Alerts Setup

## ✅ Monitoring Systems Configured

### 1. Service Health Monitoring (Every 5 minutes)
- Checks if frontend and backend are running
- Monitors Nginx status
- Alerts on high disk usage (>80%)
- Alerts on high memory usage (>85%)

### 2. OpenAI Usage Monitoring (Hourly)
- Tracks API calls to AI assistant
- Estimates daily costs
- Alerts if daily cost exceeds $50
- Logs usage statistics

### 3. SSL Certificate Monitoring (Daily at noon)
- Checks certificate expiration
- Warns 30 days before expiry
- Critical alert 7 days before expiry

### 4. Response Time Monitoring (Every 15 minutes)
- Tests API health endpoint
- Tests AI chat endpoint
- Alerts if response time > 5 seconds

### 5. Daily Summary (Midnight)
- Runs all monitoring checks
- Generates daily report

## 📍 Log File Locations
```bash
/var/log/service-alerts.log     # Service down alerts
/var/log/openai-usage.log       # OpenAI API usage
/var/log/ssl-alerts.log         # SSL certificate status
/var/log/response-time.log      # API response times
/var/log/daily-monitoring.log   # Daily summary
```

## 🔔 Setting Up Alert Notifications

### Option 1: Email Alerts
```bash
# Install mail utilities
apt-get install -y mailutils postfix

# Configure postfix for your mail server
# Edit /etc/postfix/main.cf

# Test email
echo "Test alert" | mail -s "Not a Label Alert Test" admin@not-a-label.art
```

### Option 2: Slack Webhook
```bash
# Add to monitoring scripts:
send_slack_alert() {
    MESSAGE=$1
    WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    
    curl -X POST $WEBHOOK_URL \
        -H 'Content-type: application/json' \
        -d "{\"text\":\"🚨 Not a Label Alert: $MESSAGE\"}"
}

# Usage in scripts:
send_slack_alert "Backend service is down!"
```

### Option 3: Discord Webhook
```bash
# Add to monitoring scripts:
send_discord_alert() {
    MESSAGE=$1
    WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK"
    
    curl -X POST $WEBHOOK_URL \
        -H 'Content-type: application/json' \
        -d "{\"content\":\"🚨 **Not a Label Alert**: $MESSAGE\"}"
}
```

### Option 4: SMS via Twilio
```bash
# Install Twilio CLI or use curl:
send_sms_alert() {
    MESSAGE=$1
    curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
        -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
        -d "From=$TWILIO_PHONE" \
        -d "To=$ADMIN_PHONE" \
        -d "Body=Not a Label Alert: $MESSAGE"
}
```

## 📊 Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Disk Usage | 80% | 90% |
| Memory Usage | 85% | 95% |
| API Response Time | 3s | 5s |
| AI Response Time | 5s | 10s |
| SSL Expiry | 30 days | 7 days |
| OpenAI Daily Cost | $30 | $50 |

## 🛠️ Manual Testing

Test individual monitors:
```bash
# Test service health
/root/monitoring/service-health-monitor.sh

# Test OpenAI usage
/root/monitoring/openai-usage-monitor.sh

# Test SSL status
/root/monitoring/ssl-cert-monitor.sh

# Test response times
/root/monitoring/response-time-monitor.sh

# Run all tests
/root/monitoring/run-all-monitors.sh
```

## 📈 Monitoring Dashboard Ideas

### Grafana Setup (Optional)
```bash
# Install Grafana
apt-get install -y grafana

# Configure data sources for:
- System metrics (Prometheus node exporter)
- Application logs (Loki)
- Custom metrics from monitoring scripts
```

### Simple HTML Dashboard
Create `/var/www/status/monitoring.html` with:
- Real-time service status
- API response time graphs
- OpenAI usage charts
- Alert history

## 🔄 Maintenance

### Weekly Tasks
1. Review alert logs
2. Adjust thresholds if needed
3. Test alert delivery methods
4. Clean old log files

### Monthly Tasks
1. Analyze trends
2. Optimize based on patterns
3. Update alert recipients
4. Review cost alerts

## 🚨 Emergency Contacts

Configure in monitoring scripts:
```bash
ALERT_EMAIL="admin@not-a-label.art"
ALERT_PHONE="+1234567890"
SLACK_WEBHOOK="https://hooks.slack.com/..."
ON_CALL_ENGINEER="engineer@not-a-label.art"
```

---

**Note**: Remember to configure actual notification methods (email, webhook, SMS) to receive alerts in real-time!