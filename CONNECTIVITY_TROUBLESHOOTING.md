# 🔧 Not a Label - Connectivity Troubleshooting Guide

## 🚨 Issue: "I'm having trouble accessing your music data right now"

### 📊 Current Platform Status
- ✅ **Backend API**: Running (localhost:3001)
- ✅ **Frontend App**: Running (localhost:3000)  
- ✅ **Enhanced Analytics**: Working
- ✅ **Database**: Connected
- ✅ **AI Services**: Operational

---

## 🔍 Troubleshooting Steps

### 1. Check Local Platform Access
```bash
# Test backend API
curl http://localhost:3001/health

# Test enhanced analytics
curl http://localhost:3001/api/analytics/enhanced

# Test frontend
curl http://localhost:3000
```

### 2. Browser-Based Solutions

#### Clear Browser Cache
1. **Chrome/Edge**: Ctrl+Shift+Delete → Clear browsing data
2. **Firefox**: Ctrl+Shift+Delete → Clear recent history
3. **Safari**: Cmd+Option+E → Empty caches

#### Disable Browser Extensions
1. Open browser in incognito/private mode
2. Temporarily disable ad blockers
3. Check if the issue persists

#### Hard Refresh
- **Windows**: Ctrl+F5 or Ctrl+Shift+R
- **Mac**: Cmd+Shift+R
- **All**: Shift+Click refresh button

### 3. Network Connectivity

#### Check Internet Connection
```bash
# Test general connectivity
ping google.com

# Test DNS resolution
nslookup not-a-label.art

# Check if running on different ports
netstat -tulpn | grep :3001
netstat -tulpn | grep :3000
```

#### Local Network Issues
- Restart WiFi/Ethernet connection
- Try different network (mobile hotspot)
- Check firewall settings

### 4. Application-Specific Solutions

#### Restart Services
```bash
# If running locally, restart backend
cd "not-a-label-backend"
npm restart

# Restart frontend  
cd "../not-a-label-frontend"
npm restart
```

#### Check Environment Variables
```bash
# Verify backend configuration
cat not-a-label-backend/.env

# Check if all required APIs are configured
grep -E "(OPENAI_API_KEY|DATABASE_URL)" not-a-label-backend/.env
```

### 5. Production Platform Access

#### If accessing production (not-a-label.art)
```bash
# Check domain resolution
dig not-a-label.art

# Test HTTPS connectivity
curl -I https://not-a-label.art

# Check API availability
curl https://api.not-a-label.art/health
```

---

## 🎯 Quick Fixes by Error Type

### "Internet connection is unstable"
1. **Switch networks**: Try mobile data or different WiFi
2. **Restart router**: Unplug for 30 seconds, reconnect
3. **Check speed**: Run speed test (fast.com)
4. **VPN issues**: Disable VPN temporarily

### "AI service is temporarily unavailable"
1. **Check API keys**: Verify OpenAI API key is valid
2. **Rate limiting**: Wait 1-2 minutes and retry
3. **Service status**: Check OpenAI status page
4. **Fallback mode**: Platform should work with cached data

### "You need to log in again"
1. **Clear cookies**: Delete authentication cookies
2. **Refresh session**: Log out and log back in
3. **Check session storage**: Clear browser local storage
4. **Incognito mode**: Try accessing in private browsing

---

## 🔧 Advanced Troubleshooting

### Check Service Logs
```bash
# Backend logs (if running locally)
cd not-a-label-backend
npm run logs

# Frontend logs
cd not-a-label-frontend  
npm run dev

# Docker logs (if using containers)
docker-compose logs -f
```

### Database Connectivity
```bash
# Test database connection
docker-compose exec postgres pg_isready

# Check Redis cache
docker-compose exec redis redis-cli ping
```

### API Endpoint Testing
```bash
# Test all enhanced analytics endpoints
curl http://localhost:3001/api/analytics/enhanced
curl -X POST http://localhost:3001/api/analytics/predictions \
  -H "Content-Type: application/json" \
  -d '{"timeHorizons":["30d"]}'
curl http://localhost:3001/api/analytics/recommendations
```

---

## 🚀 Alternative Access Methods

### 1. Direct API Access
If dashboard is inaccessible, use API directly:
```bash
# Get analytics data
curl -s http://localhost:3001/api/analytics/enhanced | jq

# Get predictions
curl -s -X POST http://localhost:3001/api/analytics/predictions \
  -H "Content-Type: application/json" \
  -d '{"timeHorizons":["30d"]}' | jq
```

### 2. Mobile Access
- Try accessing from mobile device
- Use mobile browser instead of desktop
- Check if mobile app is available

### 3. Backup Dashboard
Create simple HTML dashboard for emergency access:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Not a Label - Backup Dashboard</title>
</head>
<body>
    <h1>Not a Label Analytics</h1>
    <button onclick="loadAnalytics()">Load Analytics</button>
    <div id="data"></div>
    
    <script>
        async function loadAnalytics() {
            try {
                const response = await fetch('http://localhost:3001/api/analytics/enhanced');
                const data = await response.json();
                document.getElementById('data').innerHTML = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    </script>
</body>
</html>
```

---

## 📱 Contact & Support

### Platform Status Check
- **Local Development**: Check console output for errors
- **Production**: Visit status page (if available)
- **GitHub**: Check repository issues

### Emergency Contacts
- **Technical Issues**: Check deployment logs
- **Data Loss**: Restore from backup
- **Security Concerns**: Review access logs

---

## 🎵 Platform Recovery

### If Complete Restart Needed
```bash
# Stop all services
docker-compose down

# Clear volumes (careful - data loss)
docker-compose down -v

# Restart fresh
docker-compose up -d

# Reinitialize database
docker-compose exec postgres psql -U not_a_label_user -d not_a_label -f /docker-entrypoint-initdb.d/init-db.sql
```

### Backup and Restore
```bash
# Create backup
docker-compose exec postgres pg_dump -U not_a_label_user not_a_label > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U not_a_label_user not_a_label < backup.sql
```

---

## ✅ Resolution Checklist

- [ ] Platform services running
- [ ] Network connectivity verified
- [ ] Browser cache cleared
- [ ] Authentication session refreshed
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Error logs checked
- [ ] Alternative access methods tried

---

**🎵 Once connectivity is restored, your enhanced analytics platform with AI capabilities will be fully accessible!**

*For persistent issues, check the deployment logs or restart the platform services.* 🚀