const { Worker } = require('bullmq');
const { redisConnection } = require('./config/redis');
const JobModel = require('./models/Job');
const { compressPdf } = require('./services/compressionService');
const { convertToPdf } = require('./services/conversionService');
const { mergePdfs } = require('./services/mergeService');
const path = require('path');
const { initDB } = require('./config/db');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

async function processJob(job) {
  const { jobId, operation, originalFilename } = job.data;
  
  await JobModel.updateJob(jobId, { status: 'processing' });

  const outputFilename = `${jobId}.pdf`;
  const outputPath = path.join(uploadDir, outputFilename);
  let result;

  try {
    if (operation === 'compress') {
      result = await compressPdf(job.data.filePath, outputPath);
    } else if (operation === 'convert' || operation === 'img2pdf') {
      result = await convertToPdf(job.data.filePath, uploadDir, outputFilename);
    } else if (operation === 'merge') {
      result = await mergePdfs(job.data.filePaths, outputPath);
    } else {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    await JobModel.updateJob(jobId, {
      status: 'completed',
      processedSize: result.processedSize,
      compressionRatio: result.compressionRatio || null,
      outputFilename
    });

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    await JobModel.updateJob(jobId, {
      status: 'failed',
      errorMessage: error.message
    });
    throw error;
  }
}

async function startWorker() {
  await initDB();
  
  const worker = new Worker('file-processing', processJob, {
    connection: redisConnection,
    concurrency: 2
  });

  worker.on('completed', job => {
    console.log(`Job with id ${job.id} has completed`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job with id ${job.id} has failed with ${err.message}`);
  });

  console.log('Worker started');
}

startWorker().catch(console.error);
