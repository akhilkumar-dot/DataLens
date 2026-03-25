const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const Job = require('../models/Job');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

function startWorker() {
  const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    'insights',
    async (bullJob) => {
      const { jobId } = bullJob.data;
      console.log(`🔄 Processing job: ${jobId}`);

      // Update status to processing
      const job = await Job.findOne({ jobId });
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      job.status = 'processing';
      await job.save();

      try {
        // Call Python AI service
        const response = await axios.post(`${AI_SERVICE_URL}/ai/insights`, {
          schema: job.columns,
          preview: job.rawData.slice(0, 500),
          instruction: 'analyze',
          filename: job.filename,
          rowCount: job.rowCount,
        }, {
          timeout: 60000, // 60 second timeout for LLM calls
        });

        const insights = response.data;

        // Write insights back to MongoDB
        job.insights = {
          summary: insights.summary || '',
          trends: insights.trends || [],
          anomalies: (insights.anomalies || []).map((a) =>
            typeof a === 'string'
              ? { description: a, severity: 'medium' }
              : a
          ),
          recommendations: insights.recommendations || [],
        };
        job.status = 'done';
        await job.save();

        console.log(`✅ Job complete: ${jobId}`);
      } catch (err) {
        console.error(`❌ Job failed: ${jobId}`, err.message);
        job.status = 'failed';
        job.error = err.response?.data?.error || err.message;
        await job.save();
        throw err; // Let BullMQ handle retry
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`💀 Job ${job?.data?.jobId} failed permanently:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`🎉 Job ${job.data.jobId} completed successfully`);
  });

  return worker;
}

module.exports = { startWorker };
