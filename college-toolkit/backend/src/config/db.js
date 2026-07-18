const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'toolkit',
  password: process.env.DB_PASSWORD || 'toolkit123',
  database: process.env.DB_NAME || 'college_toolkit',
});

const initDB = async (retries = 10, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS jobs (
            id UUID PRIMARY KEY,
            original_filename VARCHAR NOT NULL,
            operation VARCHAR NOT NULL,
            status VARCHAR NOT NULL,
            original_size BIGINT NOT NULL,
            processed_size BIGINT,
            compression_ratio FLOAT,
            output_filename VARCHAR,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
          )
        `);
        console.log('Database initialized');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.log(`Database connection attempt ${attempt}/${retries} failed. Retrying in ${delay / 1000}s...`);
      if (attempt === retries) {
        console.error('Could not connect to database after all retries:', err.message);
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
  pool,
  initDB,
};
