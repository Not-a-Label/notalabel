# Production Monitoring & Alerts Setup

## Overview
This document outlines the monitoring and alerting infrastructure for Not a Label platform to ensure high availability, performance, and quick incident response.

## Monitoring Stack

### 1. Application Performance Monitoring (APM)
**Tool**: New Relic / DataDog
- Real-time performance metrics
- Transaction tracing
- Error tracking
- Custom dashboards

### 2. Error Tracking
**Tool**: Sentry
```javascript
// Frontend integration (frontend/utils/sentry.js)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    return event;
  },
});
```

### 3. Uptime Monitoring
**Tool**: UptimeRobot / Pingdom
- Endpoint monitoring every 5 minutes
- SSL certificate expiry alerts
- Response time tracking

**Endpoints to Monitor**:
- https://not-a-label.art (Main site)
- https://not-a-label.art/api/health (API health)
- https://not-a-label.art/api/auth/verify (Auth service)
- https://not-a-label.art/api/ai/status (AI service)

### 4. Infrastructure Monitoring
**Tool**: DigitalOcean Monitoring + Custom Scripts
```bash
#!/bin/bash
# Server health check script
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  curl -X POST $SLACK_WEBHOOK -d '{"text":"High CPU usage: '$CPU_USAGE'%"}'
fi
```

### 5. Database Monitoring
**PostgreSQL Metrics**:
- Connection pool usage
- Query performance
- Slow query logs
- Replication lag

### 6. Business Metrics Dashboard
```javascript
// Custom metrics tracking
const trackBusinessMetrics = async () => {
  const metrics = {
    daily_revenue: await calculateDailyRevenue(),
    active_users: await getActiveUserCount(),
    new_signups: await getNewSignups(),
    ai_usage: await getAIUsageMetrics(),
    platform_fees: await getPlatformFees(),
  };
  
  await sendToMonitoring(metrics);
};
```

## Alert Configuration

### Critical Alerts (Immediate Response)
1. **Service Down**
   - Trigger: Any endpoint down for > 2 minutes
   - Action: PagerDuty alert + SMS to on-call

2. **High Error Rate**
   - Trigger: Error rate > 5% for 5 minutes
   - Action: Slack alert + Email to engineering

3. **Database Connection Issues**
   - Trigger: Connection pool > 90% utilized
   - Action: Auto-scale + Alert team

4. **Payment Processing Failures**
   - Trigger: Any payment gateway error
   - Action: Immediate notification to finance + engineering

### Warning Alerts (Business Hours)
1. **Performance Degradation**
   - Trigger: Response time > 2s for 10 minutes
   - Action: Slack notification

2. **High Resource Usage**
   - Trigger: CPU/Memory > 70% for 15 minutes
   - Action: Email to DevOps

3. **SSL Certificate Expiry**
   - Trigger: Certificate expires in < 30 days
   - Action: Email reminder

## Logging Infrastructure

### Centralized Logging
**Tool**: ELK Stack (Elasticsearch, Logstash, Kibana)
```json
{
  "log_format": {
    "timestamp": "ISO8601",
    "level": "INFO|WARN|ERROR",
    "service": "frontend|backend|ai",
    "user_id": "UUID",
    "request_id": "UUID",
    "message": "string",
    "metadata": {}
  }
}
```

### Log Retention Policy
- Application logs: 30 days
- Access logs: 90 days
- Error logs: 180 days
- Audit logs: 1 year

## Incident Response

### Severity Levels
1. **SEV1**: Platform down, payment issues
2. **SEV2**: Major feature broken, performance issues
3. **SEV3**: Minor feature issues, cosmetic bugs

### Response Times
- SEV1: 15 minutes
- SEV2: 1 hour
- SEV3: 4 hours

### On-Call Rotation
```yaml
schedule:
  - week: 1
    primary: engineer1
    backup: engineer2
  - week: 2
    primary: engineer2
    backup: engineer3
  - week: 3
    primary: engineer3
    backup: engineer1
```

## Dashboard Setup

### Key Metrics Dashboard
1. **Real-time Metrics**
   - Active users
   - Requests per second
   - Error rate
   - Response time (p50, p95, p99)

2. **Business Metrics**
   - Daily/Monthly revenue
   - User growth rate
   - Feature adoption
   - AI usage statistics

3. **Infrastructure Health**
   - Server resources
   - Database performance
   - Cache hit rates
   - CDN performance

### Custom Alerts Script
```javascript
// monitoring/alerts.js
const checkPlatformHealth = async () => {
  const health = {
    api: await checkEndpoint('/api/health'),
    database: await checkDatabase(),
    redis: await checkRedis(),
    ai_service: await checkAIService(),
  };
  
  const unhealthy = Object.entries(health)
    .filter(([_, status]) => !status.healthy);
  
  if (unhealthy.length > 0) {
    await sendAlert({
      level: 'critical',
      services: unhealthy,
      message: 'Platform health check failed',
    });
  }
};

// Run every minute
setInterval(checkPlatformHealth, 60000);
```

## Implementation Checklist
- [ ] Set up Sentry account and integrate
- [ ] Configure New Relic/DataDog
- [ ] Set up UptimeRobot monitors
- [ ] Deploy logging infrastructure
- [ ] Configure alert channels (Slack, PagerDuty)
- [ ] Create custom dashboards
- [ ] Test alert escalation
- [ ] Document runbooks
- [ ] Train team on tools
- [ ] Schedule monthly reviews

## Monthly Review Template
1. Incident analysis
2. Performance trends
3. Cost optimization
4. Alert effectiveness
5. Tool evaluation
6. Team feedback

---

**Priority**: Implement basic monitoring before beta launch, enhance during beta period based on actual usage patterns.