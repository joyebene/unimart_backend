import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBase64, folder = 'general_uploads') => {
  try {
    const res = await cloudinary.uploader.upload(fileBase64, {
      folder,
    });
    return res.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw new Error('Failed to upload image');
  }
};
