const fs = require('fs');
const path = require('path');
const pdf = require('pdf-img-convert');

const pdfPath = path.join(__dirname, 'assets', 'template.pdf');
const outputDir = path.join(__dirname, 'assets', 'slides');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Extracting images from ${pdfPath} to ${outputDir}...`);

pdf.convert(pdfPath).then(function (outputImages) {
    for (let i = 0; i < outputImages.length; i++) {
        fs.writeFileSync(path.join(outputDir, `slide_${i + 1}.png`), outputImages[i]);
    }
    console.log(`Successfully extracted ${outputImages.length} images.`);
}).catch(function (error) {
    console.error("Error extracting images:", error);
});
