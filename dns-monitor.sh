#\!/bin/bash

# DNS Monitoring Script for not-a-label.art
TARGET_IP="159.89.247.208"
DOMAIN="not-a-label.art"

echo "🔍 DNS Status Check for $DOMAIN"
echo "Target IP: $TARGET_IP"
echo "----------------------------------------"

CURRENT_IP=$(nslookup $DOMAIN | grep -A1 "Non-authoritative answer:" | grep "Address:" | tail -1 | awk '{print $2}')
echo "Current IP: $CURRENT_IP"

if [ "$CURRENT_IP" = "$TARGET_IP" ]; then
    echo "✅ DNS RESOLVED\! Domain points to correct server"
else
    echo "⏳ DNS needs update. Still pointing to old server."
    echo "💡 Update A record at domain registrar to: $TARGET_IP"
fi

echo ""
echo "📊 Check global propagation: https://www.whatsmydns.net/#A/$DOMAIN"
echo "🔧 Temporary access: http://$TARGET_IP"
EOF < /dev/null