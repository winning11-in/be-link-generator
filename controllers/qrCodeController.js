import QRCode from '../models/QRCode.js';
import Scan from '../models/Scan.js';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

// @desc    Create new QR code
// @route   POST /api/qrcodes
// @access  Private
export const createQRCode = async (req, res) => {
  try {
    const { type, content, name, template, styling, previewImage } = req.body;

    const qrCode = await QRCode.create({
      user: req.user._id,
      type,
      content,
      name,
      template,
      styling,
      previewImage,
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
// @route   POST /api/qrcodes/:id/scan
// @access  Public
export const incrementScan = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Get IP address
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               '';

    // Get location from IP
    const geo = geoip.lookup(ip.replace('::ffff:', ''));
    
    const locationData = geo ? {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.ll[0],
      longitude: geo.ll[1],
      timezone: geo.timezone,
    } : {};

    // Create scan record
    const scan = await Scan.create({
      qrCode: qrCode._id,
      browser: {
        name: result.browser.name,
        version: result.browser.version,
      },
      os: {
        name: result.os.name,
        version: result.os.version,
      },
      device: {
        type: result.device.type || 'desktop',
        vendor: result.device.vendor,
        model: result.device.model,
      },
      ip: ip.replace('::ffff:', ''),
      userAgent,
      location: locationData,
      referrer: req.headers.referer || req.headers.referrer || '',
    });

    // Increment scan count
    qrCode.scanCount += 1;
    await qrCode.save();

    res.json({
      success: true,
      scanCount: qrCode.scanCount,
      scanId: scan._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
