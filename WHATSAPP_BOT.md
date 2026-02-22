# 🤖 WhatsApp Bot - Niñamar

## Descripción

Bot de WhatsApp integrado con la tienda de Niñamar. Permite a los clientes:

- 📖 **Explorar el catálogo** de productos por categorías
- 🛒 **Agregar al carrito** y hacer pedidos directamente
- 📦 **Consultar estado** de pedidos existentes
- 📄 **Recibir el catálogo PDF** completo

## Configuración

### 1. Variables de Entorno

Agregar estas variables a `.env.local` y en Vercel:

```env
# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_VERIFY_TOKEN=un_token_secreto_que_tu_elijas

# URL del sitio (ya debería existir)
NEXT_PUBLIC_SITE_URL=https://niñamar.com
```

### 2. Tabla en Supabase

Ejecutar el SQL de migración en el **SQL Editor** de Supabase:

```
scripts/whatsapp-sessions-migration.sql
```

### 3. Configurar Meta Business

#### a) Crear App en Meta Developers

1. Ir a [developers.facebook.com](https://developers.facebook.com)
2. Crear una nueva app → Tipo: **Business**
3. Agregar el producto **WhatsApp**

#### b) Obtener credenciales

1. En la sección WhatsApp → **API Setup**:
   - Copiar el **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - Copiar el **Temporary Access Token** → `WHATSAPP_ACCESS_TOKEN`
   
2. Para producción, generar un **Permanent Token**:
   - Ir a Business Settings → System Users
   - Crear un System User con acceso a la app
   - Generar token con permiso `whatsapp_business_messaging`

#### c) Configurar Webhook

1. En WhatsApp → **Configuration** → Webhook:
   - **Callback URL**: `https://niñamar.com/api/whatsapp`
   - **Verify Token**: El mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`
   - **Suscripciones**: Marcar `messages`

2. Después de verificar, suscribirse al campo **messages**

### 4. Verificar número de WhatsApp

1. En **API Setup**, registrar tu número de teléfono real de negocio
2. Verificar con código SMS
3. Configurar el perfil de WhatsApp Business (nombre, foto, descripción)

## Flujo del Bot

```
Hola / Menú
    ├── 📖 Ver Catálogo → Lista de productos → Detalle → Agregar al carrito
    ├── 🏷️ Ver Categorías → Productos por categoría → Detalle → Agregar
    ├── 🛒 Mi Carrito → Ver resumen → Hacer pedido / Vaciar
    ├── 📦 Seguir Pedido → Ingresar # orden + email → Ver estado
    ├── 📄 Catálogo PDF → Envía el PDF del catálogo
    └── 🌐 Visitar Web → Link a niñamar.com
```

## Flujo de Checkout

```
Hacer Pedido
    ├── 1/6: Nombre completo
    ├── 2/6: Email
    ├── 3/6: Cédula
    ├── 4/6: Departamento
    ├── 5/6: Ciudad
    ├── 6/6: Dirección
    └── Confirmar → Crear orden en Supabase
```

## Archivos del Sistema

```
app/api/whatsapp/route.ts        → Webhook (GET verificación + POST mensajes)
lib/whatsapp/client.ts           → API client WhatsApp Cloud
lib/whatsapp/handler.ts          → Flujo de conversación principal
lib/whatsapp/session.ts          → Gestión de sesiones (Supabase)
lib/whatsapp/catalog.ts          → Consultas de productos/categorías
lib/whatsapp/orders.ts           → Crear órdenes y consultar estado
scripts/whatsapp-sessions-migration.sql → Migración de Supabase
```

## Comandos Globales

Los usuarios pueden escribir estos comandos en cualquier momento:

| Comando | Acción |
|---------|--------|
| `hola` / `menu` | Volver al menú principal |
| `carrito` | Ver el carrito |
| `cancelar` | Cancelar operación actual |

## Notas

- Las sesiones expiran después de **30 minutos** de inactividad
- Los datos del cliente se recuerdan entre sesiones
- El carrito se limpia al completar un pedido o al expirar la sesión
- Se pueden mostrar máximo **10 productos por sección** en listas de WhatsApp
- Los botones soportan máximo **3 opciones** y **20 caracteres** por botón
