import User from '../models/User.js';
import QRCode from '../models/QRCode.js';
import Subscription from '../models/Subscription.js';

// @desc    Get all users with their full details and created QR codes (admin only)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsersData = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Load QR codes for returned users and group by user id
    const userIds = users.map((u) => u._id);
    const qrcodes = userIds.length ? await QRCode.find({ user: { $in: userIds } })
      .select('_id name type content scanCount createdAt status user')
      .lean() : [];
    const qrsByUser = qrcodes.reduce((acc, q) => {
      const uid = q.user?.toString() || 'unknown';
      (acc[uid] = acc[uid] || []).push(q);
      return acc;
    }, {});

    const data = users.map((u) => ({
      user: u,
      qrcodes: qrsByUser[u._id?.toString()] || [],
    }));

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Admin getAllUsersData error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { blocked } = req.body;

    if (typeof blocked === 'undefined') {
      return res.status(400).json({ success: false, message: 'Provide blocked boolean in body' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { blocked: !!blocked },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Admin blockUser error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete user's QR codes
    await QRCode.deleteMany({ user: userId });

    // Delete user's subscription
    await Subscription.deleteOne({ userId });

    await User.findByIdAndDelete(userId);

    return res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin endpoint to fix user limits and clean up excess QR codes
export const enforceUserLimits = async (req, res) => {
  try {
    const { dryRun = true } = req.body; // If true, only report what would be done
    
    console.log(`Starting limit enforcement (dry run: ${dryRun})...`);
    
    const issues = [];
    const fixes = [];
    
    // Get all users
    const users = await User.find({});
    
    for (const user of users) {
      const subscription = await Subscription.findOne({ userId: user._id });
      const qrCodes = await QRCode.find({ user: user._id }).sort({ createdAt: 1 }); // Oldest first
      
      let maxAllowed = 5; // Default free plan
      let planType = 'free';
      
      if (subscription && subscription.features) {
        maxAllowed = subscription.features.maxQRCodes;
        planType = subscription.planType;
      }
      
      if (maxAllowed !== -1 && qrCodes.length > maxAllowed) {
        const excess = qrCodes.length - maxAllowed;
        issues.push({
          userId: user._id,
          email: user.email,
          planType,
          maxAllowed,
          current: qrCodes.length,
          excess
        });
        
        if (!dryRun) {
          // Keep the newest QR codes, disable the oldest ones
          const qrCodesToDisable = qrCodes.slice(0, excess);
          
          for (const qr of qrCodesToDisable) {
            qr.isActive = false;
            await qr.save();
          }
          
          fixes.push({
            userId: user._id,
            email: user.email,
            disabledCount: excess
          });
        }
      }
      
      // Ensure user has subscription record
      if (!subscription) {
        issues.push({
          userId: user._id,
          email: user.email,
          issue: 'No subscription record',
          planType: 'missing'
        });
        
        if (!dryRun) {
          await Subscription.create({
            userId: user._id,
            planType: 'free',
            status: 'active',
            startDate: new Date(),
            endDate: null,
            features: {
              maxQRCodes: 5,
              maxScansPerQR: 100,
              analytics: false,
              whiteLabel: false,
              removeWatermark: false
            }
          });
          
          user.subscriptionPlan = 'free';
          user.subscriptionStatus = 'active';
          await user.save();
          
          fixes.push({
            userId: user._id,
            email: user.email,
            fix: 'Created free subscription'
          });
        }
      }
    }
    
    const response = {
      success: true,
      dryRun,
      summary: {
        totalUsers: users.length,
        usersWithIssues: issues.length,
        fixesApplied: dryRun ? 0 : fixes.length
      },
      issues,
      fixes: dryRun ? [] : fixes
    };
    
    if (dryRun) {
      response.message = 'Dry run completed. Set dryRun=false to apply fixes.';
    } else {
      response.message = 'Limits enforced successfully.';
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Enforce limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enforcing limits',
      error: error.message
    });
  }
};

// Get system stats
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQRCodes,
      totalSubscriptions,
      freeUsers,
      basicUsers,
      proUsers,
      enterpriseUsers
    ] = await Promise.all([
      User.countDocuments({}),
      QRCode.countDocuments({}),
      Subscription.countDocuments({}),
      Subscription.countDocuments({ planType: 'free' }),
      Subscription.countDocuments({ planType: 'basic' }),
      Subscription.countDocuments({ planType: 'pro' }),
      Subscription.countDocuments({ planType: 'enterprise' })
    ]);
    
    // Find users with excess QR codes
    const usersWithExcess = [];
    const subscriptions = await Subscription.find({});
    
    for (const sub of subscriptions) {
      if (sub.features && sub.features.maxQRCodes !== -1) {
        const qrCount = await QRCode.countDocuments({ user: sub.userId });
        if (qrCount > sub.features.maxQRCodes) {
          const user = await User.findById(sub.userId);
          usersWithExcess.push({
            email: user?.email,
            planType: sub.planType,
            maxAllowed: sub.features.maxQRCodes,
            current: qrCount,
            excess: qrCount - sub.features.maxQRCodes
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalQRCodes,
        totalSubscriptions,
        planDistribution: {
          free: freeUsers,
          basic: basicUsers,
          pro: proUsers,
          enterprise: enterpriseUsers
        },
        usersWithExcess: usersWithExcess.length,
        excessDetails: usersWithExcess
      }
    });
    
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system stats',
      error: error.message
    });
  }
};

export default { getAllUsersData, blockUser, deleteUser };