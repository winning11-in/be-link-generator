import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: ['url', 'text', 'email', 'phone'],
    },
    data: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
qrCodeSchema.index({ user: 1, createdAt: -1 });

const QRCode = mongoose.model('QRCode', qrCodeSchema);

export default QRCode;
