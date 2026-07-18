const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const { startCleanupCron } = require('./cleanup');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/api', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  await initDB();
  startCleanupCron();
  
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
