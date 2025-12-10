import mongoose from 'mongoose';

const qrTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a template name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['business', 'personal', 'payment', 'social', 'event', 'other'],
      default: 'other',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    // Template styling configuration
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
    // Additional design elements
    design: {
      pattern: { type: String, default: null },
      patternOpacity: { type: Number, default: 0.3 },
      borderRadius: { type: Number, default: 0 },
      borderColor: { type: String, default: null },
      borderWidth: { type: Number, default: 0 },
      gradient: { type: Boolean, default: false },
      gradientColor1: { type: String, default: null },
      gradientColor2: { type: String, default: null },
    },
    // Template metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const QRTemplate = mongoose.model('QRTemplate', qrTemplateSchema);

export default QRTemplate;
