import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const form = new IncomingForm();

  try {
    // 1. Wrap in a Promise to handle Next.js async behavior correctly
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // 2. Access file correctly (checking for array vs object)
    // Formidable v3+ uses arrays. We check both for compatibility.
    const file = Array.isArray(data.files.file) ? data.files.file[0] : data.files.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // 3. Upload to Cloudinary
    // Using file.filepath (v2/v3) or file.path (v1)
    const filePath = file.filepath || file.path;
    const result = await cloudinary.v2.uploader.upload(filePath);

    // 4. Clean up temp file
    fs.unlink(filePath, () => {});

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}