import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Initialize Razorpay instance only when needed
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Pricing plans
const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 10, // ₹10
    features: {
      maxQRCodes: 50,
      maxScansPerQR: 1000,
      analytics: true,
      advancedAnalytics: false,
      whiteLabel: false,
      removeWatermark: false,
      passwordProtection: true,
      expirationDate: true,
      customScanLimit: true
    }
  },
  pro: {
    name: 'Pro Plan', 
    price: 15, // ₹15
    features: {
      maxQRCodes: 200,
      maxScansPerQR: 10000,
      analytics: true,
      advancedAnalytics: true,
      whiteLabel: true,
      removeWatermark: true,
      passwordProtection: true,
      expirationDate: true,
      customScanLimit: true
    }
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 12, // ₹12
    features: {
      maxQRCodes: -1, // Unlimited
      maxScansPerQR: -1, // Unlimited
      analytics: true,
      advancedAnalytics: true,
      whiteLabel: true,
      removeWatermark: true,
      passwordProtection: true,
      expirationDate: true,
      customScanLimit: true
    }
  },
  trial: {
    name: 'Trial Plan',
    price: 0, // Free trial
    features: {
      maxQRCodes: -1, // Unlimited
      maxScansPerQR: -1, // Unlimited
      analytics: true,
      advancedAnalytics: true,
      whiteLabel: true,
      removeWatermark: true,
      passwordProtection: true,
      expirationDate: true,
      customScanLimit: true
    }
  }
};

// Get available plans
export const getPlans = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      plans: PLANS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
};

// Create payment order
export const createOrder = async (req, res) => {
  try {
    const { planType, duration = 1 } = req.body; // duration in months
    const userId = req.user.id;

    if (!PLANS[planType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const plan = PLANS[planType];
    const amount = plan.price * duration * 100; // Amount in paise
    const currency = 'INR';
    // Create a short receipt (max 40 chars) using user ID substring and short timestamp
    const shortUserId = userId.slice(-8); // Last 8 chars of userId
    const shortTimestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `ord_${shortUserId}_${shortTimestamp}`;

    const options = {
      amount,
      currency,
      receipt,
      notes: {
        userId,
        planType,
        duration
      }
    };

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      userId,
      orderId: order.id,
      amount: amount / 100, // Store in rupees
      currency,
      planType,
      planDuration: duration,
      receipt,
      notes: options.notes,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
    });

    await payment.save();

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount,
        currency,
        planType,
        planName: plan.name,
        duration
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    // Find the payment record
    const payment = await Payment.findOne({ 
      orderId: razorpay_order_id,
      userId 
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSignature) {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Payment verified successfully
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // Update or create subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + payment.planDuration);

    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        userId,
        planType: payment.planType,
        startDate: new Date(),
        endDate,
        paymentId: payment._id,
        features: PLANS[payment.planType].features
      });
    } else {
      // Update existing subscription
      subscription.planType = payment.planType;
      subscription.status = 'active';
      subscription.endDate = endDate;
      subscription.paymentId = payment._id;
      subscription.features = PLANS[payment.planType].features;
      
      // Clear trial fields when upgrading to paid plan
      subscription.isTrialSubscription = false;
      subscription.trialStartDate = null;
      subscription.trialEndDate = null;
    }

    await subscription.save();

    // Update user's subscription status and clear trial fields
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: payment.planType,
      subscriptionStatus: 'active',
      // Clear trial fields when upgrading to paid plan
      isOnTrial: false,
      trialStartDate: null,
      trialEndDate: null
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        planType: subscription.planType,
        endDate: subscription.endDate,
        features: subscription.features
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Get user's current subscription
export const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId })
      .populate('paymentId', 'amount createdAt paidAt');

    if (!subscription) {
      // Return free plan details
      return res.status(200).json({
        success: true,
        subscription: {
          planType: 'free',
          status: 'active',
          endDate: null,
          features: {
            maxQRCodes: 5,
            maxScansPerQR: 100,
            customDomains: false,
            analytics: false,
            apiAccess: false,
            prioritySupport: false
          }
        }
      });
    }

    // Check if subscription is expired
    if (subscription.endDate < new Date() && subscription.planType !== 'free') {
      subscription.status = 'expired';
      subscription.planType = 'free';
      subscription.features = {
        maxQRCodes: 5,
        maxScansPerQR: 100,
        customDomains: false,
        analytics: false,
        apiAccess: false,
        prioritySupport: false
      };
      await subscription.save();

      // Update user's subscription status
      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: 'free',
        subscriptionStatus: 'expired'
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Only show successful payments and failed payments, not pending ones
    const payments = await Payment.find({ 
      userId, 
      status: { $in: ['paid', 'failed', 'refunded'] } 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ 
      userId, 
      status: { $in: ['paid', 'failed', 'refunded'] } 
    });

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription || subscription.planType === 'free') {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    // Update user's subscription status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Refresh subscription features
export const refreshSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Update subscription features with correct plan features
    subscription.features = PLANS[subscription.planType]?.features || {
      maxQRCodes: 5,
      maxScansPerQR: 100,
      analytics: false,
      advancedAnalytics: false,
      whiteLabel: false,
      removeWatermark: false,
      passwordProtection: false,
      expirationDate: false,
      customScanLimit: false,
    };

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription refreshed successfully',
      subscription
    });

  } catch (error) {
    console.error('Refresh subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing subscription',
      error: error.message
    });
  }
};