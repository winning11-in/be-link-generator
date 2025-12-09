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
      enum: ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'location', 'upi'],
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
    // QR Customization
    customization: {
      qrColor: { type: String, default: '#000000' },
      bgColor: { type: String, default: '#ffffff' },
      qrSize: { type: Number, default: 256 },
      errorLevel: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
      dotStyle: { type: String, default: 'square' },
      cornerSquareStyle: { type: String, default: 'square' },
      cornerDotStyle: { type: String, default: 'square' },
      logo: { type: String, default: null },
      logoSize: { type: Number, default: 50 },
      logoPadding: { type: Number, default: 5 },
      removeBackground: { type: Boolean, default: true },
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
