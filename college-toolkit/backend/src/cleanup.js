const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const retentionMinutes = parseInt(process.env.FILE_RETENTION_MINUTES || '60', 10);

const startCleanupCron = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running cleanup task...');
    try {
      const files = await fs.readdir(uploadDir);
      const now = Date.now();
      
      let deletedCount = 0;
      for (const file of files) {
        if (file === '.gitkeep') continue; // Optional: protect certain files
        
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        
        const fileAgeMinutes = (now - stats.mtimeMs) / (1000 * 60);
        
        if (fileAgeMinutes > retentionMinutes) {
          await fs.unlink(filePath);
          console.log(`Deleted file: ${file}`);
          deletedCount++;
        }
      }
      
      console.log(`Cleanup finished. Deleted ${deletedCount} files.`);
    } catch (error) {
      console.error('Error during cleanup task:', error);
    }
  });
  console.log('Cleanup cron job scheduled (runs every 30 minutes)');
};

module.exports = { startCleanupCron };
