import QRCode from '../models/QRCode.js';
import Scan from '../models/Scan.js';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

// @desc    Redirect to QR content and record a scan
// @route   GET /r/:id
// @access  Public
export const redirectToContent = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // If expired or exceeded scan limit, redirect to unavailable page (client will show message)
    const now = new Date();
    if (qrCode.expirationDate && now > new Date(qrCode.expirationDate)) {
      return res.redirect(`/qr/unavailable/${qrCode._id}?reason=expired`);
    }
    if (qrCode.scanLimit && qrCode.scanCount >= qrCode.scanLimit) {
      return res.redirect(`/qr/unavailable/${qrCode._id}?reason=limit`);
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

    // Create scan record for saved QR
    await Scan.create({
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

    // Redirect to the actual content
    return res.redirect(qrCode.content);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).send('Redirect failed');
  }
};

// Handle direct URL redirects like /r?u=<encoded url> (preview downloads)
export const redirectToUrl = async (req, res) => {
  try {
    const u = req.query.u;
    if (!u) return res.status(400).send('Missing url');

    const target = decodeURIComponent(u);

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

    // Create scan record without qrCode
    await Scan.create({
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
      target,
    });

    return res.redirect(target);
  } catch (error) {
    console.error('RedirectToUrl error:', error);
    return res.status(500).send('Redirect failed');
  }
};

export default { redirectToContent, redirectToUrl };

