const { execFile } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const execFileAsync = util.promisify(execFile);

async function compressPdf(inputPath, outputPath) {
  const stat = await fs.stat(inputPath);
  const originalSize = stat.size;

  try {
    await execFileAsync('gs', [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/ebook',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath
    ]);

    const outStat = await fs.stat(outputPath);
    const processedSize = outStat.size;
    const compressionRatio = processedSize / originalSize;

    return {
      outputPath,
      originalSize,
      processedSize,
      compressionRatio
    };
  } catch (error) {
    throw new Error(`Ghostscript error: ${error.message}`);
  }
}

module.exports = { compressPdf };
