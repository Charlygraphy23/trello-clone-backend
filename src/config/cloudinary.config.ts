import { v2 } from 'cloudinary';

export const cloudinaryConfig = v2.config({
    cloud_name: process.env.HD_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.HD_CLOUDINARY_API_KEY,
    api_secret: process.env.HD_CLOUDINARY_API_SECRET,
    secure: true
});
