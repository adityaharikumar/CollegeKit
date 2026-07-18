const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const { fileProcessingQueue } = require('../config/redis');
const path = require('path');

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { operation } = req.body;
    if (!['compress', 'convert', 'img2pdf'].includes(operation)) {
      return res.status(400).json({ error: 'Invalid operation. Use compress, convert, or img2pdf.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Ensure operation matches file type
    if (operation === 'compress' && ext !== '.pdf') {
      return res.status(400).json({ error: 'Compress operation only supports PDF files.' });
    }
    if (operation === 'convert' && !['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'].includes(ext)) {
      return res.status(400).json({ error: 'Convert operation only supports office documents (DOCX, PPTX, XLSX).' });
    }
    if (operation === 'img2pdf' && !['.jpg', '.jpeg', '.png'].includes(ext)) {
      return res.status(400).json({ error: 'Image to PDF operation only supports images (JPG, PNG).' });
    }

    const jobId = uuidv4();
    const originalSize = req.file.size;
    const originalFilename = req.file.originalname;
    
    await Job.createJob({
      id: jobId,
      originalFilename,
      operation,
      status: 'queued',
      originalSize
    });

    await fileProcessingQueue.add(operation, {
      jobId,
      filePath: req.file.path,
      operation,
      originalFilename
    });

    res.status(202).json({ jobId, message: 'File uploaded and job queued successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleMergeUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least two files are required for merging' });
    }

    const jobId = uuidv4();
    const originalSize = req.files.reduce((acc, file) => acc + file.size, 0);
    const originalFilename = 'merged.pdf';
    const operation = 'merge';

    await Job.createJob({
      id: jobId,
      originalFilename,
      operation,
      status: 'queued',
      originalSize
    });

    await fileProcessingQueue.add(operation, {
      jobId,
      filePaths: req.files.map(f => f.path),
      operation,
      originalFilename
    });

    res.status(202).json({ jobId, message: 'Files uploaded and merge job queued successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const response = {
      id: job.id,
      status: job.status,
      operation: job.operation,
      originalFilename: job.original_filename,
      originalSize: job.original_size,
    };

    if (job.status === 'completed') {
      response.processedSize = job.processed_size;
      response.compressionRatio = job.compression_ratio;
      response.downloadUrl = `/api/download/${job.id}`;
    } else if (job.status === 'failed') {
      response.error = job.error_message;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleUpload,
  handleMergeUpload,
  getJobStatus
};
