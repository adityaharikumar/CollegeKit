const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleUpload, handleMergeUpload, getJobStatus } = require('../controllers/uploadController');
const Job = require('../models/Job');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${ext}`), false);
  }
};

const mergeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF files are allowed for merging`), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) }
});

const uploadMerge = multer({
  storage,
  fileFilter: mergeFileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) }
});

router.post('/upload', upload.single('file'), handleUpload);
router.post('/merge', uploadMerge.array('files', 10), handleMergeUpload);
router.get('/status/:jobId', getJobStatus);
router.get('/download/:jobId', async (req, res) => {
  try {
    const job = await Job.getJobById(req.params.jobId);
    if (!job || job.status !== 'completed' || !job.output_filename) {
      return res.status(404).json({ error: 'File not ready or job not found' });
    }
    const filePath = path.join(uploadDir, job.output_filename);
    res.download(filePath, job.original_filename.replace(/\.[^/.]+$/, "") + "_processed.pdf");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
