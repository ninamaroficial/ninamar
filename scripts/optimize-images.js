const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputDir = path.join(__dirname, '../public/carousel/original')
const outputDir = path.join(__dirname, '../public/carousel')

// Crear carpetas si no existen
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function optimizeImages() {
  const files = fs.readdirSync(inputDir)
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      console.log(`Optimizando ${file}...`)
      
      const inputPath = path.join(inputDir, file)
      const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'))
      
      await sharp(inputPath)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(outputPath)
      
      console.log(`✅ ${file} optimizada`)
    }
  }
  
  console.log('🎉 Todas las imágenes optimizadas!')
}

optimizeImages().catch(console.error)