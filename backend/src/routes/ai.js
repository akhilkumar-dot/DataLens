const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/chat', async (req, res) => {
  try {
    const { deepMemory, userId, ...rest } = req.body;
    let historical_context = '';

    if (deepMemory && userId) {
      const Job = require('../models/Job');
      const pastJobs = await Job.find({ userId, status: 'done' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      if (pastJobs.length > 0) {
        historical_context = pastJobs.map(job => {
          return `File: ${job.filename}\nSummary: ${job.insights?.executive_summary?.tldr || 'N/A'}\nKey Wins: ${job.insights?.executive_summary?.key_wins?.join(', ') || 'N/A'}`;
        }).join('\n\n');
        rest.historical_context = historical_context;
      }
    }

    const response = await axios.post(`${AI_SERVICE_URL}/ai/chat`, rest);
    res.json(response.data);
  } catch (err) {
    console.error('Chat AI proxy error:', err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to communicate with AI chat service' });
  }
});

router.post('/sql/generate', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/sql/generate`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error('SQL generation proxy error:', err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to generate SQL' });
  }
});

router.post('/sql/explain', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ai/sql/explain`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error('SQL explainer proxy error:', err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to explain SQL' });
  }
});

module.exports = router;
