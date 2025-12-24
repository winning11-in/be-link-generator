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

    await User.findByIdAndDelete(userId);

    return res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getAllUsersData, blockUser, deleteUser };