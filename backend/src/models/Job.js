const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    default: 'anonymous',
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  rowCount: {
    type: Number,
    default: 0,
  },
  columns: {
    type: [String],
    default: [],
  },
  preview: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending',
  },
  insights: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  error: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);
