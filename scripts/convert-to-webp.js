// Script para convertir imágenes JPG/PNG a WebP con alta calidad
// Mantiene la calidad visual pero reduce el tamaño del archivo

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const carouselDir = path.join(__dirname, '../public/carousel');
const carouselMobileDir = path.join(__dirname, '../public/carousel/mobile');

async function convertToWebP(inputPath, outputPath, quality = 95) {
  try {
    await sharp(inputPath)
      .webp({ 
        quality: quality,
        effort: 6, // Máximo esfuerzo para mejor compresión
        lossless: false,
        nearLossless: false
      })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    console.log(`   ${(inputStats.size / 1024).toFixed(0)} KB → ${(outputStats.size / 1024).toFixed(0)} KB (${reduction}% reducción)`);
    
    // Eliminar el archivo original después de convertir exitosamente
    fs.unlinkSync(inputPath);
    console.log(`   🗑️  Eliminado: ${path.basename(inputPath)}\n`);
    
  } catch (error) {
    console.error(`❌ Error convirtiendo ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir, quality = 95) {
  console.log(`\n📁 Procesando: ${dir}\n`);
  
  const files = fs.readdirSync(dir);
  let converted = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    // Solo procesar JPG y PNG
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      
      // Solo convertir si no existe el WebP o si el original es más nuevo
      if (!fs.existsSync(outputPath) || fs.statSync(inputPath).mtime > fs.statSync(outputPath).mtime) {
        await convertToWebP(inputPath, outputPath, quality);
        converted++;
      }
    }
  }
  
  if (converted === 0) {
    console.log('✅ Todas las imágenes ya están optimizadas\n');
  }
}

async function main() {
  console.log('🎨 Optimizando imágenes del carrusel...\n');
  
  // Convertir imágenes de escritorio con calidad 95
  if (fs.existsSync(carouselDir)) {
    await processDirectory(carouselDir, 95);
  }
  
  // Convertir imágenes móviles con calidad 90 (son más pequeñas)
  if (fs.existsSync(carouselMobileDir)) {
    await processDirectory(carouselMobileDir, 90);
  }
  
  console.log('✨ Optimización completada!');
}

main();
