import fs from 'fs';
import path from 'path';

// Helper to extract base64 data and mime type
const parseDataUrl = (dataUrl) => {
  // Accept complex mime types like image/svg+xml as well as png/jpg
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matches) return null;
  return { mime: matches[1], data: matches[2] };
};

export const uploadLogo = async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) return res.status(400).json({ success: false, message: 'Invalid data URL' });

    const buffer = Buffer.from(parsed.data, 'base64');
    const maxBytes = 500 * 1024; // 500 KB
    if (buffer.length > maxBytes) {
      return res.status(400).json({ success: false, message: 'File exceeds 500KB limit' });
    }

    const ext = parsed.mime.split('/')[1] || 'png';
    const dir = path.join(process.cwd(), 'uploads', 'logos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `logo-${Date.now()}.${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.protocol + '://' + req.get('host');
    const url = `${host}/uploads/logos/${filename}`;

    return res.json({ success: true, url });
  } catch (error) {
    console.error('uploadLogo error:', error);
    // Return specific error message when possible to help diagnose uploads (non-sensitive)
    return res.status(500).json({ success: false, message: (error && error.message) ? error.message : 'Upload failed' });
  }
};

export default { uploadLogo };
