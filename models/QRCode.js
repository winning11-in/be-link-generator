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
      enum: ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'location', 'upi', 'vcard', 'instagram', 'facebook', 'youtube', 'whatsapp'],
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
      qrColorGradient: { type: Object, default: null },
      bgColor: { type: String, default: '#ffffff' },
      bgColorGradient: { type: Object, default: null },
      bgImage: { type: String, default: null },
      bgImageOpacity: { type: Number, default: 1 },
      qrSize: { type: Number, default: 256 },
      errorLevel: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
      dotStyle: { type: String, default: 'square' },
      cornerSquareStyle: { type: String, default: 'square' },
      cornerDotStyle: { type: String, default: 'square' },
      logo: { type: String, default: null },
      logoSize: { type: Number, default: 50 },
      logoPadding: { type: Number, default: 5 },
      removeBackground: { type: Boolean, default: true },
      margin: { type: Number, default: 10 },
      frameOptions: { type: Object, default: null },
      shadow: { type: Boolean, default: false },
      shadowColor: { type: String, default: '#000000' },
      shadowBlur: { type: Number, default: 0 },
      borderRadius: { type: Number, default: 0 },
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
