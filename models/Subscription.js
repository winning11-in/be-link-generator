import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: function() {
      return this.planType !== 'free'; // Only required for paid plans
    }
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  features: {
    maxQRCodes: {
      type: Number,
      default: 5 // Free plan limit
    },
    maxScansPerQR: {
      type: Number,
      default: 100 // Free plan limit
    },
    analytics: {
      type: Boolean,
      default: false
    },
    whiteLabel: {
      type: Boolean,
      default: false
    },
    removeWatermark: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;