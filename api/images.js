import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  try {
    // This fetches the most recent 50 resources from Cloudinary
    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: '', // You can specify a folder here if you used one
      max_results: 50 
    });

    // Map the results to just send back an array of secure URLs
    const urls = result.resources.map(resource => resource.secure_url);
    
    res.status(200).json({ images: urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}