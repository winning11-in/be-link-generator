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
      enum: ['url', 'text', 'email', 'wifi'],
    },
    content: {
      type: String,
      required: true,
    },
    // WiFi specific fields
    wifiSSID: {
      type: String,
    },
    wifiPassword: {
      type: String,
    },
    wifiEncryption: {
      type: String,
      enum: ['WPA', 'WEP', 'nopass'],
    },
    // QR Code settings
    size: {
      type: Number,
      default: 256,
    },
    // Metadata
    title: {
      type: String,
    },
    scans: {
      type: Number,
      default: 0,
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
