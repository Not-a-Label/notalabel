#!/bin/bash

# DNS Update Script for not-a-label.art
# This script updates DNS records to point to the new production server

DOMAIN="not-a-label.art"
NEW_IP="159.89.247.208"
OLD_IP="147.182.252.146"

echo "🌐 DNS Update Script for $DOMAIN"
echo "================================"
echo "Current IP: $OLD_IP"
echo "Target IP: $NEW_IP"
echo ""

# Check current DNS resolution
echo "📍 Current DNS resolution:"
dig +short $DOMAIN @8.8.8.8
echo ""

# Instructions for manual update
echo "📝 Manual DNS Update Instructions:"
echo "1. Log in to your DNS provider (DigitalOcean, Cloudflare, etc.)"
echo "2. Navigate to DNS management for $DOMAIN"
echo "3. Update the following records:"
echo "   - A record: @ → $NEW_IP"
echo "   - A record: www → $NEW_IP"
echo "4. Delete any A records pointing to $OLD_IP"
echo ""

# If you have DigitalOcean API token
if [ ! -z "$DO_API_TOKEN" ]; then
    echo "🔧 Attempting automatic DNS update via DigitalOcean API..."
    
    # Get current DNS records
    RECORDS=$(curl -s -X GET "https://api.digitalocean.com/v2/domains/$DOMAIN/records" \
        -H "Authorization: Bearer $DO_API_TOKEN" \
        -H "Content-Type: application/json")
    
    # Update A records
    echo "$RECORDS" | jq -r '.domain_records[] | select(.type == "A") | .id' | while read RECORD_ID; do
        curl -X PUT "https://api.digitalocean.com/v2/domains/$DOMAIN/records/$RECORD_ID" \
            -H "Authorization: Bearer $DO_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"data\": \"$NEW_IP\"}"
        echo "Updated record ID: $RECORD_ID"
    done
    
    echo "✅ DNS update request sent!"
else
    echo "ℹ️  To enable automatic DNS updates, set DO_API_TOKEN environment variable"
fi

echo ""
echo "🔍 Monitor DNS propagation:"
echo "- https://dnschecker.org/#A/$DOMAIN"
echo "- https://www.whatsmydns.net/#A/$DOMAIN"
echo ""
echo "⏱️  DNS propagation typically takes 15 minutes to 48 hours"
echo "🔐 SSL certificate will auto-install once DNS propagates to $NEW_IP"