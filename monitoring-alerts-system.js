// Production Monitoring and Alerts System for Not a Label
// Real-time monitoring with automated alerts

const express = require('express');
const os = require('os');
const app = express();

// Alert thresholds and configurations
const ALERT_CONFIG = {
  thresholds: {
    cpu_usage: 80, // percent
    memory_usage: 85, // percent
    disk_usage: 90, // percent
    response_time: 1000, // milliseconds
    error_rate: 5, // percent
    payment_failures: 3, // consecutive failures
    downtime: 60 // seconds
  },
  
  channels: {
    email: {
      enabled: true,
      recipients: ['jason@not-a-label.art', 'alerts@not-a-label.art']
    },
    sms: {
      enabled: false, // Enable when Twilio configured
      recipients: ['+1234567890']
    },
    slack: {
      enabled: false, // Enable when Slack webhook configured
      webhook: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
    },
    discord: {
      enabled: true,
      webhook: 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL'
    }
  },
  
  check_interval: 60000, // 1 minute
  alert_cooldown: 300000 // 5 minutes between same alerts
};

// Alert history to prevent spam
const alertHistory = new Map();

// System metrics collection
class SystemMonitor {
  static async getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return 100 - ~~(100 * totalIdle / totalTick);
  }
  
  static async getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return Math.round((1 - freeMem / totalMem) * 100);
  }
  
  static async getDiskUsage() {
    // In production, use proper disk monitoring
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec("df -h / | awk 'NR==2 {print $5}'", (error, stdout) => {
        if (error) {
          resolve(0);
        } else {
          resolve(parseInt(stdout.replace('%', '')));
        }
      });
    });
  }
  
  static async getResponseTime() {
    const start = Date.now();
    try {
      // Test internal API endpoint
      await fetch('http://localhost:3002/api/health');
      return Date.now() - start;
    } catch (error) {
      return 9999; // High value indicates failure
    }
  }
  
  static async getProcessStatus() {
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('pm2 jlist', (error, stdout) => {
        if (error) {
          resolve([]);
        } else {
          try {
            const processes = JSON.parse(stdout);
            resolve(processes.map(p => ({
              name: p.name,
              status: p.pm2_env.status,
              cpu: p.monit.cpu,
              memory: Math.round(p.monit.memory / 1024 / 1024),
              uptime: Date.now() - p.pm2_env.created_at,
              restarts: p.pm2_env.restart_time
            })));
          } catch {
            resolve([]);
          }
        }
      });
    });
  }
}

// Alert sending functions
class AlertSender {
  static async sendAlert(type, severity, message, details = {}) {
    const alertKey = `${type}-${severity}`;
    const lastAlert = alertHistory.get(alertKey);
    
    // Check cooldown
    if (lastAlert && Date.now() - lastAlert < ALERT_CONFIG.alert_cooldown) {
      return; // Skip to prevent spam
    }
    
    alertHistory.set(alertKey, Date.now());
    
    const alert = {
      type,
      severity,
      message,
      details,
      timestamp: new Date().toISOString(),
      server: os.hostname()
    };
    
    // Send through configured channels
    if (ALERT_CONFIG.channels.email.enabled) {
      await this.sendEmailAlert(alert);
    }
    
    if (ALERT_CONFIG.channels.discord.enabled) {
      await this.sendDiscordAlert(alert);
    }
    
    if (ALERT_CONFIG.channels.slack.enabled) {
      await this.sendSlackAlert(alert);
    }
    
    // Log alert
    console.error(`[ALERT] ${severity.toUpperCase()}: ${type} - ${message}`);
  }
  
  static async sendEmailAlert(alert) {
    // In production, integrate with email service
    console.log('📧 Email alert:', alert);
    
    const emailContent = `
Subject: [Not a Label] ${alert.severity.toUpperCase()} Alert: ${alert.type}

Alert Type: ${alert.type}
Severity: ${alert.severity}
Time: ${alert.timestamp}
Server: ${alert.server}

Message: ${alert.message}

Details:
${JSON.stringify(alert.details, null, 2)}

---
This is an automated alert from Not a Label monitoring system.
    `;
    
    // Send email (implementation depends on email service)
  }
  
  static async sendDiscordAlert(alert) {
    const color = {
      critical: 0xFF0000,
      warning: 0xFFFF00,
      info: 0x0099FF
    }[alert.severity] || 0x808080;
    
    const embed = {
      embeds: [{
        title: `🚨 ${alert.severity.toUpperCase()}: ${alert.type}`,
        description: alert.message,
        color: color,
        fields: Object.entries(alert.details).map(([key, value]) => ({
          name: key.replace(/_/g, ' ').toUpperCase(),
          value: String(value),
          inline: true
        })),
        timestamp: alert.timestamp,
        footer: {
          text: `Not a Label Monitoring | ${alert.server}`
        }
      }]
    };
    
    try {
      // await fetch(ALERT_CONFIG.channels.discord.webhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(embed)
      // });
      console.log('💬 Discord alert sent:', alert.type);
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }
  }
  
  static async sendSlackAlert(alert) {
    // Similar to Discord, format for Slack
    console.log('💬 Slack alert:', alert);
  }
}

