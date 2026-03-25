const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const { insightsQueue } = require('../queues/insightsQueue');

const router = express.Router();

// Multer: in-memory storage, 10 MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ALLOWED_EXTENSIONS = ['.csv', '.json', '.txt', '.log'];

function getExtension(filename) {
  const dot = filename.lastIndexOf('.');
  return dot !== -1 ? filename.slice(dot).toLowerCase() : '';
}

function parseCSV(buffer) {
  const content = buffer.toString('utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const columns = records.length > 0 ? Object.keys(records[0]) : [];
  return { columns, rows: records, rowCount: records.length };
}

function parseJSON(buffer) {
  const content = buffer.toString('utf-8');
  const data = JSON.parse(content);
  const rows = Array.isArray(data) ? data : [data];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { columns, rows, rowCount: rows.length };
}

function parseTXT(buffer) {
  const content = buffer.toString('utf-8');
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  const rows = lines.map((line, i) => ({ line_number: i + 1, content: line }));
  return { columns: ['line_number', 'content'], rows, rowCount: lines.length };
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = getExtension(req.file.originalname);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        error: `Unsupported file type: ${ext}. Supported formats: CSV, JSON, TXT`,
      });
    }

    // Parse file
    let parsed;
    try {
      if (ext === '.csv') {
        parsed = parseCSV(req.file.buffer);
      } else if (ext === '.json') {
        parsed = parseJSON(req.file.buffer);
      } else {
        parsed = parseTXT(req.file.buffer);
      }
    } catch (parseErr) {
      return res.status(400).json({
        error: `Failed to parse file: ${parseErr.message}`,
      });
    }

    const jobId = uuidv4();
    const preview = parsed.rows.slice(0, 20);

    // Extract numeric columns for chart data
    let chartData = null;
    if (parsed.columns.length > 0 && parsed.rows.length > 0) {
      const numericCols = parsed.columns.filter((col) => {
        const sample = parsed.rows.slice(0, 10);
        return sample.every(
          (row) => row[col] !== undefined && !isNaN(Number(row[col])) && row[col] !== ''
        );
      });

      if (numericCols.length > 0) {
        const labelCol = parsed.columns.find((c) => !numericCols.includes(c)) || null;
        chartData = {
          labels: labelCol,
          numericColumns: numericCols.slice(0, 4), // Limit to 4 for readability
          data: parsed.rows.slice(0, 30).map((row) => {
            const point = {};
            if (labelCol) point[labelCol] = row[labelCol];
            numericCols.slice(0, 4).forEach((col) => {
              point[col] = Number(row[col]);
            });
            return point;
          }),
        };
      }
    }

    // Store in MongoDB
    const userId = req.headers['x-user-id'] || 'anonymous';
    const job = new Job({
      jobId,
      userId,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      rowCount: parsed.rowCount,
      columns: parsed.columns,
      preview,
      rawData: parsed.rows.slice(0, 500), // Context window: first 500 rows
      chartData,
      status: 'pending',
    });

    await job.save();

    // Enqueue BullMQ job
    await insightsQueue.add('process-insights', { jobId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      filename: req.file.originalname,
      rowCount: parsed.rowCount,
      columns: parsed.columns,
      preview,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

module.exports = router;
