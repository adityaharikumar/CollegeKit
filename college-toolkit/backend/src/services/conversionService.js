const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

async function convertToPdf(inputPath, outDir, outputFilename) {
  const stat = await fs.stat(inputPath);
  const originalSize = stat.size;

  try {
    await execAsync(`soffice --headless --convert-to pdf --outdir "${outDir}" "${inputPath}"`);
    
    // libreoffice outputs to same name with .pdf extension
    const baseName = path.parse(inputPath).name;
    const defaultOutput = path.join(outDir, `${baseName}.pdf`);
    const outputPath = path.join(outDir, outputFilename);
    
    await fs.rename(defaultOutput, outputPath);

    const outStat = await fs.stat(outputPath);
    const processedSize = outStat.size;

    return {
      outputPath,
      originalSize,
      processedSize
    };
  } catch (error) {
    throw new Error(`LibreOffice error: ${error.message}`);
  }
}

module.exports = { convertToPdf };