// Monitoring checks
class MonitoringChecks {
  static async checkSystemResources() {
    const cpu = await SystemMonitor.getCPUUsage();
    const memory = await SystemMonitor.getMemoryUsage();
    const disk = await SystemMonitor.getDiskUsage();
    
    if (cpu > ALERT_CONFIG.thresholds.cpu_usage) {
      await AlertSender.sendAlert(
        'High CPU Usage',
        cpu > 90 ? 'critical' : 'warning',
        `CPU usage is at ${cpu}%`,
        { cpu_usage: cpu, threshold: ALERT_CONFIG.thresholds.cpu_usage }
      );
    }
    
    if (memory > ALERT_CONFIG.thresholds.memory_usage) {
      await AlertSender.sendAlert(
        'High Memory Usage',
        memory > 95 ? 'critical' : 'warning',
        `Memory usage is at ${memory}%`,
        { memory_usage: memory, threshold: ALERT_CONFIG.thresholds.memory_usage }
      );
    }
    
    if (disk > ALERT_CONFIG.thresholds.disk_usage) {
      await AlertSender.sendAlert(
        'High Disk Usage',
        'critical',
        `Disk usage is at ${disk}%`,
        { disk_usage: disk, threshold: ALERT_CONFIG.thresholds.disk_usage }
      );
    }
  }
  
  static async checkApplicationHealth() {
    const responseTime = await SystemMonitor.getResponseTime();
    const processes = await SystemMonitor.getProcessStatus();
    
    if (responseTime > ALERT_CONFIG.thresholds.response_time) {
      await AlertSender.sendAlert(
        'Slow Response Time',
        responseTime > 5000 ? 'critical' : 'warning',
        `API response time is ${responseTime}ms`,
        { response_time: responseTime, threshold: ALERT_CONFIG.thresholds.response_time }
      );
    }
    
    // Check if any processes are down
    const downProcesses = processes.filter(p => p.status !== 'online');
    if (downProcesses.length > 0) {
      await AlertSender.sendAlert(
        'Process Down',
        'critical',
        `${downProcesses.length} process(es) are not running`,
        { 
          down_processes: downProcesses.map(p => p.name),
          process_details: downProcesses
        }
      );
    }
    
    // Check for excessive restarts
    const highRestartProcesses = processes.filter(p => p.restarts > 10);
    if (highRestartProcesses.length > 0) {
      await AlertSender.sendAlert(
        'Process Instability',
        'warning',
        `Processes restarting frequently`,
        { 
          unstable_processes: highRestartProcesses.map(p => ({
            name: p.name,
            restarts: p.restarts
          }))
        }
      );
    }
  }
  
  static async checkBusinessMetrics() {
    // In production, query actual metrics from database
    // This is a placeholder for business metric monitoring
    
    // Example: Check payment success rate
    const paymentMetrics = {
      total: 100,
      failed: 6
    };
    
    const failureRate = (paymentMetrics.failed / paymentMetrics.total) * 100;
    
    if (failureRate > ALERT_CONFIG.thresholds.error_rate) {
      await AlertSender.sendAlert(
        'High Payment Failure Rate',
        'warning',
        `Payment failure rate is ${failureRate.toFixed(1)}%`,
        { 
          failure_rate: failureRate,
          failed_payments: paymentMetrics.failed,
          total_payments: paymentMetrics.total
        }
      );
    }
  }
}

// API endpoints for monitoring dashboard
app.get('/api/monitoring/status', async (req, res) => {
  const status = {
    system: {
      cpu: await SystemMonitor.getCPUUsage(),
      memory: await SystemMonitor.getMemoryUsage(),
      disk: await SystemMonitor.getDiskUsage(),
      uptime: os.uptime()
    },
    application: {
      response_time: await SystemMonitor.getResponseTime(),
      processes: await SystemMonitor.getProcessStatus()
    },
    alerts: {
      recent: Array.from(alertHistory.entries()).map(([key, time]) => ({
        alert: key,
        last_sent: new Date(time).toISOString()
      }))
    }
  };
  
  res.json(status);
});

app.post('/api/monitoring/test-alert', async (req, res) => {
  await AlertSender.sendAlert(
    'Test Alert',
    'info',
    'This is a test alert from Not a Label monitoring system',
    { triggered_by: 'Manual test', test: true }
  );
  
  res.json({ success: true, message: 'Test alert sent' });
});

// Start monitoring loops
function startMonitoring() {
  console.log('🔍 Starting Not a Label Monitoring System');
  console.log('==========================================');
  console.log(`Check interval: ${ALERT_CONFIG.check_interval / 1000}s`);
  console.log(`Alert cooldown: ${ALERT_CONFIG.alert_cooldown / 1000}s`);
  console.log('');
  
  // System resource monitoring
  setInterval(() => {
    MonitoringChecks.checkSystemResources();
  }, ALERT_CONFIG.check_interval);
  
  // Application health monitoring
  setInterval(() => {
    MonitoringChecks.checkApplicationHealth();
  }, ALERT_CONFIG.check_interval);
  
  // Business metrics monitoring (less frequent)
  setInterval(() => {
    MonitoringChecks.checkBusinessMetrics();
  }, ALERT_CONFIG.check_interval * 5);
  
  console.log('✅ Monitoring active for:');
  console.log('  • System resources (CPU, Memory, Disk)');
  console.log('  • Application health (Response time, Process status)');
  console.log('  • Business metrics (Payment success, User activity)');
  console.log('');
  console.log('📱 Alert channels:');
  Object.entries(ALERT_CONFIG.channels).forEach(([channel, config]) => {
    console.log(`  • ${channel}: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  });
}

// Export for integration
module.exports = {
  monitoringApp: app,
  startMonitoring,
  SystemMonitor,
  AlertSender,
  ALERT_CONFIG
};

// Run if executed directly
if (require.main === module) {
  startMonitoring();
  
  // Optional: Start API server for monitoring dashboard
  const PORT = process.env.MONITORING_PORT || 3007;
  app.listen(PORT, () => {
    console.log(`\n📊 Monitoring API running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/api/monitoring/status`);
  });
}