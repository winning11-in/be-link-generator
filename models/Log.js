import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      default: 'info',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    // HTTP Request details
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
    path: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    // User details
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    // Network details
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // Additional metadata
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Error details
    error: {
      stack: String,
      code: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;
