#!/bin/bash

# Test new chat notification feature
# This script simulates a WhatsApp webhook with a new customer

echo "🧪 Testing new chat notification..."
echo "Waiting for server to be ready..."
sleep 3

# Use a different phone number that doesn't exist in the database yet
NEW_PHONE="573109999999"  # Test phone number
WEBHOOK_URL="http://localhost:3000/api/whatsapp"

# Test payload - simulating a message from a new customer
PAYLOAD='{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "field": "messages",
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "573001234567",
              "phone_number_id": "123456789"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Juan Test"
                },
                "wa_id": "'$NEW_PHONE'"
              }
            ],
            "messages": [
              {
                "from": "'$NEW_PHONE'",
                "id": "wamid.test.'$(date +%s%N)'",
                "timestamp": "'$(date +%s)'",
                "type": "text",
                "text": {
                  "body": "Hola! Quiero conocer vuestros productos"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}'

echo ""
echo "📤 Sending test webhook with new phone: $NEW_PHONE"
echo "📝 Payload:"
echo "$PAYLOAD" | jq . 2>/dev/null || echo "$PAYLOAD"
echo ""

# Send the webhook
RESPONSE=$(curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -s)

echo "📥 Response:"
echo "$RESPONSE"
echo ""
echo "✅ Test completed! Check the server logs for notification activity."
echo "The admin should receive a message about a new chat from: Juan Test ($NEW_PHONE)"
