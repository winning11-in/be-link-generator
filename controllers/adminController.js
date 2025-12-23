import User from '../models/User.js';
import QRCode from '../models/QRCode.js';

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
    const qrcodes = userIds.length ? await QRCode.find({ user: { $in: userIds } }).lean() : [];
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

export default { getAllUsersData };