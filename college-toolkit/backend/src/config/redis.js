const { Redis } = require('ioredis');
const { Queue } = require('bullmq');

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const fileProcessingQueue = new Queue('file-processing', { connection });

module.exports = {
  redisConnection: connection,
  fileProcessingQueue,
};
