// Script para eliminar archivos JPG/PNG originales si existe su versión WebP
const fs = require('fs');
const path = require('path');

const carouselDir = path.join(__dirname, '../public/carousel');
const carouselMobileDir = path.join(__dirname, '../public/carousel/mobile');

function cleanupDirectory(dir) {
  console.log(`\n📁 Limpiando: ${dir}\n`);
  
  const files = fs.readdirSync(dir);
  let deleted = 0;
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    
    // Buscar JPG y PNG
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const originalPath = path.join(dir, file);
      const webpPath = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      
      // Si existe el WebP correspondiente, eliminar el original
      if (fs.existsSync(webpPath)) {
        fs.unlinkSync(originalPath);
        console.log(`🗑️  Eliminado: ${file} (existe ${path.basename(webpPath)})`);
        deleted++;
      }
    }
  }
  
  if (deleted === 0) {
    console.log('✅ No hay archivos originales para eliminar\n');
  } else {
    console.log(`\n✨ ${deleted} archivo(s) eliminado(s)\n`);
  }
}

function main() {
  console.log('🧹 Eliminando archivos JPG/PNG originales...\n');
  
  if (fs.existsSync(carouselDir)) {
    cleanupDirectory(carouselDir);
  }
  
  if (fs.existsSync(carouselMobileDir)) {
    cleanupDirectory(carouselMobileDir);
  }
  
  console.log('✅ Limpieza completada!');
}

main();
