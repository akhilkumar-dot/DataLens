const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// GET /api/jobs/:id — Return job status + insights
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const response = {
      jobId: job.jobId,
      status: job.status,
      filename: job.filename,
      rowCount: job.rowCount,
      columns: job.columns,
      preview: job.preview,
      createdAt: job.createdAt,
    };

    if (job.status === 'done') {
      response.insights = job.insights;
      response.chartData = job.chartData;
    }

    if (job.status === 'failed') {
      response.error = job.error;
    }

    res.json(response);
  } catch (err) {
    console.error('Job lookup error:', err);
    res.status(500).json({ error: 'Failed to retrieve job' });
  }
});

// GET /api/history — Return last 10 jobs for the authenticated user
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const jobs = await Job.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('jobId filename status rowCount columns createdAt');

    res.json(jobs);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

module.exports = router;
