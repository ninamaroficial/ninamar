# 🖼️ Guía de Optimización Manual de Imágenes

## 📊 Estado Actual

Después de las optimizaciones automáticas, quedan algunas imágenes que se pueden comprimir manualmente para mejorar aún más el rendimiento.

---

## 🎯 Imágenes a Optimizar

### Prioridad 1: Imágenes del Carrusel

**Ubicación**: `/public/carousel/`

#### imagen-1.jpg
- **Peso actual**: ~185 KB
- **Ahorro potencial**: ~5.5 KB (según Lighthouse)
- **Recomendación**: Convertir a WebP con calidad 75-80

#### Cómo optimizar:

**Opción 1: Online (Más fácil)**
1. Ir a [Squoosh.app](https://squoosh.app/)
2. Subir `imagen-1.jpg`
3. Formato destino: **WebP**
4. Calidad: **75-80**
5. Descargar como `imagen-1.webp`
6. Reemplazar en `/public/carousel/`

**Opción 2: CLI (Más rápido para múltiples)**
```bash
# Instalar cwebp (solo una vez)
# Windows: descargar desde https://developers.google.com/speed/webp/download
# Mac: brew install webp
# Linux: sudo apt install webp

# Convertir imagen
cwebp -q 75 public/carousel/imagen-1.jpg -o public/carousel/imagen-1.webp
```

**Opción 3: TinyPNG (Muy fácil)**
1. Ir a [TinyPNG.com](https://tinypng.com/)
2. Subir todas las imágenes del carrusel
3. Descargar comprimidas
4. Reemplazar archivos

---

### Prioridad 2: Imágenes de Features

**Ubicación**: `/public/features/`

#### envioGratis.png
- **Peso actual**: ~17.3 KB
- **Dimensiones actuales**: 640x467
- **Dimensiones mostradas**: 240x175
- **Ahorro potencial**: ~14.9 KB

**Solución**:
```bash
# Redimensionar a tamaño real mostrado (desktop)
# Usar 2x para retina: 320x240 (más pequeño que 640x467)
```

#### perTotal.png
- **Peso actual**: ~14.9 KB
- **Dimensiones actuales**: 640x467
- **Dimensiones mostradas**: 240x175
- **Ahorro potencial**: ~12.8 KB

**Solución**: Igual que envioGratis.png

#### Cómo redimensionar:

**Opción 1: Squoosh.app**
1. Subir imagen
2. Resize → Width: 320, Height: 240
3. Format: WebP, Quality: 80
4. Descargar

**Opción 2: ImageMagick CLI**
```bash
# Instalar ImageMagick
# Windows: https://imagemagick.org/script/download.php
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Redimensionar y convertir
magick public/features/envioGratis.png -resize 320x240 -quality 80 public/features/envioGratis.webp
magick public/features/perTotal.png -resize 320x240 -quality 80 public/features/perTotal.webp
```

---

### Prioridad 3: Imágenes de Títulos (How It Works)

#### personalizalo.png
- **Peso actual**: ~26.9 KB
- **Dimensiones actuales**: 1184x864
- **Dimensiones mostradas**: 800x584
- **Ahorro potencial**: ~14.6 KB

#### como-funciona.png
- **Peso actual**: ~27.6 KB
- **Dimensiones actuales**: 1184x864
- **Dimensiones mostradas**: 847x618
- **Ahorro potencial**: ~13.5 KB

**Solución**: Redimensionar a tamaño mostrado + WebP

---

## 🛠️ Herramientas Recomendadas

### Online (Sin instalación)
1. **Squoosh.app** ⭐ (Mejor opción)
   - Gratis, open source de Google
   - Comparación visual lado a lado
   - Múltiples formatos (WebP, AVIF, etc.)
   - URL: https://squoosh.app/

2. **TinyPNG/TinyJPG**
   - Muy fácil de usar
   - Hasta 20 imágenes a la vez
   - URL: https://tinypng.com/

3. **Compressor.io**
   - Compresión sin pérdida
   - URL: https://compressor.io/

### Desktop Apps
1. **ImageOptim** (Mac)
   - Drag & drop
   - Gratis
   - URL: https://imageoptim.com/

2. **FileOptimizer** (Windows)
   - Múltiples formatos
   - Gratis
   - URL: https://sourceforge.net/projects/nikkhokkho/

### CLI Tools
1. **cwebp** (WebP)
   ```bash
   cwebp -q 80 input.jpg -o output.webp
   ```

2. **ImageMagick** (Todo en uno)
   ```bash
   magick input.png -resize 320x240 -quality 80 output.webp
   ```

---

## 📋 Checklist de Optimización Manual

### Paso 1: Backup
```bash
# Crear backup de imágenes originales
mkdir public/images-backup
cp -r public/carousel public/images-backup/
cp -r public/features public/images-backup/
cp -r public/hero/titles public/images-backup/
```

### Paso 2: Carrusel
- [ ] Convertir `imagen-1.jpg` a WebP (calidad 75-80)
- [ ] Convertir `imagen-2.jpg` a WebP (si existe)
- [ ] Convertir `imagen-3.jpg` a WebP (si existe)
- [ ] Actualizar código para usar `.webp`

### Paso 3: Features
- [ ] Redimensionar `envioGratis.png` a 320x240
- [ ] Convertir a WebP (calidad 80)
- [ ] Redimensionar `perTotal.png` a 320x240
- [ ] Convertir a WebP (calidad 80)
- [ ] Redimensionar `calidad2.png` a 320x240 (si existe)
- [ ] Convertir a WebP (calidad 80)
- [ ] Actualizar código para usar `.webp`

### Paso 4: Títulos
- [ ] Redimensionar `personalizalo.png` a 1000x730
- [ ] Convertir a WebP (calidad 85)
- [ ] Redimensionar `como-funciona.png` a 1000x730
- [ ] Convertir a WebP (calidad 85)
- [ ] Actualizar código para usar `.webp`

### Paso 5: Verificar
- [ ] Build de producción sin errores
- [ ] Imágenes se ven bien en localhost
- [ ] Desplegar y ejecutar Lighthouse

---

## 🔄 Actualizar Código para WebP

### Opción 1: Fallback Automático de Next.js
Next.js sirve automáticamente WebP si el navegador lo soporta. Solo necesitas:

```tsx
// ✅ Next.js detecta automáticamente .webp
<Image
  src="/carousel/imagen-1.webp"  // Cambiar extensión
  alt="..."
  fill
/>
```

### Opción 2: Picture Element (Fallback manual)
```tsx
<picture>
  <source srcSet="/carousel/imagen-1.webp" type="image/webp" />
  <img src="/carousel/imagen-1.jpg" alt="..." />
</picture>
```

---

## 📊 Ahorro Esperado Adicional

| Categoría | Peso Actual | Peso Optimizado | Ahorro |
|-----------|-------------|-----------------|--------|
| Carrusel | ~185 KB | ~100 KB | ~85 KB |
| Features | ~32 KB | ~15 KB | ~17 KB |
| Títulos | ~55 KB | ~30 KB | ~25 KB |
| **Total** | **~272 KB** | **~145 KB** | **~127 KB** |

Sumado a los 3.7 MB ya ahorrados: **Total acumulado: ~3.8 MB** 🎉

---

## ⚡ Script de Optimización Automática

Si quieres automatizar todo el proceso:

```bash
#!/bin/bash
# optimize-images.sh

echo "🖼️  Optimizando imágenes..."

# Crear backup
mkdir -p public/images-backup
cp -r public/carousel public/images-backup/
cp -r public/features public/images-backup/

# Optimizar carrusel
for img in public/carousel/*.jpg; do
  filename=$(basename "$img" .jpg)
  cwebp -q 75 "$img" -o "public/carousel/${filename}.webp"
  echo "✅ Optimizado: ${filename}.webp"
done

# Optimizar features (redimensionar + convertir)
magick public/features/envioGratis.png -resize 320x240 -quality 80 public/features/envioGratis.webp
magick public/features/perTotal.png -resize 320x240 -quality 80 public/features/perTotal.webp

echo "✅ Optimización completa!"
echo "📁 Backup en: public/images-backup/"
```

Ejecutar:
```bash
chmod +x optimize-images.sh
./optimize-images.sh
```

---

## 🎯 Prioridades

Si tienes poco tiempo, optimiza en este orden:

### Alta Prioridad (Máximo impacto)
1. ✅ **Texturas PNG → CSS** (HECHO - 3.5 MB ahorrados)
2. ⏭️ **Carrusel a WebP** (~85 KB ahorro)
3. ⏭️ **Features redimensionadas** (~17 KB ahorro)

### Media Prioridad
4. ⏭️ **Títulos redimensionados** (~25 KB ahorro)
5. ⏭️ **Ícono carrito** (HECHO - 10 KB ahorrados)

### Baja Prioridad
6. ⏭️ **Otras imágenes decorativas**

---

## ✨ Resultado Final Esperado

Después de aplicar todas estas optimizaciones manuales:

| Métrica | Valor Esperado |
|---------|----------------|
| **Performance** | 95+ 🎯 |
| **CLS** | < 0.05 |
| **Speed Index** | < 2.0s |
| **Total Transfer** | -3.8 MB |
| **HTTP Requests** | -2 |

---

**Nota**: Las optimizaciones automáticas ya aplicadas son suficientes para alcanzar Performance 90+. Estas optimizaciones manuales son para llegar a 95+ si lo deseas.

**Fecha**: ${new Date().toLocaleDateString('es-CO')}
