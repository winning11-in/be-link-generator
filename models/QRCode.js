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
    // The actual QR code content/data
    content: {
      type: String,
      required: true,
    },
    // Display name for the QR code
    name: {
      type: String,
      required: true,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    previewImage: {
      type: String,
      default: null,
    },
    // Card Template Configuration
    template: {
      id: { type: String, default: 'professional-dark' },
      name: { type: String, default: 'Professional Dark' },
      backgroundColor: { type: String, default: '#1a1a2e' },
      textColor: { type: String, default: '#ffffff' },
      title: { type: String, default: 'Scan Me' },
      subtitle: { type: String, default: 'Scan to connect' },
      titleFontSize: { type: Number, default: 24 },
      subtitleFontSize: { type: Number, default: 14 },
      titleFontWeight: { type: String, enum: ['normal', 'medium', 'semibold', 'bold'], default: 'bold' },
      subtitleFontWeight: { type: String, enum: ['normal', 'medium', 'semibold', 'bold'], default: 'normal' },
      fontFamily: { type: String, default: 'Inter' },
      textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
      qrPosition: { type: String, enum: ['bottom', 'center', 'top'], default: 'bottom' },
      borderRadius: { type: Number, default: 16 },
      showGradient: { type: Boolean, default: false },
      gradientColor: { type: String, default: null },
      gradientDirection: { type: String, enum: ['to-bottom', 'to-right', 'to-bottom-right', 'to-top-right'], default: 'to-bottom' },
      padding: { type: Number, default: 24 },
      titleLetterSpacing: { type: Number, default: 0 },
      subtitleLetterSpacing: { type: Number, default: 0 },
      showBorder: { type: Boolean, default: false },
      borderColor: { type: String, default: null },
      borderWidth: { type: Number, default: 1 },
      shadowIntensity: { type: String, enum: ['none', 'light', 'medium', 'strong'], default: 'medium' },
      decorativeStyle: { type: String, enum: ['none', 'circles', 'dots', 'lines', 'geometric'], default: 'none' },
      accentColor: { type: String, default: null },
    },
    // QR Code Styling
    styling: {
      fgColor: { type: String, default: '#000000' },
      bgColor: { type: String, default: '#ffffff' },
      size: { type: Number, default: 200 },
      level: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
      includeMargin: { type: Boolean, default: true },
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
