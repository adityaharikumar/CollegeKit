const { pool } = require('../config/db');

class Job {
  static async createJob(jobData) {
    const { id, originalFilename, operation, status, originalSize } = jobData;
    const result = await pool.query(
      `INSERT INTO jobs (id, original_filename, operation, status, original_size)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, originalFilename, operation, status, originalSize]
    );
    return result.rows[0];
  }

  static async updateJob(id, updateData) {
    const { status, processedSize, compressionRatio, outputFilename, errorMessage } = updateData;
    let query = 'UPDATE jobs SET status = $1';
    const values = [status, id];
    let count = 3;

    if (processedSize !== undefined) {
      query += `, processed_size = $${count++}`;
      values.push(processedSize);
    }
    if (compressionRatio !== undefined) {
      query += `, compression_ratio = $${count++}`;
      values.push(compressionRatio);
    }
    if (outputFilename !== undefined) {
      query += `, output_filename = $${count++}`;
      values.push(outputFilename);
    }
    if (errorMessage !== undefined) {
      query += `, error_message = $${count++}`;
      values.push(errorMessage);
    }
    if (status === 'completed' || status === 'failed') {
      query += `, completed_at = NOW()`;
    }

    query += ' WHERE id = $2 RETURNING *';

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getJobById(id) {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getAnalytics() {
    const totalJobsResult = await pool.query('SELECT COUNT(*) FROM jobs');
    const bytesSavedResult = await pool.query('SELECT SUM(original_size - COALESCE(processed_size, 0)) as saved FROM jobs WHERE status = $1', ['completed']);
    const avgCompressionResult = await pool.query('SELECT AVG(compression_ratio) as avg_ratio FROM jobs WHERE operation = $1 AND status = $2', ['compress', 'completed']);
    const operationsResult = await pool.query('SELECT operation, COUNT(*) FROM jobs GROUP BY operation');

    const totalJobs = parseInt(totalJobsResult.rows[0].count, 10);
    const totalBytesSaved = parseInt(bytesSavedResult.rows[0].saved || '0', 10);
    const avgCompressionRatio = parseFloat(avgCompressionResult.rows[0].avg_ratio || '0');
    
    const jobsByOperation = {};
    operationsResult.rows.forEach(row => {
      jobsByOperation[row.operation] = parseInt(row.count, 10);
    });

    return {
      totalJobs,
      totalBytesSaved,
      avgCompressionRatio,
      jobsByOperation
    };
  }
}

module.exports = Job;
