# Script para actualizar el perfil de WhatsApp Business
# Ejecutar: .\update-whatsapp-profile.ps1

Write-Host "🔧 ACTUALIZAR PERFIL DE WHATSAPP BUSINESS" -ForegroundColor Cyan
Write-Host ""

# ========== CONFIGURACIÓN ==========
# 1. Obtén tu token de admin:
#    - Abre http://localhost:3000/admin/settings
#    - Presiona F12 -> Application/Aplicación -> Cookies
#    - Copia el valor de "admin-token"

$adminToken = Read-Host "Pega tu admin-token aquí"

# 2. URL del logo (debe ser pública y accesible desde internet)
$logoUrl = Read-Host "URL de la imagen del logo (ej: https://ninamar.com/logo.png)"

# ========== DATOS DEL PERFIL ==========
$body = @{
    about = "Niñamar"
    description = "Accesorios personalizados hechos a mano con amor 💜"
    email = "contacto@ninamar.com"
    websites = "https://ninamar.com"
    profilePictureUrl = $logoUrl
} | ConvertTo-Json

Write-Host ""
Write-Host "📋 Datos a enviar:" -ForegroundColor Green
Write-Host $body
Write-Host ""

# ========== ENVIAR PETICIÓN ==========
$confirm = Read-Host "¿Confirmar actualización? (s/n)"

if ($confirm -eq "s" -or $confirm -eq "S") {
    Write-Host "⏳ Enviando petición..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/admin/whatsapp/profile" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Cookie" = "admin-token=$adminToken"
            } `
            -Body $body
        
        Write-Host "✅ ¡Perfil actualizado correctamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Respuesta del servidor:" -ForegroundColor Cyan
        Write-Host $response.Content
        Write-Host ""
        Write-Host "⏰ Nota: Los cambios pueden tardar hasta 24 horas en reflejarse en WhatsApp" -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Error al actualizar el perfil" -ForegroundColor Red
        Write-Host $_.Exception.Message
        Write-Host ""
        Write-Host "Respuesta del servidor:" -ForegroundColor Yellow
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host $reader.ReadToEnd()
        }
    }
} else {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
}
