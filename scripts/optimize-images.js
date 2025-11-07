const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Images to convert to WebP (largest ones that need optimization)
const imagesToOptimize = [
  'background_peony-petals.png',     // 1MB
  'Persian-Buttercup-scaled.jpg',    // 724KB
  'loading_peony.png',                // 644KB
  'academy-dara.png',                 // 436KB
  'about-header.png',                 // 424KB
  'dara-about.jpeg',                  // 400KB
  'dara-about.jpg',                   // 372KB
  'sunflower.png',                    // 312KB
  'peak-though.jpeg',                 // 312KB
  'vidimgtn4.png',                    // 192KB
  'aca-imgright.png',                 // 168KB
  'eucasprigtn.png',                  // 164KB
  'fullblorosetn.png',                // 156KB
  'blooming-pic.jpeg',                // 148KB
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  for (const imageName of imagesToOptimize) {
    const inputPath = path.join(publicDir, imageName);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${imageName} - file not found`);
      continue;
    }
    
    const outputName = imageName.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const outputPath = path.join(publicDir, outputName);
    
    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSize = (originalStats.size / 1024).toFixed(2);
      
      // Convert to WebP with quality 85
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      // Get new file size
      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024).toFixed(2);
      const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
      
      console.log(`✅ ${imageName} → ${outputName}`);
      console.log(`   ${originalSize}KB → ${newSize}KB (${savings}% smaller)\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${imageName}:`, error.message);
    }
  }
  
  console.log('✅ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update your code to use .webp versions');
  console.log('   2. Keep original files as fallbacks');
  console.log('   3. Test the images on your site');
}

optimizeImages();

