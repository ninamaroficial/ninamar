
# Test new chat notification feature
# This script simulates a WhatsApp webhook with a new customer

Write-Host "🧪 Testing new chat notification..." -ForegroundColor Cyan
Write-Host "Waiting for server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Use a different phone number that doesn't exist in the database yet
$NewPhone = "573109999999"  # Test phone number - cambia esto cada vez para probar con un numero "nuevo"
$WebhookUrl = "http://localhost:3000/api/whatsapp"

# Get current timestamp
$Timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$Nanoseconds = (Get-Date).Ticks % 1000000

# Test payload - simulating a message from a new customer
$Payload = @{
    object = "whatsapp_business_account"
    entry = @(
        @{
            id = "123456789"
            changes = @(
                @{
                    field = "messages"
                    value = @{
                        messaging_product = "whatsapp"
                        metadata = @{
                            display_phone_number = "573001234567"
                            phone_number_id = "123456789"
                        }
                        contacts = @(
                            @{
                                profile = @{
                                    name = "Juan Test"
                                }
                                wa_id = $NewPhone
                            }
                        )
                        messages = @(
                            @{
                                from = $NewPhone
                                id = "wamid.test.$Timestamp$Nanoseconds"
                                timestamp = $Timestamp
                                type = "text"
                                text = @{
                                    body = "Hola! Quiero conocer vuestros productos"
                                }
                            }
                        )
                    }
                }
            )
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "📤 Sending test webhook with new phone: $NewPhone" -ForegroundColor Green
Write-Host "📝 Payload:" -ForegroundColor Yellow
$Payload | ConvertFrom-Json | ConvertTo-Json | Write-Host
Write-Host ""

# Send the webhook
try {
    $Response = Invoke-WebRequest -Uri $WebhookUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $Payload `
        -UseBasicParsing

    Write-Host "📥 Response:" -ForegroundColor Green
    Write-Host $Response.Content
    Write-Host ""
} catch {
    Write-Host "❌ Error sending webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
}

Write-Host "✅ Test completed! Check the server logs for notification activity." -ForegroundColor Green
Write-Host "The admin should receive a message about a new chat from: Juan Test ($NewPhone)" -ForegroundColor Cyan
