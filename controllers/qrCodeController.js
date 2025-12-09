import QRCode from '../models/QRCode.js';

// @desc    Create new QR code
// @route   POST /api/qrcodes
// @access  Private
export const createQRCode = async (req, res) => {
  try {
    const { type, content, wifiSSID, wifiPassword, wifiEncryption, size, title } = req.body;

    const qrCode = await QRCode.create({
      user: req.user._id,
      type,
      content,
      wifiSSID,
      wifiPassword,
      wifiEncryption,
      size,
      title,
    });

    res.status(201).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all QR codes for current user
// @route   GET /api/qrcodes
// @access  Private
export const getUserQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: qrCodes.length,
      qrCodes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single QR code
// @route   GET /api/qrcodes/:id
// @access  Private
export const getQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    // Make sure user owns this QR code
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update QR code
// @route   PUT /api/qrcodes/:id
// @access  Private
export const updateQRCode = async (req, res) => {
  try {
    let qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    // Make sure user owns this QR code
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    qrCode = await QRCode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete QR code
// @route   DELETE /api/qrcodes/:id
// @access  Private
export const deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    // Make sure user owns this QR code
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await qrCode.deleteOne();

    res.json({
      success: true,
      message: 'QR code deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment scan count
// @route   PUT /api/qrcodes/:id/scan
// @access  Public
export const incrementScan = async (req, res) => {
  try {
    const qrCode = await QRCode.findByIdAndUpdate(
      req.params.id,
      { $inc: { scans: 1 } },
      { new: true }
    );

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    res.json({
      success: true,
      scans: qrCode.scans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
