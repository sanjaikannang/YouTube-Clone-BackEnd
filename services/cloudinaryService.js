import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  chunk_size: 100000000,// 100 MB 
  timeout: 1000000, // 10 minutes
});

// New function for uploading videos
export const uploadVideo = async (videoBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary video upload error:', error);
            reject(new Error('Error uploading video to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(videoBuffer);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// New function for deleting videos
export const deleteVideo = async (publicId) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Cloudinary video deletion error:', error);
          reject(new Error('Error deleting video from Cloudinary'));
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// New function for uploading images
export const uploadImage = async (imageBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', ...options },
        (error, result) => {
          if (error) {
            console.error('Cloudinary image upload error:', error);
            reject(new Error('Error uploading image to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(imageBuffer);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// New function for deleting images
export const deleteImage = async (publicId) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
        if (error) {
          console.error('Cloudinary image deletion error:', error);
          reject(new Error('Error deleting image from Cloudinary'));
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};