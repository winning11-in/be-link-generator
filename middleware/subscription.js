import Subscription from '../models/Subscription.js';
import QRCode from '../models/QRCode.js';

// Middleware to check subscription limits
export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's subscription
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      // User has free plan
      subscription = {
        planType: 'free',
        features: {
          maxQRCodes: 5,
          maxScansPerQR: 100,
          customDomains: false,
          analytics: false,
          apiAccess: false,
          prioritySupport: false
        }
      };
    }

    // Check if subscription is expired
    if (subscription.endDate && subscription.endDate < new Date() && subscription.planType !== 'free') {
      subscription.planType = 'free';
      subscription.features = {
        maxQRCodes: 5,
        maxScansPerQR: 100,
        customDomains: false,
        analytics: false,
        apiAccess: false,
        prioritySupport: false
      };
    }

    // Attach subscription to request
    req.subscription = subscription;
    
    // Check QR code creation limit for POST requests to create QR
    if (req.method === 'POST' && req.route?.path === '/') {
      const qrCodeCount = await QRCode.countDocuments({ userId });
      
      if (subscription.features.maxQRCodes !== -1 && qrCodeCount >= subscription.features.maxQRCodes) {
        return res.status(403).json({
          success: false,
          message: `QR code limit reached. Your ${subscription.planType} plan allows ${subscription.features.maxQRCodes} QR codes.`,
          upgradeRequired: true,
          currentPlan: subscription.planType
        });
      }
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription limits'
    });
  }
};

// Middleware to check if feature is available in user's plan
export const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription;
      
      if (!subscription || !subscription.features[feature]) {
        return res.status(403).json({
          success: false,
          message: `This feature is not available in your ${subscription?.planType || 'free'} plan.`,
          upgradeRequired: true,
          currentPlan: subscription?.planType || 'free',
          requiredFeature: feature
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access'
      });
    }
  };
};