import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';

export const config = { api: { bodyParser: false } };

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    console.log("fields:", fields);
    console.log("files:", files);

    if (err) return res.status(500).json({ error: err.message });

    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file received by server' });

    try {
      const result = await cloudinary.v2.uploader.upload(file.filepath);
      res.status(200).json({ url: result.secure_url });
    } catch (e) {
      console.log("Upload error:", e.message);
      res.status(500).json({ error: e.message });
    }
  });
}
