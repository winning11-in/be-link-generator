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

    // If this is an image QR, render a simple page that displays the image
    if (qrCode.type === 'image') {
      const imageUrl = qrCode.content;
      const html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Scanned Image</title>
            <style>
              body { margin: 0; background: #f7fafc; display:flex; align-items:center; justify-content:center; height:100vh; font-family: Arial, sans-serif }
              .card { max-width: 900px; width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(16,24,40,0.08); }
              img { width: 100%; height: auto; display: block; }
              .actions { padding: 16px; display:flex; gap:8px; }
              a.button { display:inline-block; padding:10px 14px; background:#2563eb; color:#fff; text-decoration:none; border-radius:8px }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${imageUrl}" alt="QR Image" />
              <div class="actions">
                <a class="button" href="${imageUrl}" target="_blank">Open Full Image</a>
                <a class="button" href="${imageUrl}" download>Download Image</a>
              </div>
            </div>
          </body>
        </html>`;

      return res.send(html);
    }

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

