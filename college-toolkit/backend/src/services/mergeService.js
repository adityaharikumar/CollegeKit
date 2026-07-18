const PDFMerger = require('pdf-merger-js');
const fs = require('fs').promises;

async function mergePdfs(inputPaths, outputPath) {
  let originalSize = 0;
  for (const p of inputPaths) {
    const stat = await fs.stat(p);
    originalSize += stat.size;
  }

  try {
    const merger = new PDFMerger();
    for (const p of inputPaths) {
      await merger.add(p);
    }
    await merger.save(outputPath);

    const outStat = await fs.stat(outputPath);
    const processedSize = outStat.size;

    return {
      outputPath,
      originalSize,
      processedSize
    };
  } catch (error) {
    throw new Error(`PDF Merge error: ${error.message}`);
  }
}

module.exports = { mergePdfs };
