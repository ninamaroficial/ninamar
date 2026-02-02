# Sistema de Newsletter Mejorado - Niñamar

## 🎉 Nuevas Características

El sistema de newsletter ha sido completamente renovado con capacidades profesionales de edición y envío de correos, con la identidad visual de Niñamar.

### ✨ Editor Visual (WYSIWYG)

**Ubicación**: `components/admin/NewsletterEditor.tsx`

- **Modo Visual**: Edita el contenido como en Word, con formato en tiempo real
- **Modo HTML**: Para usuarios avanzados que quieran editar el código directamente
- **Barra de herramientas completa**:
  - Negrita, cursiva, subrayado
  - Títulos y párrafos
  - **Insertar imágenes**:
    - 📤 **Subir desde PC** (JPG, PNG, GIF, WEBP - hasta 5MB)
    - 🔗 Insertar desde URL externa
  - Insertar enlaces
  - Botones CTA personalizables con estilo Niñamar
  - Divisores con colores de la marca

### 🎨 Plantilla de Email con Identidad Niñamar

**Colores y Diseño**:
- **Borde superior decorativo** con degradado de colores (#ffb3f9 → #ff8bf5 → #ffdb31)
- **Header** con logo en marco decorativo con borde degradado
- **Títulos** con efecto de texto degradado en colores de marca
- **Botones CTA** con degradado rosa (#ffb3f9 → #ff8bf5) y sombra
- **Bordes laterales** de colores en el contenido (rosa y amarillo)
- **Footer** con fondo degradado suave y bordes de colores
- **Decoración** con emojis (✨ 💖 🌈 ✨)
- **Responsive** - se adapta perfectamente a móviles

### 📸 Sistema de Carga de Imágenes

**Ubicación**: `app/api/admin/newsletter/upload-image/route.ts`

- Subir imágenes directamente desde tu PC
- Validación automática de tipo y tamaño
- Almacenamiento local en `/public/uploads/newsletter/`
- URLs generadas automáticamente
- Nombres únicos con timestamp
- Máximo 5MB por imagen
- Formatos soportados: JPG, PNG, GIF, WEBP

### 👥 Selector de Destinatarios

**Ubicación**: `components/admin/RecipientSelector.tsx`

- **3 Modos de envío**:
  1. **Suscriptores Activos**: Solo usuarios activos (opción por defecto)
  2. **Todos los Suscriptores**: Incluye activos e inactivos
  3. **Selección Manual**: Elige destinatarios específicos uno por uno
  
- **Búsqueda**: Filtra suscriptores por email o nombre
- **Acciones masivas**: Seleccionar/Deseleccionar todos

### 🎨 Vista Previa en Tiempo Real

- **Vista previa instantánea**: Ve cómo se verá el email antes de enviarlo
- **Modal de preview**: Visualización en pantalla completa del email renderizado
- **Plantilla profesional**: Diseño responsive con el branding de Niñamar

### 📧 Plantilla de Email Mejorada

**Ubicación**: `emails/templates/NewsletterTemplate.tsx`

- Construida con React Email para máxima compatibilidad
- Diseño responsive (se ve bien en móviles y desktop)
- Header con logo de Niñamar
- Botón CTA personalizable
- Footer con información de la marca
- Link de "Cancelar suscripción" incluido

### 🔧 API Actualizada

**Ubicación**: `app/api/admin/newsletter/send/route.ts`

- Soporta envío a destinatarios específicos
- Envío por lotes para evitar límites de rate limiting
- Mejor manejo de errores
- Tracking de envíos exitosos y fallidos

## 📱 Cómo Usar

### 1. Acceder al Newsletter
Ve a `/admin/newsletter` desde el panel de administración

### 2. Crear el Contenido
1. **Asunto**: Escribe el asunto del email (obligatorio)
2. **Preheader**: Texto de vista previa (opcional, aparece junto al asunto)
3. **Contenido**: Usa el editor visual para crear tu mensaje:
   - Escribe directamente o usa la barra de herramientas
   - Agrega imágenes, enlaces y botones según necesites
   - Cambia entre modo visual y HTML cuando quieras

### 3. Configurar el CTA (Botón)
- **Texto del Botón**: Por ejemplo "Ver Ofertas 💫"
- **URL del Botón**: A dónde lleva el botón, ej: https://niñamar.com/productos
- El botón tendrá automáticamente el estilo degradado de Niñamar

### 4. Agregar Imágenes
1. Haz clic en el botón de imagen (📷) en la barra de herramientas
2. Tienes dos opciones:
   - **Subir desde PC**: Arrastra y suelta o haz clic para seleccionar
   - **URL externa**: Pega la URL de una imagen de internet
3. Las imágenes se insertarán con bordes decorativos de Niñamar
4. Se redimensionan automáticamente para verse bien en todos los dispositivos

### 5. Seleccionar Destinatarios
1. Elige el tipo de destinatarios:
   - **Activos** (recomendado): Solo usuarios que aceptaron recibir emails
   - **Todos**: Incluye usuarios inactivos
   - **Manual**: Selecciona específicamente quién recibirá el email

2. Si elegiste "Manual":
   - Busca suscriptores por email o nombre
   - Haz clic en cada uno para seleccionarlo
   - Usa "Seleccionar Todos" o "Deseleccionar Todos" para operaciones masivas

### 6. Vista Previa
- Haz clic en el botón "Preview" en el editor para ver cómo se verá el email
- **Verás la plantilla con todos los colores y estilos de Niñamar**
- Revisa que todo se vea correcto antes de enviar

### 7. Enviar
- Revisa el resumen de destinatarios
- Haz clic en "Enviar Newsletter"
- Confirma el envío
- Espera a que se complete (verás un spinner mientras se envía)

## 🎯 Buenas Prácticas

1. **Siempre usa vista previa** antes de enviar
2. **Prueba con emails de prueba** primero (usa selección manual)
3. **Escribe asuntos atractivos** pero honestos
4. **Mantén el contenido conciso** y visualmente atractivo
5. **Incluye siempre un CTA claro** (botón)
6. **Revisa la ortografía** antes de enviar

## 🛠️ Componentes Técnicos

### Dependencias Nuevas
```json
{
  "react-email": "^2.x",
  "@react-email/components": "^0.x",
  "@react-email/render": "^0.x"
}
```

### Estructura de Archivos
```
components/admin/
  ├── NewsletterEditor.tsx          # Editor WYSIWYG
  ├── NewsletterEditor.module.css
  ├── RecipientSelector.tsx         # Selector de destinatarios
  └── RecipientSelector.module.css

emails/templates/
  └── NewsletterTemplate.tsx        # Plantilla de email

app/admin/(dashboard)/newsletter/
  ├── page.tsx                      # Página principal (renovada)
  └── page.module.css

app/api/admin/newsletter/
  └── send/route.ts                 # API de envío (actualizada)
```

## 🚀 Próximas Mejoras Sugeridas

1. **Guardar borradores**: Guardar newsletters sin enviar
2. **Plantillas guardadas**: Crear y reutilizar plantillas
3. **Historial de envíos**: Ver newsletters enviadas anteriormente
4. **Analytics**: Rastrear aperturas y clicks
5. **Programar envíos**: Enviar newsletters en fecha/hora específica
6. **A/B Testing**: Probar diferentes versiones

---

**Creado para Niñamar** - Sistema de Newsletter Profesional 💌
