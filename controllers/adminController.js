import User from '../models/User.js';
import QRCode from '../models/QRCode.js';

// @desc    Get all users with their full details and created QR codes (admin only)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsersData = async (req, res) => {
  try {
    // Get all users (exclude sensitive fields)
    const users = await User.find({}).select('-password -resetPasswordToken -resetPasswordExpires').lean();

    // Load all QR codes and group by user id
    const qrcodes = await QRCode.find({}).lean();
    const qrsByUser = qrcodes.reduce((acc, q) => {
      const uid = q.user?.toString() || 'unknown';
      (acc[uid] = acc[uid] || []).push(q);
      return acc;
    }, {});

    // Combine
    const data = users.map((u) => ({
      user: u,
      qrcodes: qrsByUser[u._id?.toString()] || [],
    }));

    return res.json({ success: true, count: users.length, data });
  } catch (error) {
    console.error('Admin getAllUsersData error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getAllUsersData };